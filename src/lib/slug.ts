/**
 * SKU slug generator. Mirrors the convention baked into our migrations:
 *
 *   Sport with multi-season year (NBA, NHL, Soccer):
 *     2025-26-topps-bowman-basketball-hobby-box
 *
 *   Sport with single-year (MLB, NFL):
 *     2025-bowman-baseball-hobby-box
 *
 *   Pokemon TCG (special — brand+sport collapsed into "pokemon-tcg"):
 *     2025-pokemon-tcg-mega-evolution-booster-box
 *
 * If the input is incomplete, returns whatever's deriveable so far —
 * the form can show a partial slug as the user fills fields.
 */

type Sport = "NBA" | "MLB" | "NFL" | "NHL" | "Soccer" | "Pokemon";

const SPORT_SLUG_SEGMENT: Record<Sport, string> = {
  NBA: "basketball",
  MLB: "baseball",
  NFL: "football",
  NHL: "hockey",
  Soccer: "soccer",
  Pokemon: "tcg", // unused — Pokemon is handled specially
};

// NBA, NHL, Soccer span across calendar years (Oct → June). Their year
// segment is "YYYY-YY" (e.g. "2025-26"). MLB, NFL, Pokemon are
// single-year so the segment is just "YYYY".
const MULTI_SEASON_SPORTS: ReadonlySet<Sport> = new Set(["NBA", "NHL", "Soccer"]);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and") // "Allen & Ginter" → "allen-and-ginter"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function yearSegment(year: number, sport: Sport): string {
  if (!MULTI_SEASON_SPORTS.has(sport)) return String(year);
  const next = (year + 1) % 100;
  return `${year}-${next.toString().padStart(2, "0")}`;
}

export function generateSkuSlug(input: {
  year: number | "";
  brand: string;
  setName: string;
  product: string;
  sport: Sport;
}): string {
  const { year, brand, setName, product, sport } = input;
  if (!year) return "";

  // Pokemon has its own slug shape: brand+sport collapse into
  // "pokemon-tcg" regardless of what's typed in the brand field.
  if (sport === "Pokemon") {
    const parts = [String(year), "pokemon", "tcg"];
    if (setName) parts.push(slugify(setName));
    if (product) parts.push(slugify(product));
    return parts.join("-");
  }

  const yr = yearSegment(year, sport);
  const parts = [yr];
  if (brand) parts.push(slugify(brand));
  if (setName) parts.push(slugify(setName));
  parts.push(SPORT_SLUG_SEGMENT[sport]);
  if (product) parts.push(slugify(product));
  return parts.join("-");
}
