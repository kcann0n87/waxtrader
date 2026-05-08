import { NextResponse } from "next/server";
import { createClient as createSbAdmin } from "@supabase/supabase-js";

/**
 * Daily cron: cancel orders that were created for a Stripe Checkout session
 * but never paid. Without this, abandoned cart-checkout flows leak listing
 * inventory — the order sits as Charged + payment_status=pending forever
 * and the underlying listing's quantity stays decremented (or marked Sold)
 * even though no money came in.
 *
 * What's stale:
 *   - status = 'Charged'
 *   - payment_status = 'pending' (so it never made it to InEscrow via webhook)
 *   - placed_at older than 36 hours (gives buyers time to finish a long
 *     payment flow or come back the next morning)
 *
 * What we do per stale order:
 *   1. Mark status=Canceled, payment_status=expired, cancel_reason set
 *   2. Restore listing.quantity (and flip status back to Active if it was
 *      Sold). Skipped for bid-accepted orders that pre-decremented qty
 *      via acceptBid — wait, we DO restore those too because acceptBid
 *      decremented. The cancelOrder action handles this same case.
 *   3. Best-effort notify the buyer
 *
 * Auth: Bearer ${CRON_SECRET} like the other crons.
 */
export const dynamic = "force-dynamic";

const STALE_HOURS = 36;

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

  const sb = createSbAdmin(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cutoff = new Date(
    Date.now() - STALE_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const now = new Date().toISOString();

  // Pull stale orders + their listing pointer so we can restore inventory
  // in one pass. Cap at 500 per run.
  const { data: stale, error: selectErr } = await sb
    .from("orders")
    .select("id, buyer_id, listing_id, qty, sku:skus!orders_sku_id_fkey(year, brand, product)")
    .eq("status", "Charged")
    .eq("payment_status", "pending")
    .lt("placed_at", cutoff)
    .limit(500);

  if (selectErr) {
    console.error("cleanup-stale-checkouts select failed:", selectErr);
    return NextResponse.json({ error: "Select failed" }, { status: 500 });
  }
  if (!stale || stale.length === 0) {
    return NextResponse.json({ ok: true, canceled: 0 });
  }

  const cancelReason = "Auto-canceled — payment never completed";
  const results: { orderId: string; ok: boolean; error?: string }[] = [];

  for (const order of stale) {
    try {
      // 1. Cancel the order
      const { error: updErr } = await sb
        .from("orders")
        .update({
          status: "Canceled",
          payment_status: "expired",
          canceled_at: now,
          cancel_reason: cancelReason,
          canceled_by: "admin",
        })
        .eq("id", order.id);
      if (updErr) {
        results.push({ orderId: order.id, ok: false, error: updErr.message });
        continue;
      }

      // 2. Restore listing inventory. If listing was marked Sold (qty reached
      // 0 and consume_listing_quantity flipped it), bump it back to Active.
      if (order.listing_id) {
        const { data: listing } = await sb
          .from("listings")
          .select("quantity, status")
          .eq("id", order.listing_id)
          .maybeSingle();
        if (listing) {
          await sb
            .from("listings")
            .update({
              quantity: (listing.quantity ?? 0) + (order.qty ?? 1),
              status: "Active",
              updated_at: now,
            })
            .eq("id", order.listing_id);
        }
      }

      // 3. Notify the buyer
      const sku = Array.isArray(order.sku) ? order.sku[0] : order.sku;
      const productTitle = sku
        ? `${sku.year} ${sku.brand} ${sku.product}`
        : `order ${order.id}`;
      await sb.from("notifications").insert({
        user_id: order.buyer_id,
        type: "order-canceled",
        title: "Order canceled — payment timed out",
        body: `${productTitle} was held for ${STALE_HOURS}h waiting on payment. The listing has been re-opened — feel free to retry.`,
        href: `/account/orders/${order.id}`,
      });

      results.push({ orderId: order.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ orderId: order.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    cutoff,
    candidates: stale.length,
    canceled: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
  });
}
