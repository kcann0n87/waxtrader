import Link from "next/link";
import { Bell, Calendar, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { skus, lastSale, lowestAsk } from "@/lib/data";
import { formatSkuTitle, formatUSD } from "@/lib/utils";

const TODAY = new Date(2026, 3, 28);

export default function ReleasesPage() {
  const dated = skus
    .map((s) => {
      const [y, m, d] = s.releaseDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const days = Math.floor((date.getTime() - TODAY.getTime()) / 86400000);
      return { sku: s, date, days };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcoming = dated.filter((x) => x.days >= 0);
  const recent = dated.filter((x) => x.days < 0).slice(-12).reverse();

  const grouped = groupByMonth(upcoming);
  const presaleCount = upcoming.filter((x) => x.days <= 30 && x.days >= 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Release calendar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upcoming sealed wax launches. List early, lock in the lowest ask.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <Counter label="Upcoming" value={String(upcoming.length)} icon={<Calendar size={14} />} />
          <Counter label="Within 30 days" value={String(presaleCount)} icon={<Clock size={14} />} accent />
        </div>
      </div>

      <section className="mb-10">
        {Object.entries(grouped).map(([monthKey, items]) => (
          <div key={monthKey} className="mb-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-bold text-slate-900">{monthKey}</h2>
              <span className="text-xs text-slate-500">{items.length} releases</span>
            </div>
            <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {items.map(({ sku, days }) => (
                <li key={sku.id} className="border-b border-slate-100 last:border-0">
                  <Link href={`/product/${sku.slug}`} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                    <ProductImage sku={sku} size="sm" className="aspect-[4/5] w-12 shrink-0 rounded" showText={false} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900">{formatSkuTitle(sku)}</div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                        <span>{sku.sport}</span>
                        <span>·</span>
                        <span>{formatDate(sku.releaseDate)}</span>
                      </div>
                    </div>
                    <CountdownPill days={days} />
                    <div className="hidden text-right md:block">
                      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        {lowestAsk(sku.id) !== null ? "Presale ask" : "—"}
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {lowestAsk(sku.id) !== null ? formatUSD(lowestAsk(sku.id)!) : "Not listed yet"}
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {upcoming.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <Calendar className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 text-sm font-bold text-slate-900">No upcoming releases tracked</p>
            <p className="mt-1 text-sm text-slate-500">Check back soon — release calendars update weekly.</p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently released</h2>
            <p className="text-xs text-slate-500">Trade is hot in the first 30 days after release</p>
          </div>
          <Link href="/" className="text-xs font-semibold text-indigo-600 hover:underline">
            Browse all →
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {recent.map(({ sku, days }) => (
            <li key={sku.id}>
              <Link
                href={`/product/${sku.slug}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:shadow-md"
              >
                <ProductImage sku={sku} size="sm" className="aspect-[4/5] w-10 shrink-0 rounded" showText={false} />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-bold text-slate-900">
                    {formatSkuTitle(sku)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Released {Math.abs(days)} {Math.abs(days) === 1 ? "day" : "days"} ago
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">
                    {lastSale(sku.id) ? formatUSD(lastSale(sku.id)!) : "—"}
                  </div>
                  <div className="text-[11px] text-slate-500">last sale</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Counter({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 ${accent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <span className={accent ? "text-amber-600" : "text-slate-400"}>{icon}</span>
      <div>
        <div className={`text-xs font-semibold tracking-wider uppercase ${accent ? "text-amber-700" : "text-slate-500"}`}>{label}</div>
        <div className={`text-sm font-bold ${accent ? "text-amber-900" : "text-slate-900"}`}>{value}</div>
      </div>
    </div>
  );
}

function CountdownPill({ days }: { days: number }) {
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-800">
        <TrendingUp size={11} />
        Today
      </span>
    );
  }
  if (days === 1) {
    return <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-800"><Bell size={11} />Tomorrow</span>;
  }
  if (days <= 7) {
    return <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">{days}d</span>;
  }
  if (days <= 30) {
    return <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-bold text-sky-800">{days}d</span>;
  }
  return <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{days}d</span>;
}

function groupByMonth(items: { sku: typeof skus[number]; date: Date; days: number }[]) {
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const key = item.date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
