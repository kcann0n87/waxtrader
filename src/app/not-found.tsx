import Link from "next/link";
import { ArrowRight, PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-700/30 bg-amber-500/10 text-amber-400">
        <PackageX size={28} />
      </div>
      <p className="mt-6 text-[10px] font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
        404
      </p>
      <h1 className="font-display mt-1 text-3xl font-black tracking-tight text-white">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-white/60">
        The page you&apos;re looking for doesn&apos;t exist, or the listing has
        been delisted. Try the marketplace home or the release calendar.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          Browse marketplace
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/releases"
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-400/40 hover:text-amber-300"
        >
          Release calendar
        </Link>
      </div>
    </div>
  );
}
