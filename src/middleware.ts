import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

// Routes that REQUIRE auth (existing): redirect anon users here back to /login.
const PROTECTED_PREFIXES = ["/account", "/sell", "/cart", "/admin"];

// Routes always reachable by anyone, even with the beta gate ON. Everything
// else gets redirected to /coming-soon for anon visitors.
//
// /signup IS reachable during beta — but its component renders an
// "invite-only" explainer instead of the signup form when
// NEXT_PUBLIC_BETA_MODE !== "false". This stops the loop where the
// "Create an account" link on /login bounced people to /coming-soon.
// When launching, the same component shows the real signup form
// automatically once the env flips.
const ALWAYS_PUBLIC_PREFIXES = [
  "/coming-soon",
  "/login",
  "/signup",
  "/forgot",
  "/reset",
  "/auth",
  "/api",
];

const ALWAYS_PUBLIC_EXACT = new Set([
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
]);

// Beta-gate toggle. Default: ON. Flip the gate off for public launch by setting
//   NEXT_PUBLIC_BETA_MODE=false
// in Vercel and redeploying. No code change needed.
const BETA_MODE = process.env.NEXT_PUBLIC_BETA_MODE !== "false";

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAlwaysPublic(pathname: string) {
  if (ALWAYS_PUBLIC_EXACT.has(pathname)) return true;
  return ALWAYS_PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Referral code capture. When a visitor lands with ?ref=XYZ, stash
  // it in a 30-day cookie so it survives navigation, browser closes,
  // and the signup roundtrip. The signup action reads + clears it,
  // attributing the new profile to the partner before the cookie
  // expires. Won't overwrite a cookie that's already set — first
  // partner to bring a visitor in keeps the attribution.
  const refCode = request.nextUrl.searchParams.get("ref");
  if (refCode && /^[A-Z0-9_-]{2,32}$/i.test(refCode)) {
    if (!request.cookies.get("waxdepot_ref")) {
      response.cookies.set("waxdepot_ref", refCode.toUpperCase(), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
        httpOnly: false, // readable in client too if a debug page wants it
      });
    }
  }

  // We only need the user lookup if either gate could trigger.
  const needsUser = BETA_MODE
    ? !isAlwaysPublic(pathname)
    : isProtected(pathname);
  if (!needsUser) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // BETA GATE: anon users hitting any non-public route → /coming-soon.
  if (BETA_MODE && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Auth gate for protected routes (also active when beta mode is off).
  if (isProtected(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and image optimization, all other routes refresh session.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
