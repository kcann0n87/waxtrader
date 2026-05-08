import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PKCE code exchange handler. Supabase email links (invite, magic
 * link, signup confirm, password reset) use this as their redirect_to
 * after the verify endpoint validates the token. We then exchange the
 * one-time `?code` for a real session, set cookies, and forward the
 * user to wherever they were going.
 *
 * Two error pivots, both kept distinct in the URL so we can spot
 * which step actually failed in production logs:
 *   - `?error=missing-code` → arrived without a code at all (bad
 *     redirect, link tampered with, Supabase server hiccup)
 *   - `?error=auth-callback-failed&reason=...` → code present but
 *     exchange failed (expired code, wrong project, cookies blocked)
 *
 * Default destination on success is /account — invitees and
 * magic-link recipients always belong on their dashboard. Override
 * with `?next=…` only when an explicit different landing is wanted
 * (e.g. password reset → /reset).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  // Supabase's verify endpoint sometimes appends ?error=… when the
  // server-side validation fails (expired token etc.). Surface that
  // verbatim so we don't redirect into a confusing login loop.
  const supabaseError = searchParams.get("error_description") ?? searchParams.get("error");

  if (supabaseError) {
    console.error("[auth/callback] Supabase returned error:", supabaseError);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(supabaseError)}`,
    );
  }

  if (!code) {
    console.error("[auth/callback] no code in query params:", request.url);
    return NextResponse.redirect(`${origin}/login?error=missing-code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error);
    return NextResponse.redirect(
      `${origin}/login?error=auth-callback-failed&reason=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
