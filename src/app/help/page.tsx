import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  User,
} from "lucide-react";
import { helpCategories } from "@/lib/help";

const iconMap = {
  buyer: <ShoppingBag size={18} />,
  seller: <Tag size={18} />,
  payouts: <Building2 size={18} />,
  disputes: <AlertTriangle size={18} />,
  account: <User size={18} />,
  fees: <CreditCard size={18} />,
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <HelpCircle size={24} />
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">How can we help?</h1>
        <p className="mt-1 text-slate-600">
          Search the help center or browse a category. Most questions have answers below.
        </p>

        <form action="/help/search" method="get" className="relative mx-auto mt-6 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
          <input
            name="q"
            placeholder="Search the help center"
            className="w-full rounded-md border border-slate-300 bg-white py-3 pr-3 pl-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <div className="mt-3 text-xs text-slate-500">
          Can&apos;t find what you need?{" "}
          <Link href="/help/contact" className="font-semibold text-indigo-600 hover:underline">
            Contact support →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {helpCategories.map((cat) => (
          <div
            key={cat.slug}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                {iconMap[cat.icon]}
              </div>
              <h2 className="text-base font-bold text-slate-900">{cat.title}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">{cat.description}</p>
            <ul className="mt-3 space-y-1.5">
              {cat.articles.slice(0, 3).map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/help/${cat.slug}/${a.slug}`}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
            {cat.articles.length > 3 && (
              <Link
                href={`/help/${cat.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                {cat.articles.length} articles total <ArrowRight size={11} />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/help/contact"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Contact support</h3>
            <p className="text-sm text-slate-500">Get a response from a real human within 24 hours.</p>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </Link>
        <Link
          href="/account/disputes"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Open or track a dispute</h3>
            <p className="text-sm text-slate-500">Resealed wax, wrong item, never arrived — we&apos;re on it.</p>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
