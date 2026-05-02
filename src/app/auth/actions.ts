"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error?: string; ok?: boolean };

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/") || "/";

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const next = String(formData.get("next") || "/welcome") || "/welcome";

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!displayName) return { error: "Pick a display name." };

  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      // Pipes ?next=... through the email confirmation link so new users
      // land on /welcome after clicking the email.
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };

  // If "Confirm email" is enabled in Supabase, no session is returned and the
  // user has to click the link in their email. If disabled, we have a session.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }
  redirect(`/login?confirm=1&next=${encodeURIComponent(next)}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Re-sends the email confirmation for a signup that didn't go through (user
 * lost the email, typo'd, etc). Always returns ok=true regardless of whether
 * the email exists, to avoid enumeration.
 */
export async function resendConfirmation(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const next = String(formData.get("next") || "/") || "/";
  if (!email) return { error: "Enter your email address." };

  const origin = await getOrigin();
  const supabase = await createClient();
  await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return { ok: true };
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };

  const origin = await getOrigin();
  const supabase = await createClient();
  // Always return ok=true even on error to avoid leaking which emails exist.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset")}`,
  });
  return { ok: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/account?password=updated");
}

export async function updateProfile(formData: FormData): Promise<AuthResult> {
  const displayName = String(formData.get("displayName") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase();

  if (!displayName) return { error: "Display name is required." };
  if (!/^[a-z0-9_]{3,32}$/.test(username)) {
    return { error: "Username must be 3-32 chars: lowercase letters, numbers, underscore." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  // Check uniqueness only if username changed.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (existing) return { error: "That username is taken." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, username })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
