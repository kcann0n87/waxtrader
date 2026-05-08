"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Admin-only "+" button. Pairs with the floating ✕ delete in the
 * top-right of product cards. Click → routes to /admin/catalog/new
 * with the current product's sport / brand / set / year pre-filled
 * in the URL params, so adding a sibling variant takes one click
 * (just type the new variant name + slug suffix and hit save).
 *
 * The full add-SKU form on /admin/catalog/new is already comprehensive
 * (image upload, gradient picker, all fields). Linking to it is
 * faster than maintaining a separate inline mini-form.
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
  };
}) {
  if (!isAdmin) return null;

  const params = new URLSearchParams();
  if (prefill?.year) params.set("year", String(prefill.year));
  if (prefill?.brand) params.set("brand", prefill.brand);
  if (prefill?.setName) params.set("set_name", prefill.setName);
  if (prefill?.sport) params.set("sport", prefill.sport);
  const href = params.toString()
    ? `/admin/catalog/new?${params.toString()}`
    : "/admin/catalog/new";

  return (
    <Link
      href={href}
      className="absolute top-3 right-12 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/15 text-emerald-200 transition hover:scale-110 hover:border-emerald-500/60 hover:bg-emerald-500/30 hover:text-emerald-100"
      title="Add a new SKU (pre-fills sport/brand/set/year from this product)"
      aria-label="Add SKU"
    >
      <Plus size={14} />
    </Link>
  );
}
