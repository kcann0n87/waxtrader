"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Admin-only "+" button. Pairs with the floating ✕ delete in the
 * top-right of product cards. Click → routes to /admin/catalog/new
 * with the source product's full metadata pre-filled in URL params,
 * so adding a sibling variant is one click + one dropdown change.
 *
 * What gets carried over:
 *   year, brand, set, sport, release_date, description, gradient,
 *   image_url
 *
 * What changes per variant:
 *   `product` (Hobby Box vs Hobby Case vs Mega Box etc.) — we suggest
 *   "Hobby Case" when the source is "Hobby Box" since that's the most
 *   common sibling pattern. The slug auto-generator on the form will
 *   re-derive once the admin picks the actual variant.
 *
 * Renders nothing for non-admins.
 */
export function AdminAddSkuButton({
  isAdmin,
  prefill,
}: {
  isAdmin: boolean;
  prefill?: {
    year?: number;
    brand?: string;
    setName?: string;
    sport?: string;
    releaseDate?: string;
    description?: string;
    gradientFrom?: string;
    gradientTo?: string;
    imageUrl?: string;
    sourceProduct?: string;
    variantGroup?: string;
  };
}) {
  if (!isAdmin) return null;

  const params = new URLSearchParams();
  if (prefill?.year) params.set("year", String(prefill.year));
  if (prefill?.brand) params.set("brand", prefill.brand);
  if (prefill?.setName) params.set("set_name", prefill.setName);
  if (prefill?.sport) params.set("sport", prefill.sport);
  if (prefill?.releaseDate) params.set("release_date", prefill.releaseDate);
  if (prefill?.description) params.set("description", prefill.description);
  if (prefill?.gradientFrom) params.set("gradient_from", prefill.gradientFrom);
  if (prefill?.gradientTo) params.set("gradient_to", prefill.gradientTo);
  if (prefill?.imageUrl) params.set("image_url", prefill.imageUrl);
  // Critical for the sibling-variant flow: carrying the source's
  // variant_group means the new SKU lands on the same product page
  // instead of becoming a standalone product.
  if (prefill?.variantGroup) params.set("variant_group", prefill.variantGroup);

  // Pick a sensible default for the new variant so creating a sibling
  // doesn't collide on slug. Hobby Box → Hobby Case is the canonical
  // pair; for any other source we leave the form's own default ("Hobby
  // Box") which lets admins add the box variant from a case page.
  if (prefill?.sourceProduct === "Hobby Box") {
    params.set("product", "Hobby Case");
  } else if (prefill?.sourceProduct) {
    params.set("product", "Hobby Box");
  }

  const href = params.toString()
    ? `/admin/catalog/new?${params.toString()}`
    : "/admin/catalog/new";

  return (
    <Link
      href={href}
      className="absolute top-3 right-12 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/15 text-emerald-200 transition hover:scale-110 hover:border-emerald-500/60 hover:bg-emerald-500/30 hover:text-emerald-100"
      title="Add a sibling variant — pre-fills everything except the product type"
      aria-label="Add SKU"
    >
      <Plus size={14} />
    </Link>
  );
}
