"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { serviceRoleClient } from "@/lib/supabase/admin";

type Result = { ok?: boolean; error?: string; data?: unknown };

/**
 * Server actions for the partner / referral system.
 *
 * - Anyone-can-call: attribute a new profile to a partner (used by
 *   signup flow, gates on the cookie being valid + the partner
 *   being active).
 * - Admin-only: create / update / list partners + record manual
 *   payouts.
 *
 * Earnings are computed from a JOIN on orders × profiles rather
 * than stored on the partner row, so changing the commission_rate
 * mid-relationship retroactively applies. Add a column-snapshot if
 * partners ever complain that the math shifted under them.
 */

/**
 * Called by the signup flow once a profile exists. Reads the
 * `waxdepot_ref` cookie, looks up the partner, attaches the link.
 * No-ops if cookie missing, code invalid, partner inactive, or
 * profile already has a referrer. Safe to call unconditionally.
 */
export async function attributeSignupToPartner(
  userId: string,
  refCode: string | null | undefined,
): Promise<Result> {
  if (!refCode) return { ok: true };

  const sb = serviceRoleClient();

  // Don't overwrite an existing attribution. Once attributed,
  // permanent.
  const { data: profile } = await sb
    .from("profiles")
    .select("referred_by_partner_id")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.referred_by_partner_id) return { ok: true };

  const { data: partner } = await sb
    .from("partners")
    .select("id, is_active")
    .eq("code", refCode.toUpperCase())
    .maybeSingle();
  if (!partner || !partner.is_active) return { ok: true };

  await sb
    .from("profiles")
    .update({
      referred_by_partner_id: partner.id,
      referred_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { ok: true };
}

// ---------------------------------------------------------------
// Admin-only actions
// ---------------------------------------------------------------

export async function adminCreatePartner(input: {
  code: string;
  name: string;
  email?: string;
  notes?: string;
  commissionRate?: number; // 0..0.5
  commissionWindowDays?: number;
}): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (!/^[A-Z0-9_-]{2,32}$/.test(code))
    return {
      error:
        "Code must be 2-32 chars: letters, numbers, hyphen, underscore.",
    };
  if (!name) return { error: "Name is required." };
  const rate = input.commissionRate ?? 0.2;
  if (!Number.isFinite(rate) || rate < 0 || rate > 0.5)
    return { error: "Commission rate must be between 0 and 0.5 (50%)." };
  const window =
    input.commissionWindowDays ?? 180;
  if (!Number.isInteger(window) || window < 1 || window > 36500)
    return { error: "Window must be a positive integer (days)." };

  const sb = serviceRoleClient();
  const { data, error } = await sb
    .from("partners")
    .insert({
      code,
      name,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
      commission_rate: rate,
      commission_window_days: window,
    })
    .select("id, code")
    .maybeSingle();
  if (error) {
    if (error.code === "23505")
      return { error: `Code "${code}" is already taken.` };
    return { error: error.message };
  }
  revalidatePath("/admin/partners");
  return { ok: true, data };
}

export async function adminUpdatePartner(
  id: string,
  patch: Partial<{
    name: string;
    email: string | null;
    notes: string | null;
    commissionRate: number;
    commissionWindowDays: number;
    isActive: boolean;
  }>,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.email !== undefined) update.email = patch.email?.trim() || null;
  if (patch.notes !== undefined) update.notes = patch.notes?.trim() || null;
  if (patch.commissionRate !== undefined) {
    if (patch.commissionRate < 0 || patch.commissionRate > 0.5)
      return { error: "Commission rate must be 0-0.5." };
    update.commission_rate = patch.commissionRate;
  }
  if (patch.commissionWindowDays !== undefined) {
    if (patch.commissionWindowDays < 1 || patch.commissionWindowDays > 36500)
      return { error: "Window must be 1-36500 days." };
    update.commission_window_days = patch.commissionWindowDays;
  }
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { error } = await sb.from("partners").update(update).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${id}`);
  return { ok: true };
}

export async function adminRecordPartnerPayout(input: {
  partnerId: string;
  amountCents: number;
  periodThrough: string; // ISO datetime — only orders up through this date count toward this payout
  notes?: string;
}): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };
  if (!input.partnerId) return { error: "Missing partnerId." };
  if (!Number.isInteger(input.amountCents) || input.amountCents < 0)
    return { error: "amount_cents must be a non-negative integer." };

  const sb = serviceRoleClient();
  const { error } = await sb.from("partner_payouts").insert({
    partner_id: input.partnerId,
    amount_cents: input.amountCents,
    period_through: input.periodThrough,
    notes: input.notes ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/partners/${input.partnerId}`);
  return { ok: true };
}
