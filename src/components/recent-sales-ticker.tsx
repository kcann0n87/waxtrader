"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { skus } from "@/lib/data";
import { formatSkuTitle, formatUSD } from "@/lib/utils";

type Sale = { id: string; skuId: string; price: number; secondsAgo: number };

const seedSales: Sale[] = [
  { id: "s1", skuId: "1", price: 985, secondsAgo: 14 },
  { id: "s2", skuId: "3", price: 412, secondsAgo: 47 },
  { id: "s3", skuId: "10", price: 109, secondsAgo: 96 },
  { id: "s4", skuId: "5", price: 580, secondsAgo: 142 },
  { id: "s5", skuId: "7", price: 487, secondsAgo: 198 },
  { id: "s6", skuId: "12", price: 378, secondsAgo: 245 },
  { id: "s7", skuId: "2", price: 718, secondsAgo: 320 },
  { id: "s8", skuId: "9", price: 222, secondsAgo: 410 },
];

export function RecentSalesTicker() {
  const [sales, setSales] = useState<Sale[]>(seedSales);
  const [counter, setCounter] = useState(seedSales.length);

  useEffect(() => {
    const interval = setInterval(() => {
      const sku = skus[Math.floor(Math.random() * skus.length)];
      const variance = 0.92 + Math.random() * 0.16;
      const basePrice =
        { "1": 985, "2": 720, "3": 410, "4": 195, "5": 580, "6": 165, "7": 495,
          "8": 295, "9": 220, "10": 110, "11": 1380, "12": 380 }[sku.id] || 200;
      const price = Math.round(basePrice * variance);
      setCounter((c) => c + 1);
      setSales((prev) => {
        const id = `s-live-${counter + 1}`;
        const next: Sale = { id, skuId: sku.id, price, secondsAgo: 0 };
        return [next, ...prev.slice(0, 9).map((s) => ({ ...s, secondsAgo: s.secondsAgo + 8 }))];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [counter]);

  useEffect(() => {
    const tick = setInterval(() => {
      setSales((prev) => prev.map((s) => ({ ...s, secondsAgo: s.secondsAgo + 1 })));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
          <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            The tape
          </h2>
          <p className="text-xs text-white/50">Real-time sales across the marketplace</p>
        </div>
        <Link
          href="/search"
          className="text-[11px] font-semibold tracking-wide text-white/60 transition hover:text-amber-300"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101012]">
        <ul className="divide-y divide-white/5">
          {sales.slice(0, 5).map((sale) => {
            const sku = skus.find((s) => s.id === sale.skuId);
            if (!sku) return null;
            return (
              <li key={sale.id}>
                <Link
                  href={`/product/${sku.slug}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.02]"
                >
                  <div
                    className="flex h-10 w-8 shrink-0 items-center justify-center rounded text-[7px] font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})`,
                    }}
                  >
                    {sku.brand.slice(0, 4).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{formatSkuTitle(sku)}</div>
                    <div className="text-[11px] text-white/60">{ago(sale.secondsAgo)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-base font-black text-amber-400">
                      {formatUSD(sale.price)}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <Zap size={10} />
                      Sold
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ago(secondsAgo: number) {
  if (secondsAgo < 5) return "just now";
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  return `${Math.floor(secondsAgo / 3600)}h ago`;
}
