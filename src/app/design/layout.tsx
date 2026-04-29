import Link from "next/link";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="sticky top-[57px] z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs">
          <span className="font-bold text-slate-700">Design previews:</span>
          <Link href="/design/a" className="rounded-md bg-slate-900 px-2 py-1 font-semibold text-white hover:bg-slate-700">
            A · Premium
          </Link>
          <Link href="/design/b" className="rounded-md bg-slate-900 px-2 py-1 font-semibold text-white hover:bg-slate-700">
            B · Vibrant
          </Link>
          <Link href="/design/c" className="rounded-md bg-slate-900 px-2 py-1 font-semibold text-white hover:bg-slate-700">
            C · Stripe-clean
          </Link>
          <Link href="/" className="ml-auto text-slate-500 hover:text-slate-900">
            ← Back to current
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
