#!/usr/bin/env node
// Update the existing webhook endpoint to subscribe to all the events
// the handler in src/app/api/stripe/webhook/route.ts cares about.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}
const stripe = new Stripe(key);

const REQUIRED_EVENTS = [
  "account.updated",
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "transfer.created",
  "transfer.reversed",
];

const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
const target = endpoints.data.find((e) => e.url === "https://waxdepot.io/api/stripe/webhook");
if (!target) {
  console.error("No endpoint pointing at https://waxdepot.io/api/stripe/webhook found.");
  process.exit(1);
}

console.log(`Updating ${target.id} (${target.url})…`);
console.log(`Before: ${target.enabled_events.join(", ")}`);

const updated = await stripe.webhookEndpoints.update(target.id, {
  enabled_events: REQUIRED_EVENTS,
});
console.log(`After:  ${updated.enabled_events.join(", ")}`);
console.log("\n✓ Webhook updated.");
