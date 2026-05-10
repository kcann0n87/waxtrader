"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok?: boolean; error?: string };

/**
 * Server actions for the user's saved-address list on the account
 * settings page. Backed by the user_addresses table from migration
 * 0001 — RLS scopes every row to the owning user, so we don't need
 * service-role for these (auth.uid() is enough).
 */

export async function addAddress(input: {
  name: string;
  addr1: string;
  city: string;
  state: string;
  zip: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const name = input.name.trim();
  const addr1 = input.addr1.trim();
  const city = input.city.trim();
  const state = input.state.trim().toUpperCase();
  const zip = input.zip.trim();

  if (!name) return { error: "Name is required." };
  if (!addr1) return { error: "Street address is required." };
  if (!city) return { error: "City is required." };
  if (!/^[A-Z]{2}$/.test(state))
    return { error: "State must be a 2-letter US code (e.g. TX)." };
  if (!/^\d{5}(-\d{4})?$/.test(zip))
    return { error: "Zip must be 5 digits or 5+4 (e.g. 78701 or 78701-1234)." };

  // First address auto-becomes default. Otherwise default stays where
  // it is until the user picks a different one.
  const { count } = await supabase
    .from("user_addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("user_addresses").insert({
    user_id: user.id,
    name,
    addr1,
    city,
    state,
    zip,
    is_default: (count ?? 0) === 0,
  });
  if (error) return { error: error.message };

  revalidatePath("/account/settings");
  return { ok: true };
}

export async function deleteAddress(addressId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/account/settings");
  return { ok: true };
}

export async function setDefaultAddress(addressId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  // Clear default on every other address first, then set on the
  // chosen one. Two writes since Postgres has no "set this row to
  // true and others to false in one statement" without a CASE.
  const { error: clearErr } = await supabase
    .from("user_addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);
  if (clearErr) return { error: clearErr.message };

  const { error: setErr } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);
  if (setErr) return { error: setErr.message };

  revalidatePath("/account/settings");
  return { ok: true };
}
