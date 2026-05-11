"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { attributeSignupToPartner } from "./../actions/partners";

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

  // Referral attribution. If this visitor landed via ?ref=CODE
  // earlier, the middleware stored a cookie; now that we have a
  // user.id (even without a session yet — confirm-email flow), wire
  // it permanently to the partner. Idempotent + safe to call when
  // cookie missing.
  if (data.user) {
    const cookieStore = await cookies();
    const refCode = cookieStore.get("waxdepot_ref")?.value;
    if (refCode) {
      await attributeSignupToPartner(data.user.id, refCode);
      // Clear the cookie so a future visitor on the same device
      // doesn't keep getting attributed.
      cookieStore.delete("waxdepot_ref");
    }
  }

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

/**
 * Verify a token_hash from an email link. Used by /auth/confirm when
 * the email link puts the token in a URL hash fragment (#token_hash=...
 * &type=...) instead of a query string. Browsers don't send hash
 * fragments to servers, so Gmail's link prefetcher hits the bare URL
 * /auth/confirm with no token attached → can't consume anything. The
 * real user's browser runs JS, reads the hash, and posts here to
 * actually verify.
 *
 * type is the Supabase OtpType ('invite' | 'magiclink' | 'recovery'
 * | 'email_change' | 'signup' | 'email').
 */
export async function verifyTokenHash(input: {
  tokenHash: string;
  type: string;
}): Promise<AuthResult> {
  const tokenHash = (input.tokenHash ?? "").trim();
  const type = (input.type ?? "").trim();
  if (!tokenHash) return { error: "Missing token." };
  // Whitelist the types we expect — anything else likely indicates a
  // malformed link.
  const validTypes = new Set([
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "signup",
    "email",
  ]);
  if (!validTypes.has(type)) return { error: "Invalid link type." };

  const supabase = await createClient();
  // verifyOtp's token_hash branch only accepts EmailOtpType — narrow
  // explicitly so TypeScript is happy.
  type EmailOtpType =
    | "invite"
    | "magiclink"
    | "recovery"
    | "email_change"
    | "signup"
    | "email";
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });
  if (error) {
    console.error("[verifyTokenHash] failed:", error);
    const msg = error.message?.toLowerCase() ?? "";
    return {
      error:
        msg.includes("expired") || msg.includes("invalid")
          ? "This sign-in link expired or was already used. Use the code from the email instead, or request a fresh link."
          : error.message,
    };
  }
  return { ok: true };
}

/**
 * Sign in via 6-digit OTP code (no link click needed). Solves the
 * Gmail/Google Workspace prefetch problem — link scanners consume
 * one-time auth tokens before the human can click. The 6-digit code
 * embedded in the email body alongside the link can't be prefetched,
 * so it survives.
 *
 * Calls supabase.auth.verifyOtp with type='email' which works for
 * both invite and magic-link OTP codes from the unified Token field.
 */
export async function signInWithCode(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const token = String(formData.get("code") || "").trim().replace(/\s+/g, "");
  const next = String(formData.get("next") || "/account") || "/account";

  if (!email) return { error: "Enter your email address." };
  // Supabase OTP length is per-project (6, 7, or 8 digits). Be permissive
  // here — verifyOtp will reject anything that doesn't match what was
  // actually sent.
  if (!/^\d{4,10}$/.test(token)) {
    return { error: "Code should be the digits from your email (no spaces or letters)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("expired") ||
        error.message.toLowerCase().includes("invalid")
          ? "That code is invalid or expired. Send a fresh one and try again."
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
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
