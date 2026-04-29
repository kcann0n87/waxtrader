import Link from "next/link";
import { Sku } from "@/lib/data";
import { formatSkuTitle, formatUSD } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { WatchButton } from "./watch-button";

export function ProductCard({
  sku,
  lowestAsk,
  lastSale,
  presale,
}: {
  sku: Sku;
  lowestAsk: number | null;
  lastSale: number | null;
  presale?: boolean;
}) {
  return (
    <Link
      href={`/product/${sku.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#101012] transition hover:border-amber-400/30 hover:bg-[#15151a]"
    >
      <ProductImage sku={sku} size="card" className="relative aspect-[4/5]">
        {presale && (
          <span className="absolute top-2 left-2 z-10 rounded-full border border-amber-400/40 bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase backdrop-blur">
            Presale
          </span>
        )}
        <div className="absolute top-2 right-2 z-10">
          <WatchButton skuId={sku.id} variant="icon" />
        </div>
      </ProductImage>
      <div className="flex flex-1 flex-col p-3">
        <div className="line-clamp-2 text-sm font-semibold tracking-tight text-white group-hover:text-amber-300">
          {formatSkuTitle(sku)}
        </div>
        <div className="mt-1 text-[11px] tracking-wide text-white/40">
          {sku.sport} · {sku.brand} · {sku.year}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.15em] text-white/40 uppercase">
              {lowestAsk !== null ? "Lowest Ask" : "Last Sale"}
            </div>
            <div className="font-display text-lg font-black tracking-tight text-amber-400">
              {lowestAsk !== null ? formatUSD(lowestAsk) : lastSale !== null ? formatUSD(lastSale) : "—"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
