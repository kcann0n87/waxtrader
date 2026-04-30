#!/usr/bin/env node
/**
 * Test the Stripe Transfer flow that fires when buyer confirms delivery
 * (or the cron auto-releases). Replicates the core logic of
 * releaseOrderToSeller() from src/app/actions/orders.ts using service-role
 * Supabase + the Stripe secret key.
 *
 * Usage: node --env-file=.env.local scripts/test-release.mjs <order-id>
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const orderId = process.argv[2] || "WM-168429";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const TIER_FEE_BPS = { Starter: 1000, Pro: 800, Elite: 600 };

console.log(`\n=== Releasing ${orderId} ===\n`);

const { data: order, error: orderErr } = await supabase
  .from("orders")
  .select("*")
  .eq("id", orderId)
  .maybeSingle();
if (orderErr || !order) {
  console.error("Order not found:", orderErr?.message);
  process.exit(1);
}
console.log(`status=${order.status} payment=${order.payment_status} charge=${order.stripe_charge_id} transfer=${order.stripe_transfer_id}`);
if (order.stripe_transfer_id) {
  console.log("✓ Already released — nothing to do.");
  process.exit(0);
}
if (!order.stripe_charge_id) {
  console.error("✗ No charge id on order — can't transfer.");
  process.exit(1);
}
if (!["Delivered", "Released"].includes(order.status)) {
  console.error(`✗ Order is in ${order.status}, expected Delivered.`);
  process.exit(1);
}

// Look up seller's connected account + tier
const { data: seller, error: sellerErr } = await supabase
  .from("profiles")
  .select("stripe_account_id")
  .eq("id", order.seller_id)
  .maybeSingle();
if (sellerErr) console.error("seller lookup err:", sellerErr.message);
if (!seller?.stripe_account_id) {
  console.error("✗ Seller has no Stripe connected account id.");
  process.exit(1);
}
const tier = "Starter";
const feeBps = TIER_FEE_BPS[tier] ?? 1000;
const feeCents = Math.floor((order.total_cents * feeBps) / 10000);
const transferCents = order.total_cents - feeCents;

console.log(`\nTier: ${tier} (${feeBps / 100}% fee)`);
console.log(`Total:    $${(order.total_cents / 100).toFixed(2)}`);
console.log(`Fee:     -$${(feeCents / 100).toFixed(2)}`);
console.log(`Transfer: $${(transferCents / 100).toFixed(2)} → ${seller.stripe_account_id}`);

console.log("\nFiring Stripe Transfer...");
const transfer = await stripe.transfers.create({
  amount: transferCents,
  currency: "usd",
  destination: seller.stripe_account_id,
  source_transaction: order.stripe_charge_id,
  metadata: { waxdepot_order_id: orderId },
});
console.log(`  ✓ ${transfer.id}`);

const { error: updErr } = await supabase
  .from("orders")
  .update({
    stripe_transfer_id: transfer.id,
    status: "Released",
    released_at: new Date().toISOString(),
  })
  .eq("id", orderId);
if (updErr) {
  console.error("✗ DB update failed:", updErr.message);
  process.exit(1);
}

console.log("\n✓ Order flipped to Released.\n");
