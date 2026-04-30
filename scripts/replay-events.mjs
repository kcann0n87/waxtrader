#!/usr/bin/env node
// Replay the most recent checkout.session.completed event to the webhook.
// Run after fixing the webhook subscription so existing paid orders flip to InEscrow.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error("Missing STRIPE_SECRET_KEY"); process.exit(1); }
const stripe = new Stripe(key);

const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
const target = endpoints.data.find((e) => e.url === "https://waxdepot.io/api/stripe/webhook");
if (!target) { console.error("No matching endpoint"); process.exit(1); }

const events = await stripe.events.list({ limit: 30 });
const toReplay = events.data.filter((e) =>
  ["checkout.session.completed", "payment_intent.succeeded"].includes(e.type)
);

console.log(`Replaying ${toReplay.length} events to ${target.id} (${target.url})…\n`);
for (const ev of toReplay) {
  try {
    await stripe.events.resend(ev.id, { webhook_endpoint: target.id });
    console.log(`  ✓ ${ev.type.padEnd(30)} ${ev.id}`);
  } catch (e) {
    console.log(`  ✗ ${ev.type.padEnd(30)} ${ev.id}  -- ${e.message}`);
  }
}
console.log("\nDone. Watch the order — it should flip to InEscrow within seconds.");
