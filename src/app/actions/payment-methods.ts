"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

type Result = { ok?: boolean; error?: string };

/**
 * Settings page → "Add a card" flow. Saved cards live on the user's
 * Stripe Customer object (NOT in our DB) — that way card last4 / exp
 * / brand are always fresh from Stripe and we never store card data.
 *
 * Flow:
 *   1. settings page → click "Add a card"
 *   2. createCardSetupSession() ensures the user has a stripe_customer_id
 *      (creates one lazily), creates a Checkout session in mode="setup",
 *      returns the URL
 *   3. client redirects to Stripe's hosted checkout
 *   4. user enters card → Stripe attaches it to the Customer object
 *   5. Stripe redirects back to /account/settings
 *   6. listSavedCards() reads from Stripe customer.list_payment_methods
 *      next time the page renders
 */

async function getOrCreateStripeCustomer(): Promise<
  | { customerId: string; userId: string; userEmail: string | null }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };
  if (!stripe) return { error: "Stripe is not configured." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    return {
      customerId: profile.stripe_customer_id,
      userId: user.id,
      userEmail: user.email ?? null,
    };
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: profile?.display_name ?? undefined,
    metadata: { waxdepot_user_id: user.id },
  });

  // Service role to write the customer id back — RLS may forbid users
  // from updating their own profiles depending on policy.
  const admin = serviceRoleClient();
  await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  return {
    customerId: customer.id,
    userId: user.id,
    userEmail: user.email ?? null,
  };
}

export async function createCardSetupSession(): Promise<
  Result & { url?: string }
> {
  const ctx = await getOrCreateStripeCustomer();
  if ("error" in ctx) return { error: ctx.error };
  if (!stripe) return { error: "Stripe is not configured." };

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://waxdepot.io";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      payment_method_types: ["card"],
      customer: ctx.customerId,
      success_url: `${origin}/account/settings?card=added`,
      cancel_url: `${origin}/account/settings?card=canceled`,
    });
    if (!session.url) return { error: "Stripe didn't return a setup URL." };
    return { ok: true, url: session.url };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Stripe error: ${message}` };
  }
}

/**
 * Pull the current set of saved cards from Stripe. Called by the
 * settings page server component on every render — no DB sync needed
 * since Stripe is the source of truth for card metadata.
 */
export async function listSavedCards(): Promise<
  | {
      cards: Array<{
        id: string;
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
        isDefault: boolean;
      }>;
      error?: never;
    }
  | { cards?: never; error: string }
> {
  if (!stripe) return { error: "Stripe is not configured." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  // No customer yet = no cards. Don't error — empty state is normal.
  if (!profile?.stripe_customer_id) return { cards: [] };

  try {
    const customer = (await stripe.customers.retrieve(
      profile.stripe_customer_id,
    )) as { invoice_settings?: { default_payment_method?: string | null } };
    const defaultPmId =
      customer.invoice_settings?.default_payment_method ?? null;

    const list = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: "card",
      limit: 20,
    });

    const cards = list.data
      .map((pm) => {
        if (!pm.card) return null;
        return {
          id: pm.id,
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
          isDefault: pm.id === defaultPmId,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return { cards };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Stripe error: ${message}` };
  }
}

export async function deleteSavedCard(paymentMethodId: string): Promise<Result> {
  if (!stripe) return { error: "Stripe is not configured." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  // Verify the PM actually belongs to this user's customer before
  // detaching — otherwise a malicious user could detach someone else's
  // card by guessing pm_xxx ids.
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.stripe_customer_id)
    return { error: "No customer record." };

  try {
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== profile.stripe_customer_id)
      return { error: "This card doesn't belong to your account." };

    await stripe.paymentMethods.detach(paymentMethodId);
    revalidatePath("/account/settings");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Stripe error: ${message}` };
  }
}

export async function setDefaultSavedCard(
  paymentMethodId: string,
): Promise<Result> {
  if (!stripe) return { error: "Stripe is not configured." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.stripe_customer_id)
    return { error: "No customer record." };

  try {
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== profile.stripe_customer_id)
      return { error: "This card doesn't belong to your account." };

    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    revalidatePath("/account/settings");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Stripe error: ${message}` };
  }
}
