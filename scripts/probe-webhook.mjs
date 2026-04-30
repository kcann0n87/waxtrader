#!/usr/bin/env node
// Build a properly-signed Stripe-style payload and POST it to the production
// webhook to see exactly what status code and body the deployed handler returns.
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";

const secret = readFileSync("/tmp/new-webhook-secret", "utf8").trim();

// Use a real recent checkout.session.completed event payload
const payload = JSON.stringify({
  id: "evt_test_webhook_probe",
  object: "event",
  api_version: "2026-04-22.dahlia",
  created: Math.floor(Date.now() / 1000),
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_probe",
      object: "checkout.session",
      payment_intent: "pi_test_probe",
      payment_status: "paid",
      status: "complete",
      metadata: { waxdepot_order_id: "WM-DOES-NOT-EXIST" },
    },
  },
});

const ts = Math.floor(Date.now() / 1000);
const signedPayload = `${ts}.${payload}`;
const sig = createHmac("sha256", secret).update(signedPayload).digest("hex");
const stripeSig = `t=${ts},v1=${sig}`;

console.log("Posting signed test event…");
const res = await fetch("https://waxdepot.io/api/stripe/webhook", {
  method: "POST",
  headers: { "Content-Type": "application/json", "stripe-signature": stripeSig },
  body: payload,
});
const body = await res.text();
console.log(`status: ${res.status}`);
console.log(`body:   ${body}`);
