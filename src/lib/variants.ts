/**
 * Display labels and ordering for variant_type values stored on the skus
 * table. Each release has 1-N variants (Hobby Box, Hobby Case, Mega Box,
 * Mega Case, etc.) — the product page groups them under a shared
 * variant_group slug and lets buyers toggle between markets.
 *
 * Brand-naming notes:
 *   - Topps uses "First Day Issue" (FDI) for early-print variants
 *   - Panini uses "First Off The Line" (FOTL) for the same idea
 * The two are distinct variant_types so display labels stay accurate.
 *
 * Case naming convention: every "*-box" variant has a "*-case" sibling
 * (e.g. mega-box / mega-case). Cases are real SKUs with their own market
 * — a sealed mega case isn't priced as 6× the per-box rate; it has its
 * own bid/ask.
 *
 * NOTE: Value Box was removed — they're functionally identical to Blaster
 * Box in this market and were just adding noise to the variant selector.
 */

export const VARIANT_LABELS: Record<string, string> = {
  // Single-box variants
  "blaster-box": "Blaster Box",
  "hanger-box": "Hanger Box",
  "mega-box": "Mega Box",
  "hobby-box": "Hobby Box",
  "fotl-hobby-box": "FOTL Hobby Box",
  "first-day-issue-hobby-box": "First Day Issue Hobby Box",
  "first-day-issue-hobby-jumbo-box": "First Day Issue Jumbo Box",
  "jumbo-box": "Jumbo Box",
  "hobby-jumbo-box": "Hobby Jumbo Box",
  "booster-box": "Booster Box",
  "elite-trainer-box": "Elite Trainer Box",
  "inner-case": "Inner Case",
  // Sealed-case variants
  "blaster-case": "Blaster Case",
  "hanger-case": "Hanger Case",
  "mega-case": "Mega Case",
  "hobby-case": "Hobby Case",
  "fotl-hobby-case": "FOTL Hobby Case",
  "first-day-issue-hobby-case": "First Day Issue Hobby Case",
  "jumbo-case": "Jumbo Case",
  "hobby-jumbo-case": "Hobby Jumbo Case",
  "booster-box-case": "Booster Box Case",
  "elite-trainer-box-case": "Elite Trainer Box Case",
  // Fallback for SKUs that didn't match any known suffix during the 0013
  // backfill. Renders as the human-readable product field instead.
  box: "Box",
};

// Cheapest/smallest → most expensive/largest. Used to lay out the variant
// selector in the order most buyers expect to see it. Single-box variants
// listed first; case variants follow in the same order.
const VARIANT_ORDER: string[] = [
  // Single boxes
  "blaster-box",
  "hanger-box",
  "mega-box",
  "hobby-box",
  "fotl-hobby-box",
  "first-day-issue-hobby-box",
  "jumbo-box",
  "hobby-jumbo-box",
  "first-day-issue-hobby-jumbo-box",
  "booster-box",
  "elite-trainer-box",
  "inner-case",
  // Cases (same order, mirrored)
  "blaster-case",
  "hanger-case",
  "mega-case",
  "hobby-case",
  "fotl-hobby-case",
  "first-day-issue-hobby-case",
  "jumbo-case",
  "hobby-jumbo-case",
  "booster-box-case",
  "elite-trainer-box-case",
];

/**
 * Visual grouping for the variant selector — TWO buckets, single vs
 * sealed case. Suffix-based so it works uniformly across sports
 * (hobby-box → single, hobby-case → case) and Pokemon (booster-box,
 * elite-trainer-box, booster-bundle, mini-tin → single; their *-case
 * counterparts → case).
 *
 * Earlier version had a third "tcg" group which lumped all Pokemon
 * variants together — meant Booster Box, ETB, and ETB Case all showed
 * in one row instead of single-on-top, case-below.
 */
export type VariantGroup = "single" | "case";

export const VARIANT_GROUP_LABEL: Record<VariantGroup, string> = {
  single: "Single",
  case: "Sealed case",
};

export function variantGroupOf(type: string | null | undefined): VariantGroup {
  if (!type) return "single";
  // Anything ending in -case (or the bare "case" / "inner-case" odd
  // legacy values) groups under sealed case. Everything else is a
  // single item, regardless of sport.
  if (type === "case" || type === "inner-case") return "case";
  if (type.endsWith("-case")) return "case";
  return "single";
}

export function variantLabel(type: string | null | undefined): string {
  if (!type) return "Box";
  return (
    VARIANT_LABELS[type] ??
    type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function variantSortIndex(type: string | null | undefined): number {
  if (!type) return VARIANT_ORDER.length;
  const i = VARIANT_ORDER.indexOf(type);
  return i === -1 ? VARIANT_ORDER.length : i;
}

/**
 * Sort variants by manual variant_sort first (admin drag-drop on the
 * variant selector chips), falling through to the canonical
 * VARIANT_ORDER for any sibling that hasn't been manually sorted.
 *
 * Manual rank null + canonical rank tie → stable input order.
 */
export function sortByVariantOrder<
  T extends {
    variantType?: string | null;
    variantSort?: number | null;
  },
>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const ra = a.variantSort ?? null;
    const rb = b.variantSort ?? null;
    if (ra !== null && rb !== null) return ra - rb;
    if (ra !== null) return -1; // manually-ranked floats above unranked
    if (rb !== null) return 1;
    return (
      variantSortIndex(a.variantType ?? null) -
      variantSortIndex(b.variantType ?? null)
    );
  });
}

/**
 * Box ↔ Case pairing map. Used by the image-sync hook in
 * src/app/actions/admin.ts: when an admin uploads or pastes an image
 * for a Hobby Box, we mirror it to the Hobby Case (and vice versa)
 * so a product page never has one variant with a real photo and the
 * other showing a generic gradient.
 *
 * Mostly a swap of -box ↔ -case at the end of the slug, but a few
 * special cases:
 *   - booster-box ↔ booster-box-case (append -case, don't swap)
 *   - elite-trainer-box ↔ elite-trainer-box-case (same)
 *   - first-day-issue-hobby-jumbo-box has no case sibling (Topps
 *     never made one — leave unmapped so we don't accidentally write
 *     it to a non-existent SKU)
 */
const VARIANT_PAIR: Record<string, string> = {
  "hobby-box": "hobby-case",
  "hobby-case": "hobby-box",
  "mega-box": "mega-case",
  "mega-case": "mega-box",
  "blaster-box": "blaster-case",
  "blaster-case": "blaster-box",
  "hanger-box": "hanger-case",
  "hanger-case": "hanger-box",
  "jumbo-box": "jumbo-case",
  "jumbo-case": "jumbo-box",
  "hobby-jumbo-box": "hobby-jumbo-case",
  "hobby-jumbo-case": "hobby-jumbo-box",
  "fotl-hobby-box": "fotl-hobby-case",
  "fotl-hobby-case": "fotl-hobby-box",
  "first-day-issue-hobby-box": "first-day-issue-hobby-case",
  "first-day-issue-hobby-case": "first-day-issue-hobby-box",
  "booster-box": "booster-box-case",
  "booster-box-case": "booster-box",
  "elite-trainer-box": "elite-trainer-box-case",
  "elite-trainer-box-case": "elite-trainer-box",
};

/**
 * Returns the matching variant_type for a box/case pair, or null if
 * the variant has no canonical pair (Pokemon ETB-only products,
 * one-off retail variants, etc.).
 */
export function pairedVariantType(
  type: string | null | undefined,
): string | null {
  if (!type) return null;
  return VARIANT_PAIR[type] ?? null;
}
