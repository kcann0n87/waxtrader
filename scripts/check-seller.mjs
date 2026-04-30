import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SELLER_ID = "2dfab93a-c1db-4222-9f92-687b751c275c";

const { data: profile } = await sb
  .from("profiles")
  .select("*")
  .eq("id", SELLER_ID)
  .maybeSingle();
console.log("seller profile:");
console.log(profile);

console.log("\n--- Stripe Connect accounts ---");
const accounts = await stripe.accounts.list({ limit: 10 });
for (const a of accounts.data) {
  console.log(`  ${a.id}  charges=${a.charges_enabled}  payouts=${a.payouts_enabled}  details_submitted=${a.details_submitted}  email=${a.email ?? "—"}`);
}
