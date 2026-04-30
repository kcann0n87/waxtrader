#!/usr/bin/env node
// Recreate the webhook with a fresh signing secret. Writes the new secret to
// /tmp/new-webhook-secret so a follow-up command can push it to Vercel.
// Then deletes the old endpoint so events flow through the new one only.
import Stripe from "stripe";
import { writeFileSync } from "node:fs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const URL = "https://waxdepot.io/api/stripe/webhook";
const EVENTS = [
  "account.updated",
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "transfer.created",
  "transfer.reversed",
];

console.log("Listing existing endpoints…");
const list = await stripe.webhookEndpoints.list({ limit: 20 });
const old = list.data.filter((e) => e.url === URL);
for (const o of old) console.log(`  found existing: ${o.id} (events: ${o.enabled_events.length})`);

console.log("\nCreating new endpoint…");
const created = await stripe.webhookEndpoints.create({
  url: URL,
  enabled_events: EVENTS,
  api_version: "2026-04-22.dahlia",
  description: "WaxDepot platform events (auto-rotated)",
});
console.log(`  → ${created.id}`);

writeFileSync("/tmp/new-webhook-secret", created.secret ?? "");
console.log(`  secret written to /tmp/new-webhook-secret (${(created.secret ?? "").length} chars)`);

console.log("\nDeleting old endpoint(s)…");
for (const o of old) {
  await stripe.webhookEndpoints.del(o.id);
  console.log(`  ✓ deleted ${o.id}`);
}

console.log("\nDone.");
