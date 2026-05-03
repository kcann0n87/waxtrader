import type { MetadataRoute } from "next";
import { getAllSkus } from "@/lib/db";

// Sitemap reads SKUs from the database (which uses cookies for auth context),
// so it has to be rendered per-request rather than at build time.
export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://waxdepot.io";

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "hourly" },
  { path: "/releases", priority: 0.8, changeFrequency: "daily" },
  { path: "/sell", priority: 0.6, changeFrequency: "monthly" },
  { path: "/sell/tiers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/help", priority: 0.5, changeFrequency: "monthly" },
  { path: "/help/contact", priority: 0.4, changeFrequency: "yearly" },
];

/**
 * Auto-generates a sitemap from the SKU catalog so each product page is
 * indexable. Static landing pages take precedence; SKUs come after with a
 * slightly lower priority. Falls back to just the static paths if the DB
 * lookup fails — we'd rather submit a partial sitemap than none.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let skuEntries: MetadataRoute.Sitemap = [];
  try {
    const skus = await getAllSkus();
    // Collapse SKUs into one entry per variant_group — the canonical URL
    // is /product/<group> (with each variant accessed via ?variant=<type>),
    // so listing every SKU separately would dilute crawl budget on
    // duplicate content. Falls back to the SKU slug for any rows that
    // missed the variant_group backfill.
    const seen = new Set<string>();
    for (const s of skus) {
      const key = s.variantGroup ?? s.slug;
      if (seen.has(key)) continue;
      seen.add(key);
      skuEntries.push({
        url: `${BASE}/product/${key}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error("sitemap: failed to load SKUs, returning static paths only", e);
  }

  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${BASE}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...skuEntries,
  ];
}
