/**
 * Display labels and ordering for variant_type values stored on the skus
 * table. Each release has 1-N variants (Hobby Box, Hobby Case, Mega Box,
 * etc.); the product page groups them under a shared variant_group slug
 * and lets buyers toggle between markets.
 *
 * Brand-naming notes:
 *   - Topps uses "First Day Issue" (FDI) for early-print variants
 *   - Panini uses "First Off The Line" (FOTL) for the same idea
 * The two are distinct variant_types so display labels stay accurate.
 */

export const VARIANT_LABELS: Record<string, string> = {
  "blaster-box": "Blaster Box",
  "hanger-box": "Hanger Box",
  "value-box": "Value Box",
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
  "hobby-case": "Hobby Case",
  // Fallback for SKUs that didn't match any known suffix during the 0013
  // backfill. Renders as the human-readable product field instead.
  box: "Box",
};

// Cheapest/smallest → most expensive/largest. Used to lay out the variant
// selector in the order most buyers expect to see it.
const VARIANT_ORDER: string[] = [
  "blaster-box",
  "hanger-box",
  "value-box",
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
  "hobby-case",
];

/**
 * Visual grouping for the variant selector — three buckets so buyers
 * see a clean "single box vs case vs retail" decision instead of one
 * long row of chips. Order within each group still follows VARIANT_ORDER.
 */
export type VariantGroup = "box" | "retail" | "case" | "tcg";

const VARIANT_GROUP_MAP: Record<string, VariantGroup> = {
  // Hobby / premium single-box product
  "hobby-box": "box",
  "fotl-hobby-box": "box",
  "first-day-issue-hobby-box": "box",
  "jumbo-box": "box",
  "hobby-jumbo-box": "box",
  "first-day-issue-hobby-jumbo-box": "box",
  // Retail single-box product (Walmart / Target shelf SKUs)
  "blaster-box": "retail",
  "hanger-box": "retail",
  "value-box": "retail",
  "mega-box": "retail",
  // Sealed cases
  "hobby-case": "case",
  "inner-case": "case",
  // Pokemon / TCG
  "booster-box": "tcg",
  "elite-trainer-box": "tcg",
};

export const VARIANT_GROUP_LABEL: Record<VariantGroup, string> = {
  box: "Hobby box",
  retail: "Retail",
  case: "Sealed case",
  tcg: "TCG",
};

export function variantGroupOf(type: string | null | undefined): VariantGroup {
  if (!type) return "box";
  return VARIANT_GROUP_MAP[type] ?? "box";
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

export function sortByVariantOrder<T extends { variantType?: string | null }>(
  arr: T[],
): T[] {
  return [...arr].sort(
    (a, b) =>
      variantSortIndex(a.variantType ?? null) -
      variantSortIndex(b.variantType ?? null),
  );
}
