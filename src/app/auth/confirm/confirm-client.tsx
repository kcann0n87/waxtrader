"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { verifyTokenHash } from "@/app/auth/actions";

type Phase =
  | { kind: "loading" }
  | { kind: "success"; next: string }
  | { kind: "error"; message: string };

/**
 * Reads window.location.hash for token_hash + type, posts to
 * verifyTokenHash server action, and routes the user accordingly.
 * Hash fragments aren't visible to server-side code, so this is the
 * only place the token data ever surfaces in our app.
 */
export function ConfirmClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  useEffect(() => {
    // Hashes are never sent to the server, so we MUST read this from
    // window. Run only after mount.
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);

    // Some Supabase links also pass error info via hash (e.g. expired
    // tokens). Surface it cleanly instead of trying to verify a token
    // that doesn't exist.
    const errParam = params.get("error_description") ?? params.get("error");
    if (errParam) {
      setPhase({ kind: "error", message: errParam.replace(/\+/g, " ") });
      return;
    }

    const tokenHash = params.get("token_hash");
    const type = params.get("type") ?? "magiclink";
    const next = params.get("next") ?? "/account";

    if (!tokenHash) {
      // Could be a prefetcher hitting the URL with no fragment, OR a
      // real user with a malformed link. Show a neutral message with
      // a way forward.
      setPhase({
        kind: "error",
        message:
          "This page only works when you click a sign-in link from your email. If you got here some other way, head to /login.",
      });
      return;
    }

    let cancelled = false;
    (async () => {
      const res = await verifyTokenHash({ tokenHash, type });
      if (cancelled) return;
      if (res.error) {
        setPhase({ kind: "error", message: res.error });
        return;
      }
      setPhase({ kind: "success", next });
      // Tiny delay so the success state is visible before nav.
      setTimeout(() => router.replace(next), 600);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101012] p-8 text-center shadow-2xl shadow-black/40">
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2.5"
      >
        <LogoMark
          size={36}
          className="drop-shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
        />
        <span className="font-display text-lg font-black tracking-tight text-white">
          Wax<span className="text-amber-400">Depot</span>
        </span>
      </Link>

      {phase.kind === "loading" && (
        <>
          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
            <Loader2 size={22} className="animate-spin" />
          </div>
          <h1 className="font-display mt-4 text-xl font-black text-white">
            Signing you in…
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Verifying your email link.
          </p>
        </>
      )}

      {phase.kind === "success" && (
        <>
          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <CheckCircle2 size={22} />
          </div>
          <h1 className="font-display mt-4 text-xl font-black text-white">
            You&apos;re in.
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Taking you to {phase.next === "/account" ? "your dashboard" : "your destination"}…
          </p>
        </>
      )}

      {phase.kind === "error" && (
        <>
          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
            <AlertTriangle size={22} />
          </div>
          <h1 className="font-display mt-4 text-xl font-black text-white">
            Couldn&apos;t verify
          </h1>
          <p className="mt-1.5 text-sm text-white/60">{phase.message}</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/login"
              className="rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
            >
              Use the code from your email
            </Link>
            <p className="text-[11px] text-white/50">
              On the sign-in page, tap <strong>Email Code</strong> and paste the
              digits shown in your email.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
