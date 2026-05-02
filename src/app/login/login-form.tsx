"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { resendConfirmation, signIn } from "../auth/actions";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [resendPending, startResend] = useTransition();
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await signIn(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-4 rounded-2xl border border-white/10 bg-[#101012] p-7 shadow-2xl shadow-black/40"
    >
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
          Email
        </span>
        <div className="relative">
          <Mail
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/50"
          />
          <input
            ref={emailRef}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-white/10 bg-white/5 py-2.5 pr-3 pl-9 text-sm text-white placeholder:text-white/50 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </label>

      <label className="block">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="block text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            Password
          </span>
          <a
            href="/forgot"
            className="text-[11px] font-semibold text-amber-300 transition hover:text-amber-200"
          >
            Forgot?
          </a>
        </div>
        <div className="relative">
          <Lock
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/50"
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-md border border-white/10 bg-white/5 py-2.5 pr-3 pl-9 text-sm text-white placeholder:text-white/50 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </label>

      {error && (
        <div className="rounded-md border border-rose-700/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          {error}
        </div>
      )}

      {resendMsg && (
        <div className="rounded-md border border-emerald-700/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          {resendMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : null}
        Sign in
      </button>

      <div className="flex flex-col items-center gap-1 text-center text-[11px] text-white/50">
        <button
          type="button"
          disabled={resendPending}
          onClick={() => {
            const email = emailRef.current?.value?.trim();
            if (!email) {
              setResendMsg(null);
              setError("Enter your email above first, then resend.");
              return;
            }
            setError(null);
            setResendMsg(null);
            startResend(async () => {
              const fd = new FormData();
              fd.set("email", email);
              fd.set("next", next);
              const res = await resendConfirmation(fd);
              if (res?.error) setError(res.error);
              else
                setResendMsg(
                  "Confirmation email sent — check your inbox (and spam).",
                );
            });
          }}
          className="text-white/60 underline decoration-white/20 underline-offset-2 transition hover:text-amber-300 disabled:opacity-50"
        >
          {resendPending ? "Sending…" : "Didn't get the confirmation email? Resend"}
        </button>
      </div>

      <div className="text-center text-[11px] text-white/60">
        By signing in you agree to our{" "}
        <a href="/terms" target="_blank" rel="noopener" className="text-white/60 underline decoration-white/20 transition hover:text-amber-300">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" target="_blank" rel="noopener" className="text-white/60 underline decoration-white/20 transition hover:text-amber-300">
          Privacy Policy
        </a>
        .
      </div>
    </form>
  );
}
