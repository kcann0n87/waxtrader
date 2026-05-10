import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  // Middleware already redirects unauth users for /account/*, but in case
  // env is missing, fall back to login.
  if (!user) redirect("/login?next=/account/settings");

  // notification_prefs is on profiles too — fetch separately rather than
  // bloating getProfile() which is used in many places that don't need it.
  const supabase = await createClient();
  const [{ data: prefRow }, { data: addressRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("notification_prefs")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_addresses")
      .select("id, name, addr1, city, state, zip, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  const prefs = (prefRow?.notification_prefs ?? {}) as Record<string, boolean>;

  const addresses = (addressRows ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    addr1: a.addr1,
    city: a.city,
    state: a.state,
    zip: a.zip,
    isDefault: a.is_default,
  }));

  return (
    <SettingsClient
      initialDisplayName={profile?.display_name ?? user.email?.split("@")[0] ?? ""}
      initialUsername={profile?.username ?? ""}
      email={user.email ?? ""}
      initialAddresses={addresses}
      initialPrefs={{
        order_emails: prefs.order_emails !== false,
        bid_emails: prefs.bid_emails !== false,
        message_emails: prefs.message_emails !== false,
        digest_emails: prefs.digest_emails !== false,
        marketing_emails: prefs.marketing_emails === true,
      }}
    />
  );
}
