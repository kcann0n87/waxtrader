import Link from "next/link";
import { Flame, Sparkles, TrendingUp, Zap } from "lucide-react";

const featured = [
  { brand: "Topps", set: "Cosmic Chrome", year: "25-26", sport: "🏀 NBA", lowAsk: 985, lastSold: "5m ago", grad: ["#7c3aed", "#06b6d4"] },
  { brand: "Bowman", set: "Bowman Jumbo", year: "25", sport: "⚾ MLB", lowAsk: 410, lastSold: "12m ago", grad: ["#f43f5e", "#fbbf24"] },
  { brand: "Panini", set: "Prizm FOTL", year: "25-26", sport: "🏀 NBA", lowAsk: 1480, lastSold: "1m ago", grad: ["#10b981", "#3b82f6"] },
];

export default function DesignB() {
  return (
    <div className="min-h-screen bg-[#fef9f3] antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
      />
      <style>{`
        .design-b { font-family: 'Space Grotesk', system-ui, sans-serif; }
      `}</style>

      <div className="design-b">
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 px-6 py-20 lg:py-28">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs font-bold tracking-wide text-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <Flame size={12} className="text-rose-500" />
              347 buyers online · 12 boxes ripped this hour
            </div>
            <h1 className="mt-6 max-w-3xl text-6xl leading-[0.95] font-bold tracking-tight text-white lg:text-8xl">
              Where the<br />
              <span className="bg-white px-3 italic text-purple-600 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                rip
              </span>
              <br />
              happens.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed font-medium text-white/95">
              Sealed wax marketplace built for the chase. Real prices, fast shipping, and
              zero eBay tax.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button className="rounded-xl border-2 border-black bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                🛒 Browse the floor
              </button>
              <button className="rounded-xl border-2 border-black bg-yellow-300 px-6 py-3.5 text-sm font-bold text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                💰 List a box
              </button>
            </div>
          </div>
        </section>

        <section className="border-y-2 border-black bg-yellow-300 py-3 overflow-hidden">
          <div className="flex animate-pulse items-center justify-around text-sm font-bold text-black">
            <span>⚡ FREE SHIPPING $75+</span>
            <span>🔥 CASHBACK ON EVERY ORDER</span>
            <span>🎯 PRO SELLERS GET PAID 2X/WEEK</span>
            <span>⚡ FREE SHIPPING $75+</span>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 uppercase">
                <Zap size={12} /> Trending right now
              </div>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-black">Hot drops 🔥</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featured.map((p, i) => (
              <article
                key={p.set}
                className="group transform transition hover:-translate-y-1 hover:rotate-[-1deg]"
              >
                <div
                  className="aspect-[4/5] rounded-2xl border-4 border-black p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                  style={{ background: `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})` }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-xs font-bold tracking-widest opacity-90 uppercase">{p.brand}</div>
                    <div className="mt-2 text-3xl leading-tight font-bold">{p.set}</div>
                    <div className="mt-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                      {p.sport}
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="absolute top-3 right-3 inline-flex rotate-12 items-center gap-1 rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-bold text-black">
                      🔥 HOT
                    </span>
                  )}
                </div>
                <div className="mt-4 rounded-xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="text-xs font-bold text-black/60 uppercase">{p.year} · {p.brand}</div>
                  <div className="mt-1 text-base leading-tight font-bold text-black">{p.set}</div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-black/50 uppercase">Lowest ask</div>
                      <div className="text-2xl font-bold text-black">${p.lowAsk}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                      <TrendingUp size={11} /> Sold {p.lastSold}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-black px-6 py-20 text-white">
          <div className="mx-auto max-w-5xl text-center">
            <Sparkles className="mx-auto text-yellow-300" size={32} />
            <h2 className="mt-4 text-5xl leading-[0.95] font-bold tracking-tight">
              Tier up. Get paid faster.
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { name: "Starter", fee: "10%", payout: "Weekly Friday", color: "bg-pink-300", emoji: "🎯" },
                { name: "Pro", fee: "8%", payout: "Twice a week", color: "bg-amber-300", emoji: "⚡" },
                { name: "Elite", fee: "6%", payout: "Every 3 days", color: "bg-emerald-300", emoji: "👑" },
              ].map((t) => (
                <div
                  key={t.name}
                  className={`${t.color} rotate-[-1deg] rounded-2xl border-2 border-black p-6 text-left text-black shadow-[6px_6px_0_0_rgba(255,255,255,0.3)] transition hover:rotate-0`}
                >
                  <div className="text-3xl">{t.emoji}</div>
                  <div className="mt-2 text-2xl font-bold">{t.name}</div>
                  <div className="mt-4 text-5xl font-bold">{t.fee}</div>
                  <div className="text-sm font-bold opacity-70">flat fee</div>
                  <div className="mt-4 text-xs font-bold tracking-wide uppercase">Paid {t.payout}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
