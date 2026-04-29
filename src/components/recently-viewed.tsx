"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { skus, lowestAsk } from "@/lib/data";
import { formatSkuTitle, formatUSD } from "@/lib/utils";

export function RecentlyViewed({ excludeSkuId }: { excludeSkuId?: string }) {
  const { ids, hydrated } = useRecentlyViewed();
  if (!hydrated || ids.length === 0) return null;
  const items = ids
    .filter((id) => id !== excludeSkuId)
    .map((id) => skus.find((s) => s.id === id))
    .filter((s): s is (typeof skus)[number] => !!s)
    .slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
            <Clock size={10} />
            Recently viewed
          </div>
          <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Pick back up
          </h2>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {items.map((sku) => {
          const ask = lowestAsk(sku.id);
          return (
            <li key={sku.id}>
              <Link
                href={`/product/${sku.slug}`}
                className="group block overflow-hidden rounded-lg border border-white/5 bg-[#101012] transition hover:border-amber-400/30"
              >
                <ProductImage sku={sku} size="card" className="aspect-[4/5]" />
                <div className="p-2.5">
                  <div className="line-clamp-1 text-xs font-semibold text-white group-hover:text-amber-300">
                    {formatSkuTitle(sku)}
                  </div>
                  <div className="font-display mt-1 text-base font-black text-amber-400">
                    {ask !== null ? formatUSD(ask) : "—"}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
