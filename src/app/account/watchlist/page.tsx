"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { skus, lowestAsk, lastSale, priceHistoryForSku } from "@/lib/data";
import { useWatchlist } from "@/lib/watchlist";
import { WatchButton } from "@/components/watch-button";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export default function WatchlistPage() {
  const { ids, hydrated } = useWatchlist();
  const watched = skus.filter((s) => ids.includes(s.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-slate-900">Watchlist</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Watchlist</h1>
      <p className="mt-1 text-sm text-slate-500">
        Boxes you&apos;re tracking. We&apos;ll alert you when prices drop or new listings appear.
      </p>

      {!hydrated ? (
        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : watched.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Heart size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No watchlist yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Tap the heart on any product to track it here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Browse marketplace
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Lowest ask</th>
                <th className="px-4 py-2.5">Last sale</th>
                <th className="px-4 py-2.5">7d</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {watched.map((s) => {
                const ask = lowestAsk(s.id);
                const last = lastSale(s.id);
                const history = priceHistoryForSku(s.id);
                const prev = history[history.length - 8]?.price ?? last ?? 0;
                const change = (last ?? 0) - prev;
                const pct = prev ? (change / prev) * 100 : 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/product/${s.slug}`} className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-10 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                          }}
                        >
                          {s.brand.slice(0, 4).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 hover:text-indigo-600">
                            {formatSkuTitle(s)}
                          </div>
                          <div className="text-xs text-slate-500">{s.sport}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {ask !== null ? formatUSDFull(ask) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {last !== null ? formatUSDFull(last) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                          change >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {change >= 0 ? "+" : ""}
                        {formatUSD(change)} ({pct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <WatchButton skuId={s.id} variant="compact" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
