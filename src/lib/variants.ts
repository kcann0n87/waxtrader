/**
 * Display labels and ordering for variant_type values stored on the skus
 * table. Each release has 1-N variants (Hobby Box, Hobby Case, Mega Box,
 * etc.); the product page groups them under a shared variant_group slug
 * and lets buyers toggle between markets.
 */

export const VARIANT_LABELS: Record<string, string> = {
  "blaster-box": "Blaster Box",
  "hanger-box": "Hanger Box",
  "value-box": "Value Box",
  "mega-box": "Mega Box",
  "hobby-box": "Hobby Box",
  "fotl-hobby-box": "FOTL Hobby Box",
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
  "jumbo-box",
  "hobby-jumbo-box",
  "booster-box",
  "elite-trainer-box",
  "inner-case",
  "hobby-case",
];

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
