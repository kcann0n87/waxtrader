import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SkuForm } from "../sku-form";

export const dynamic = "force-dynamic";

/**
 * Admin "create SKU" page. Accepts query params to pre-fill the form.
 * Two callers exercise this today:
 *   1. /admin/feedback "Add to catalog →" deep-link from a set request
 *   2. The floating "+" button on a product page (sibling variant flow)
 *
 * Supported params: slug, year, brand, set_name, product, sport,
 * release_date, description, image_url, gradient_from, gradient_to
 */
export default async function AdminNewSkuPage({
  searchParams,
}: {
  searchParams: Promise<{
    slug?: string;
    year?: string;
    brand?: string;
    set_name?: string;
    product?: string;
    sport?: string;
    release_date?: string;
    description?: string;
    image_url?: string;
    gradient_from?: string;
    gradient_to?: string;
    variant_group?: string;
  }>;
}) {
  const sp = await searchParams;
  const validSports = ["NBA", "MLB", "NFL", "NHL", "Pokemon", "Soccer"] as const;
  const sport = validSports.includes(sp.sport as (typeof validSports)[number])
    ? (sp.sport as (typeof validSports)[number])
    : undefined;
  const yearNum = sp.year ? parseInt(sp.year, 10) : undefined;
  const hasAnyPrefill =
    sp.slug ||
    sp.brand ||
    sp.set_name ||
    sp.release_date ||
    sp.description ||
    sp.image_url;
  const initial = hasAnyPrefill
    ? {
        slug: sp.slug,
        year: Number.isFinite(yearNum) ? yearNum : undefined,
        brand: sp.brand,
        set_name: sp.set_name,
        product: sp.product || "Hobby Box",
        sport,
        release_date: sp.release_date,
        description: sp.description,
        image_url: sp.image_url,
        gradient_from: sp.gradient_from,
        gradient_to: sp.gradient_to,
        variant_group: sp.variant_group,
      }
    : undefined;

  return (
    <div>
      <Link
        href="/admin/catalog"
        className="mb-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft size={12} /> Catalog
      </Link>
      <h1 className="font-display mb-1 text-2xl font-black text-white">Add new SKU</h1>
      {initial && (
        <p className="mb-6 text-xs text-amber-300">
          Pre-filled from an existing SKU. Pick the variant (Hobby Case
          / Mega Box / etc.) and adjust anything else as needed before
          hitting Create SKU.
        </p>
      )}
      <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
        <SkuForm initial={initial} />
      </div>
    </div>
  );
}
