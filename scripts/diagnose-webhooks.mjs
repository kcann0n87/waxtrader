#!/usr/bin/env node
// Diagnose Stripe webhook config: list endpoints, their events, recent deliveries.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY in env.");
  process.exit(1);
}
const stripe = new Stripe(key);

console.log("\n=== ACCOUNT ===");
try {
  const acct = await stripe.accounts.retrieve();
  console.log(`Account: ${acct.id}`);
  console.log(`Country: ${acct.country}, Mode: ${key.startsWith("sk_test_") ? "TEST" : "LIVE"}`);
} catch (e) {
  console.error("accounts.retrieve failed:", e.message);
}

console.log("\n=== WEBHOOK ENDPOINTS ===");
const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
if (endpoints.data.length === 0) {
  console.log("⚠  NO WEBHOOK ENDPOINTS REGISTERED.");
}
for (const ep of endpoints.data) {
  console.log(`\n[${ep.id}]  ${ep.status === "enabled" ? "✓" : "✗"} ${ep.status}`);
  console.log(`  url:    ${ep.url}`);
  console.log(`  scope:  ${ep.application ? "Connected accounts" : "Your account (platform)"}`);
  console.log(`  api_version: ${ep.api_version ?? "(latest)"}`);
  console.log(`  events: ${ep.enabled_events.length === 1 && ep.enabled_events[0] === "*" ? "ALL EVENTS (*)" : ep.enabled_events.join(", ")}`);
}

console.log("\n=== RECENT EVENTS (last 20) ===");
const events = await stripe.events.list({ limit: 20 });
for (const ev of events.data) {
  const ts = new Date(ev.created * 1000).toISOString();
  console.log(`  ${ts}  ${ev.type.padEnd(36)} ${ev.id}`);
}

console.log("\n=== RECENT CHARGES (last 10) ===");
const charges = await stripe.charges.list({ limit: 10 });
for (const c of charges.data) {
  const ts = new Date(c.created * 1000).toISOString();
  console.log(`  ${ts}  ${c.status.padEnd(10)} $${(c.amount/100).toFixed(2)} ${c.id}  pi=${c.payment_intent ?? "—"}  meta.order=${c.metadata?.waxdepot_order_id ?? "—"}`);
}

console.log("\n=== RECENT CHECKOUT SESSIONS (last 10) ===");
const sessions = await stripe.checkout.sessions.list({ limit: 10 });
for (const s of sessions.data) {
  const ts = new Date(s.created * 1000).toISOString();
  console.log(`  ${ts}  status=${s.status} payment_status=${s.payment_status}  ${s.id}  meta.order=${s.metadata?.waxdepot_order_id ?? "—"}`);
}

console.log("\nDone.");
