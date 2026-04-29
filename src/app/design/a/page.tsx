import Link from "next/link";
import { ArrowUpRight, Hammer, ShieldCheck, Star } from "lucide-react";

const featured = [
  { brand: "TOPPS", set: "Cosmic Chrome", year: "2025-26", sport: "NBA", lowAsk: 985, last: 956, change: "+3.0%", grad: ["#1a1a2e", "#16213e"] },
  { brand: "PANINI", set: "National Treasures", year: "2024-25", sport: "NBA", lowAsk: 1820, last: 1840, change: "-1.1%", grad: ["#0f0f0f", "#262626"] },
  { brand: "UPPER DECK", set: "The Cup", year: "2024-25", sport: "NHL", lowAsk: 1450, last: 1395, change: "+3.9%", grad: ["#0a0e27", "#1a1a2e"] },
];

export default function DesignA() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap"
      />
      <style>{`
        .design-a-hero h1 { font-family: 'Playfair Display', Georgia, serif; }
        .design-a-hero { font-family: 'Inter', system-ui, sans-serif; }
        .gold { color: #d4af37; }
        .gold-bg { background: linear-gradient(135deg, #d4af37, #a88b29); }
        .gold-border { border-color: #d4af37; }
        .display-serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <section className="design-a-hero relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,rgba(212,175,55,0.18),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full gold-bg" />
              Sealed Sports Cards · Est. 2026
            </div>
            <h1 className="display-serif text-5xl leading-[1.05] font-black tracking-tight text-white lg:text-7xl">
              The marketplace for <span className="gold italic">serious</span> collectors.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Bid, ask, and buy sealed wax with the transparency of a stock market. Real
              prices, real provenance, real escrow.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button className="gold-bg rounded-md px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:opacity-90">
                Browse the catalog
              </button>
              <button className="rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/5">
                List a box →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-white/5 sm:grid-cols-3">
          {[
            { k: "$2.4M", v: "in escrow", sub: "across active orders" },
            { k: "8,400+", v: "verified sellers", sub: "Pro & Elite tiers" },
            { k: "99.7%", v: "positive feedback", sub: "rolling 30 days" },
          ].map((s) => (
            <div key={s.v} className="bg-[#0a0a0b] px-8 py-10">
              <div className="display-serif gold text-4xl font-black">{s.k}</div>
              <div className="mt-1 text-sm font-semibold text-white">{s.v}</div>
              <div className="mt-0.5 text-xs text-white/50">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="design-a-hero mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
              Open Market
            </div>
            <h2 className="display-serif mt-2 text-4xl font-black">Tonight&apos;s book</h2>
          </div>
          <Link href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-white/70 hover:text-white">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-3">
          {featured.map((p) => (
            <article
              key={p.set}
              className="group relative overflow-hidden bg-[#0a0a0b] p-6 transition hover:bg-[#101012]"
            >
              <div
                className="aspect-[4/3] overflow-hidden rounded-lg border border-white/10"
                style={{ background: `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})` }}
              >
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="display-serif gold text-3xl font-black tracking-tight">{p.set}</div>
                    <div className="mt-2 text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
                      {p.year} · {p.brand} · {p.sport}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">Lowest ask</div>
                  <div className="display-serif mt-1 text-3xl font-black tracking-tight">${p.lowAsk}</div>
                </div>
                <div
                  className={`text-xs font-semibold ${p.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {p.change}
                </div>
              </div>
              <div className="mt-1 text-xs text-white/40">Last sold ${p.last}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-gradient-to-b from-[#0a0a0b] to-[#101013]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-3">
          {[
            { icon: <Hammer size={20} />, title: "Real bid/ask", body: "A live order book like Wall Street, not a flea market. Buyers bid up, sellers undercut, prices discover." },
            { icon: <ShieldCheck size={20} />, title: "Held in escrow", body: "Every transaction is held until the box arrives sealed. No middleman risk, no resealed wax slipping through." },
            { icon: <Star size={20} />, title: "Tier-based fees", body: "Earn 6-10% commission savings as you climb. Elite sellers get paid every three days." },
          ].map((f) => (
            <div key={f.title}>
              <div className="gold mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-500/10">
                {f.icon}
              </div>
              <h3 className="display-serif text-2xl font-black text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
