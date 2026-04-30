import { NextResponse } from "next/server";
import { createClient as createSbAdmin } from "@supabase/supabase-js";
import { releaseOrderToSeller } from "@/app/actions/orders";

/**
 * Daily cron: auto-release any order that has been in `Delivered` status for
 * 2+ days without the buyer disputing or releasing manually. Triggers the
 * same Stripe Transfer logic that buyer-confirmation uses.
 *
 * Configured in vercel.json with a daily schedule. Vercel Cron sends
 *   Authorization: Bearer ${CRON_SECRET}
 * which we verify against the env var. Reject anything else so this URL
 * isn't an attack vector for releasing funds.
 *
 * Uses the SUPABASE_SERVICE_ROLE_KEY so it can read across all users
 * (the per-user RLS would only see one user's orders).
 */
export const dynamic = "force-dynamic";

const AUTO_RELEASE_DAYS = 2;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service credentials not configured" },
      { status: 503 },
    );
  }

  const supabase = createSbAdmin(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cutoff = new Date(
    Date.now() - AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: dueOrders, error } = await supabase
    .from("orders")
    .select("id, delivered_at")
    .eq("status", "Delivered")
    .eq("payment_status", "paid")
    .is("stripe_transfer_id", null)
    .lt("delivered_at", cutoff);

  if (error) {
    console.error("auto-release: query failed", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const results: { orderId: string; ok: boolean; error?: string }[] = [];
  for (const order of dueOrders ?? []) {
    const r = await releaseOrderToSeller(order.id);
    results.push({ orderId: order.id, ok: !!r.ok, error: r.error });
  }

  return NextResponse.json({
    cutoff,
    eligible: results.length,
    released: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
  });
}
