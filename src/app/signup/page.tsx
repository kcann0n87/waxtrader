import Link from "next/link";
import { Suspense } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { SignupForm } from "./signup-form";

const BETA_MODE = process.env.NEXT_PUBLIC_BETA_MODE !== "false";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/welcome" } = await searchParams;

  // Beta-mode invite-only screen. Without this, the "Create an account"
  // link on /login routes to /signup, and during beta middleware
  // historically blocked /signup → bounced to /coming-soon → user
  // clicked Sign in → /login → "Create an account" → loop. /signup is
  // now in ALWAYS_PUBLIC_PREFIXES so anyone can land here, but in beta
  // mode we explain the invite gate instead of showing the form.
  if (BETA_MODE) {
    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-180px)] max-w-md items-center justify-center px-4 py-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.12),transparent_50%)]" />
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <LogoMark
                size={40}
                className="drop-shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
              />
              <span className="font-display text-xl font-black tracking-tight text-white">
                Wax<span className="text-amber-400">Depot</span>
              </span>
            </Link>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-amber-300 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Beta · invite only
            </div>
            <h1 className="font-display mt-4 text-3xl font-black tracking-tight text-white">
              You'll need an invite
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/60">
              We're rolling out access in waves while we tune the order book.
              If you have an invite email already, the sign-in link is in
              there — no separate signup needed.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#101012] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                <Mail size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Got an invite email?
                </div>
                <p className="mt-0.5 text-xs text-white/60">
                  Click the &ldquo;Activate your account&rdquo; button in the
                  email — that link signs you in automatically. If clicking
                  the link drops you back here, ask whoever invited you to
                  resend.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/5 pt-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/70">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  No invite yet?
                </div>
                <p className="mt-0.5 text-xs text-white/60">
                  We'll be opening sign-ups soon. Check{" "}
                  <Link
                    href="/coming-soon"
                    className="font-semibold text-amber-300 hover:text-amber-200"
                  >
                    waxdepot.io
                  </Link>{" "}
                  for the launch announcement.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/50">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-amber-300 transition hover:text-amber-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-180px)] max-w-md items-center justify-center px-4 py-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.12),transparent_50%)]" />
      <div className="w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark size={40} className="drop-shadow-[0_8px_24px_rgba(212,175,55,0.25)]" />
            <span className="font-display text-xl font-black tracking-tight text-white">
              Wax<span className="text-amber-400">Depot</span>
            </span>
          </Link>
          <h1 className="font-display mt-6 text-3xl font-black tracking-tight text-white">
            Join the marketplace
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-amber-300 transition hover:text-amber-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        <Suspense fallback={null}>
          <SignupForm next={next} />
        </Suspense>
      </div>
    </div>
  );
}
