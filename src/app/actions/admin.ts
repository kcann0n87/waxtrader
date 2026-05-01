"use server";

import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { releaseOrderToSeller } from "@/app/actions/orders";

type Result = { ok?: boolean; error?: string; data?: unknown };

/**
 * Refund an order's charge in full. Updates the order to Canceled +
 * payment_status=refunded. Idempotent — refusing if a transfer has already
 * fired (use Stripe directly for that case).
 */
export async function adminRefundOrder(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };
  if (!stripe) return { error: "Stripe not configured" };

  const sb = serviceRoleClient();
  const { data: order } = await sb
    .from("orders")
    .select("id, stripe_charge_id, stripe_transfer_id, payment_status, status, total_cents")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Order not found." };
  if (!order.stripe_charge_id) return { error: "No charge to refund." };
  if (order.stripe_transfer_id)
    return {
      error:
        "Order has been released to seller — refund via Stripe directly + recover from seller.",
    };
  if (order.payment_status === "refunded")
    return { error: "Already refunded." };

  try {
    const refund = await stripe.refunds.create({
      charge: order.stripe_charge_id,
      reason: "requested_by_customer",
      metadata: { admin_id: admin.id, admin_reason: reason },
    });
    await sb
      .from("orders")
      .update({
        payment_status: "refunded",
        status: "Canceled",
        canceled_at: new Date().toISOString(),
        cancel_reason: reason,
      })
      .eq("id", orderId);
    await logAdminAction(admin.id, "refund_order", "order", orderId, {
      reason,
      refund_id: refund.id,
      amount_cents: order.total_cents,
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, data: { refund_id: refund.id } };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("adminRefundOrder failed:", e);
    return { error: `Refund failed: ${message}` };
  }
}

/**
 * Force-release escrow to the seller (skips the 2-day wait, bypasses
 * buyer confirmation). Use when buyer is unresponsive or in a resolved
 * dispute that favors the seller.
 */
export async function adminForceReleaseOrder(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const result = await releaseOrderToSeller(orderId);
  if (result.error) return { error: result.error };

  await logAdminAction(admin.id, "force_release_order", "order", orderId, {
    reason,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Cancel an order without refunding (for orders that never charged, or
 * that already refunded but need status cleanup).
 */
export async function adminCancelOrder(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { error } = await sb
    .from("orders")
    .update({
      status: "Canceled",
      canceled_at: new Date().toISOString(),
      cancel_reason: reason,
    })
    .eq("id", orderId);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "cancel_order", "order", orderId, { reason });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Resolve a dispute. Outcomes:
 *   - refund_buyer: full refund to buyer, order canceled
 *   - release_seller: dispute dismissed, force-release escrow
 *   - partial: partial refund, remaining released to seller
 */
export async function adminResolveDispute(
  disputeId: string,
  outcome: "refund_buyer" | "release_seller" | "partial",
  notes: string,
  partialRefundCents?: number,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { data: dispute } = await sb
    .from("disputes")
    .select("id, order_id, status")
    .eq("id", disputeId)
    .maybeSingle();
  if (!dispute) return { error: "Dispute not found." };
  if (dispute.status === "Resolved")
    return { error: "Dispute already resolved." };

  let actionResult: Result;
  if (outcome === "refund_buyer") {
    actionResult = await adminRefundOrder(dispute.order_id, `dispute ${disputeId}: ${notes}`);
  } else if (outcome === "release_seller") {
    actionResult = await adminForceReleaseOrder(
      dispute.order_id,
      `dispute ${disputeId}: ${notes}`,
    );
  } else {
    // Partial — issue partial refund, release remainder
    if (!stripe) return { error: "Stripe not configured" };
    if (!partialRefundCents || partialRefundCents <= 0)
      return { error: "Specify partialRefundCents > 0" };
    const { data: order } = await sb
      .from("orders")
      .select("stripe_charge_id, total_cents")
      .eq("id", dispute.order_id)
      .maybeSingle();
    if (!order?.stripe_charge_id) return { error: "No charge to refund." };
    if (partialRefundCents >= order.total_cents)
      return { error: "Partial refund must be less than total." };
    try {
      const refund = await stripe.refunds.create({
        charge: order.stripe_charge_id,
        amount: partialRefundCents,
        reason: "requested_by_customer",
        metadata: { admin_id: admin.id, dispute_id: disputeId },
      });
      // Release remainder to seller (the existing release logic handles
      // tier-fee math on the remaining amount via the charge's net).
      const release = await releaseOrderToSeller(dispute.order_id);
      actionResult = { ok: true, data: { refund_id: refund.id, release } };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { error: `Partial refund failed: ${message}` };
    }
  }

  if (actionResult.error) return actionResult;

  await sb
    .from("disputes")
    .update({
      status: "Resolved",
      resolution: outcome,
      resolved_at: new Date().toISOString(),
      admin_notes: notes,
    })
    .eq("id", disputeId);

  await logAdminAction(admin.id, `resolve_dispute_${outcome}`, "dispute", disputeId, {
    notes,
    partialRefundCents,
  });
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  return { ok: true };
}

/**
 * Create a new SKU in the catalog.
 */
export async function adminCreateSku(input: {
  slug: string;
  year: number;
  brand: string;
  set_name: string;
  product: string;
  sport: "NBA" | "MLB" | "NFL" | "NHL";
  release_date: string;
  description?: string;
  image_url?: string;
  gradient_from?: string;
  gradient_to?: string;
}): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { data, error } = await sb
    .from("skus")
    .insert({
      slug: input.slug,
      year: input.year,
      brand: input.brand,
      set_name: input.set_name,
      product: input.product,
      sport: input.sport,
      release_date: input.release_date,
      description: input.description ?? "",
      image_url: input.image_url ?? null,
      gradient_from: input.gradient_from ?? "#475569",
      gradient_to: input.gradient_to ?? "#0f172a",
    })
    .select("id, slug")
    .maybeSingle();
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "create_sku", "sku", data?.id ?? input.slug, {
    slug: input.slug,
  });
  revalidatePath("/admin/catalog");
  return { ok: true, data };
}

/**
 * Update an existing SKU (any subset of fields).
 */
export async function adminUpdateSku(
  id: string,
  patch: Partial<{
    year: number;
    brand: string;
    set_name: string;
    product: string;
    sport: "NBA" | "MLB" | "NFL" | "NHL";
    release_date: string;
    description: string;
    image_url: string | null | undefined;
    gradient_from: string;
    gradient_to: string;
  }>,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { error } = await sb.from("skus").update(patch).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "update_sku", "sku", id, { patch });
  revalidatePath("/admin/catalog");
  revalidatePath(`/admin/catalog/${id}`);
  return { ok: true };
}

/**
 * Delete a SKU. Refuses if any listings reference it.
 */
export async function adminDeleteSku(id: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { count } = await sb
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("sku_id", id);
  if ((count ?? 0) > 0)
    return { error: `Cannot delete: ${count} active listing(s) reference this SKU.` };

  const { error } = await sb.from("skus").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "delete_sku", "sku", id);
  revalidatePath("/admin/catalog");
  return { ok: true };
}
