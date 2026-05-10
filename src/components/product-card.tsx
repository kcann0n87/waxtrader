import Link from "next/link";
import { CalendarClock, Layers } from "lucide-react";
import type { Sku } from "@/lib/data";
import { daysUntilRelease, formatSkuTitle, formatUSD } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { WatchButton } from "./watch-button";

function shortReleaseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Single card on a product grid (homepage / browse / search).
 *
 * `variantCount` controls multi-variant display:
 *   - 1 (or omitted): render as a single SKU. Title + price = exact SKU.
 *   - 2+: render as a "release" card. Title drops the variant suffix
 *     (e.g. "2025-26 Topps Cosmic Chrome NBA" instead of
 *     "2025-26 Topps Cosmic Chrome NBA Hobby Box"), price shows
 *     "from $X" using the cheapest variant in the group, and a small
 *     "X variants" chip surfaces in the corner. Link goes to the
 *     canonical /product/<variant_group> URL so the variant selector
 *     loads.
 */
export function ProductCard({
  sku,
  lowestAsk,
  lastSale,
  presale,
  variantCount,
}: {
  sku: Sku;
  lowestAsk: number | null;
  lastSale: number | null;
  presale?: boolean;
  variantCount?: number;
}) {
  const isMultiVariant = (variantCount ?? 1) > 1;
  // For multi-variant releases, link to the canonical group URL so the
  // variant selector renders. For single SKUs, link to the SKU slug as
  // before — the page handler redirects through to canonical anyway.
  const href = isMultiVariant && sku.variantGroup
    ? `/product/${sku.variantGroup}`
    : `/product/${sku.slug}`;
  // Title: drop the per-variant suffix when collapsed so it reads as
  // "the release" not "this specific box config."
  // Dedupe brand/set when set name already includes the brand (e.g. set
  // = "Bowman" with brand = "Bowman" should render as "2025 Bowman MLB",
  // not "2025 Bowman Bowman MLB").
  const setLabel =
    sku.set === sku.brand || sku.set.startsWith(`${sku.brand} `)
      ? sku.set
      : `${sku.brand} ${sku.set}`;
  // Collection-card title format mirrors the product detail page H1:
  // - Year dropped (release date already lives in the spec strip)
  // - Pokemon products end with "Collection" instead of the sport tag
  //   ("Brand: Pokemon" + "Sport: Pokemon" was redundant; "Collection"
  //   matches how Pokemon Center markets the sets)
  const title = isMultiVariant
    ? `${setLabel} ${(sku.sport as string) === "Pokemon" ? "Collection" : sku.sport}`
    : formatSkuTitle(sku);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#101012] transition hover:border-amber-400/30 hover:bg-[#15151a]"
    >
      <ProductImage sku={sku} size="card" className="relative aspect-[4/5]">
        {presale && (() => {
          const days = daysUntilRelease(sku.releaseDate);
          const countdown =
            days <= 0
              ? "OUT NOW"
              : days === 1
                ? "1 day"
                : days <= 14
                  ? `${days} days`
                  : shortReleaseDate(sku.releaseDate);
          // Imminent drops (≤7d) get a brighter, slightly larger pill so
          // the buyer can scan a grid and instantly see what's about to
          // hit the market.
          const imminent = days <= 7;
          return (
            <span
              className={
                imminent
                  ? "absolute top-2 left-2 z-10 inline-flex animate-pulse items-center gap-1.5 rounded-md bg-gradient-to-r from-rose-400 to-amber-400 px-3 py-1.5 text-xs font-black tracking-wider text-slate-900 uppercase shadow-lg shadow-amber-500/40 ring-1 ring-amber-300/70"
                  : "absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[11px] font-black tracking-wider text-slate-900 uppercase shadow-lg shadow-amber-500/30 ring-1 ring-amber-300/60"
              }
              title={`Releases ${shortReleaseDate(sku.releaseDate)}`}
            >
              <CalendarClock size={imminent ? 14 : 12} strokeWidth={2.5} />
              <span>Presale · {countdown}</span>
            </span>
          );
        })()}
        {isMultiVariant && (
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-fuchsia-300 uppercase backdrop-blur">
            <Layers size={10} />
            {variantCount} variants
          </span>
        )}
        <div className="absolute top-2 right-2 z-10">
          <WatchButton skuId={sku.id} variant="icon" />
        </div>
      </ProductImage>
      <div className="flex flex-1 flex-col p-3">
        <div className="line-clamp-2 text-sm font-semibold tracking-tight text-white group-hover:text-amber-300">
          {title}
        </div>
        <div className="mt-1 text-[11px] tracking-wide text-white/60">
          {/* Pokemon: drop sport (= brand) and year — "Pokemon · Pokemon · 2025"
              was three rows of redundancy. Other sports keep brand + sport
              context since brand ≠ sport for them. Year removed across the
              board to match the H1 simplification. */}
          {sku.sport === "Pokemon"
            ? sku.brand
            : `${sku.sport} · ${sku.brand}`}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
              {lowestAsk !== null
                ? isMultiVariant
                  ? "From"
                  : "Lowest Ask"
                : "Last Sale"}
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
