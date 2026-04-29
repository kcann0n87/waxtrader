import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SaveSearchButton } from "@/components/save-search-button";
import { skus, lowestAsk, lastSale } from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; brand?: string }>;
}) {
  const { q = "", sport, brand } = await searchParams;
  const query = q.trim().toLowerCase();

  let results = skus;
  if (query) {
    results = results.filter((s) => {
      const haystack = `${s.year} ${s.brand} ${s.set} ${s.product} ${s.sport}`.toLowerCase();
      return haystack.includes(query);
    });
  }
  if (sport) results = results.filter((s) => s.sport === sport);
  if (brand) results = results.filter((s) => s.brand === brand);

  const sportFacets = countBy(skus, (s) => s.sport);
  const brandFacets = countBy(skus, (s) => s.brand);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <form action="/search" method="get" className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder='Search "2025 Bowman Hobby" or "Prizm Football"'
          className="w-full rounded-md border border-slate-300 bg-white py-3 pr-3 pl-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <Facet
            title="Sport"
            items={Object.entries(sportFacets)}
            paramKey="sport"
            currentValue={sport}
            q={q}
          />
          <Facet
            title="Brand"
            items={Object.entries(brandFacets)}
            paramKey="brand"
            currentValue={brand}
            q={q}
          />
        </aside>

        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {q ? `Results for "${q}"` : "All sealed boxes"}
              </h1>
              <p className="text-sm text-slate-500">
                {results.length} {results.length === 1 ? "result" : "results"}
                {sport ? ` · ${sport}` : ""}
                {brand ? ` · ${brand}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(q || sport || brand) && <SaveSearchButton query={q} sport={sport} brand={brand} />}
              {(sport || brand) && (
                <Link
                  href={`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="text-slate-400">
                <Search size={32} className="mx-auto" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">No matches</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different brand, sport, or year.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((s) => (
                <ProductCard
                  key={s.id}
                  sku={s}
                  lowestAsk={lowestAsk(s.id)}
                  lastSale={lastSale(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Facet({
  title,
  items,
  paramKey,
  currentValue,
  q,
}: {
  title: string;
  items: [string, number][];
  paramKey: string;
  currentValue?: string;
  q: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</h3>
      <ul className="space-y-1">
        {items.map(([value, count]) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (currentValue !== value) params.set(paramKey, value);
          const isActive = currentValue === value;
          return (
            <li key={value}>
              <Link
                href={`/search?${params.toString()}`}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-slate-900 font-semibold text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{value}</span>
                <span className={`text-xs ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function countBy<T>(arr: T[], keyFn: (x: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of arr) {
    const k = keyFn(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
