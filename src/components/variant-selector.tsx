"use client";

import Link from "next/link";
import { variantLabel } from "@/lib/variants";
import { formatUSD } from "@/lib/utils";

export type VariantOption = {
  variantType: string;
  lowestAskCents: number | null;
};

/**
 * Segmented control above the order book. Each chip renders the variant
 * label + lowest active ask. The active variant is rendered visually
 * distinct (amber border + bold text); inactive variants link to the
 * same product page with a different ?variant= query param so navigation
 * is preserved in history and shareable.
 *
 * Single-variant products skip the selector entirely — handled by the
 * caller, not here, so this component can stay dumb.
 */
export function VariantSelector({
  groupSlug,
  variants,
  activeType,
}: {
  groupSlug: string;
  variants: VariantOption[];
  activeType: string;
}) {
  if (variants.length <= 1) return null;

  return (
    <div className="mb-6">
      <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
        Variants
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.variantType === activeType;
          const ask =
            v.lowestAskCents !== null ? formatUSD(v.lowestAskCents / 100) : null;
          return (
            <Link
              key={v.variantType}
              href={`/product/${groupSlug}?variant=${v.variantType}`}
              aria-current={active ? "page" : undefined}
              scroll={false}
              className={
                active
                  ? "rounded-md border border-amber-400/60 bg-amber-500/[0.08] px-3 py-2 text-sm font-bold text-amber-200 shadow-md shadow-amber-500/10"
                  : "rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-amber-400/40 hover:bg-white/5 hover:text-white"
              }
            >
              <div>{variantLabel(v.variantType)}</div>
              <div
                className={`text-[11px] font-normal ${active ? "text-amber-200/80" : "text-white/50"}`}
              >
                {ask ? `from ${ask}` : "no listings"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
