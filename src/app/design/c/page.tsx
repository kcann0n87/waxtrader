import Link from "next/link";
import { ArrowRight, BarChart3, Lock, Zap } from "lucide-react";

const featured = [
  { brand: "Topps", set: "Cosmic Chrome", year: "2025-26", sport: "NBA", lowAsk: 985, last: 956, change: "+3.0%", grad: ["#a78bfa", "#7dd3fc"] },
  { brand: "Bowman", set: "Bowman", year: "2025", sport: "MLB", lowAsk: 410, last: 405, change: "+1.2%", grad: ["#fda4af", "#fcd34d"] },
  { brand: "Panini", set: "Prizm FOTL", year: "2025-26", sport: "NBA", lowAsk: 1480, last: 1505, change: "-1.7%", grad: ["#5eead4", "#a5b4fc"] },
];

export default function DesignC() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap"
      />
      <style>{`
        .design-c { font-family: 'Geist', system-ui, -apple-system, sans-serif; letter-spacing: -0.01em; }
        .grain { background-image: radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px); background-size: 24px 24px; }
      `}</style>

      <div className="design-c">
        <section className="relative overflow-hidden border-b border-slate-100">
          <div className="grain absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-medium tracking-tight text-slate-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live: 347 active listings · 12 sales in the last hour
              </div>
              <h1 className="text-6xl leading-[1.0] font-bold tracking-tighter text-slate-900 lg:text-7xl">
                The marketplace<br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                  for sealed wax.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Real bid/ask. Real escrow. Real sellers. Built for collectors who treat their hobby
                like an asset class.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button className="group inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  Browse the catalog
                  <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </button>
                <button className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                  How it works
                </button>
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock size={12} />
                  Held in escrow
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 size={12} />
                  90-day price history
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} />
                  Daily payouts at Elite
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Featured
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Hot boxes this week
                </h2>
                <p className="mt-1 text-slate-600">Top listings ranked by 7-day demand.</p>
              </div>
              <Link
                href="#"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {featured.map((p) => (
                <article
                  key={p.set}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div
                    className="aspect-[4/5] overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})` }}
                  >
                    <div className="flex h-full items-center justify-center text-slate-900/85">
                      <div className="text-center">
                        <div className="text-[10px] font-semibold tracking-widest uppercase opacity-70">
                          {p.brand}
                        </div>
                        <div className="mt-2 text-3xl leading-tight font-bold tracking-tighter">
                          {p.set}
                        </div>
                        <div className="mt-1 text-xs font-semibold opacity-60">{p.year}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-medium text-slate-500">
                      {p.sport} · {p.brand}
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                          Lowest ask
                        </div>
                        <div className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                          ${p.lowAsk}
                        </div>
                      </div>
                      <div
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${p.change.startsWith("+") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {p.change} 7d
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                Tiered fees
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                The more you sell, the less we take.
              </h2>
              <p className="mt-3 text-slate-600">
                Three tiers based on rolling 30-day volume and seller score. No hidden charges, no
                buyer fees.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { name: "Starter", fee: "10%", payout: "Weekly Friday", note: "Default for everyone" },
                { name: "Pro", fee: "8%", payout: "Tue + Fri", note: "100+ sales · 99%+ positive", highlight: true },
                { name: "Elite", fee: "6%", payout: "Every 3 days", note: "500+ sales · 99.5%+ positive" },
              ].map((t) => (
                <div
                  key={t.name}
                  className={`rounded-2xl border bg-white p-6 ${t.highlight ? "border-indigo-200 ring-2 ring-indigo-500/10 shadow-md" : "border-slate-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    {t.highlight && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-700 uppercase">
                        Most popular
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tighter text-slate-900">{t.fee}</span>
                    <span className="text-sm font-medium text-slate-500">flat</span>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      Payouts
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-900">{t.payout}</div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">{t.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
