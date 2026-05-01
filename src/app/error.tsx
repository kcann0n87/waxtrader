"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * App-wide error boundary. Caught when a server component throws during
 * render or a server action surfaces an unhandled exception. Logs once to
 * the console for ops visibility, then offers the user a retry or a way
 * back to the marketplace.
 *
 * Required to be a client component per Next's app-router error contract.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-700/30 bg-rose-500/10 text-rose-400">
        <AlertTriangle size={28} />
      </div>
      <p className="mt-6 text-[10px] font-semibold tracking-[0.2em] text-rose-400/80 uppercase">
        Something broke
      </p>
      <h1 className="font-display mt-1 text-3xl font-black tracking-tight text-white">
        We hit a snag
      </h1>
      <p className="mt-3 text-sm text-white/60">
        An unexpected error stopped this page from loading. We&apos;ve logged
        it. Try again, or head back to the marketplace.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-white/40">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          <RefreshCw size={14} />
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-400/40 hover:text-amber-300"
        >
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
