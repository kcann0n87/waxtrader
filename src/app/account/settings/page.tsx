import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/supabase/user";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  // Middleware already redirects unauth users for /account/*, but in case
  // env is missing, fall back to login.
  if (!user) redirect("/login?next=/account/settings");

  return (
    <SettingsClient
      initialDisplayName={profile?.display_name ?? user.email?.split("@")[0] ?? ""}
      initialUsername={profile?.username ?? ""}
      email={user.email ?? ""}
    />
  );
}
