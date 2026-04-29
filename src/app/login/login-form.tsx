"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "../auth/actions";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await signIn(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
        <div className="relative">
          <Mail size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 py-2.5 pr-3 pl-9 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
        <div className="relative">
          <Lock size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-md border border-slate-300 py-2.5 pr-3 pl-9 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </label>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : null}
        Sign in
      </button>

      <div className="text-center text-xs text-slate-400">
        By signing in you agree to our{" "}
        <a href="#" className="text-slate-500 hover:underline">Terms</a> and{" "}
        <a href="#" className="text-slate-500 hover:underline">Privacy Policy</a>.
      </div>
    </form>
  );
}
