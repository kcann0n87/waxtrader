#!/usr/bin/env node
/**
 * Generates 5 years of catalog SKUs (2021-2025) for NBA / NFL / MLB / NHL
 * across the most-traded product lines per sport. Output goes to
 * /tmp/historical-skus.sql which you paste into the Supabase SQL editor.
 *
 * EVERY GENERATED SKU IS HIDDEN (is_published = false). Admins flip the
 * publish toggle in /admin/catalog when they're ready to release each
 * year. This lets you stage the catalog now and launch it later.
 *
 * Each SKU gets:
 *   - slug, year, brand, sport, set_name, product = 'Hobby Box'
 *   - release_date = best-guess by sport season
 *   - description = "<year> <brand> <set> <SPORT> Hobby Box."
 *   - image_url = null (admin uploads via /admin/catalog inline)
 *   - gradient_from / gradient_to = sport-themed defaults
 *   - is_published = false
 *
 * The variant_group + variant_type derive automatically via the trigger
 * from migration 0013/0016/0018.
 *
 * Usage:
 *   node scripts/generate-historical-skus.mjs > /tmp/historical-skus.sql
 *   # then paste /tmp/historical-skus.sql into Supabase SQL editor
 */

// Per-sport configuration. Each entry: { years, brand, sets[], releaseMonth }
// releaseMonth: which month of the year+1 (basketball/hockey) or year (other)
// the product typically releases. Best guess only — admin should adjust
// dates per SKU after import.
const SPORT_CONFIG = {
  NBA: {
    yearLabel: "season", // 2024 = "2024-25 season"
    sportSlug: "basketball",
    seasonalReleaseMonth: 2, // Feb of (year+1) for typical hobby flagship
    sets: {
      // Panini-era NBA (2021-2024 seasons)
      panini: [
        { name: "Prizm", brand: "Panini" },
        { name: "Donruss", brand: "Panini" },
        { name: "Donruss Optic", brand: "Panini" },
        { name: "Hoops", brand: "Panini" },
        { name: "Select", brand: "Panini" },
        { name: "Mosaic", brand: "Panini" },
        { name: "National Treasures", brand: "Panini" },
        { name: "Immaculate", brand: "Panini" },
        { name: "Flawless", brand: "Panini" },
        { name: "Spectra", brand: "Panini" },
        { name: "Court Kings", brand: "Panini" },
      ],
      // Topps-era NBA (starts 2025-26 season)
      topps: [
        { name: "Chrome", brand: "Topps" },
        { name: "Cosmic Chrome", brand: "Topps" },
        { name: "Chrome Sapphire Edition", brand: "Topps" },
        { name: "Finest", brand: "Topps" },
        { name: "Inception", brand: "Topps" },
        { name: "Bowman Best", brand: "Topps" },
        { name: "Bowman U", brand: "Topps" },
      ],
    },
    transitionYear: 2025, // Topps NBA started 2025-26 season
  },
  NFL: {
    yearLabel: "season",
    sportSlug: "football",
    seasonalReleaseMonth: 10, // October release for hobby flagship
    sets: {
      // Panini-era NFL (2021-2024 seasons)
      panini: [
        { name: "Prizm", brand: "Panini" },
        { name: "Donruss", brand: "Panini" },
        { name: "Donruss Optic", brand: "Panini" },
        { name: "Select", brand: "Panini" },
        { name: "Mosaic", brand: "Panini" },
        { name: "National Treasures", brand: "Panini" },
        { name: "Immaculate", brand: "Panini" },
        { name: "Contenders", brand: "Panini" },
        { name: "Spectra", brand: "Panini" },
        { name: "Phoenix", brand: "Panini" },
      ],
      // Topps-era NFL (starts 2025 season)
      topps: [
        { name: "Chrome", brand: "Topps" },
        { name: "Inception", brand: "Topps" },
      ],
    },
    transitionYear: 2025,
  },
  MLB: {
    yearLabel: "year",
    sportSlug: "baseball",
    seasonalReleaseMonth: 7, // July hobby flagship
    sets: {
      topps: [
        { name: "Chrome", brand: "Topps" },
        { name: "Series 1", brand: "Topps" },
        { name: "Series 2", brand: "Topps" },
        { name: "Update", brand: "Topps" },
        { name: "Heritage", brand: "Topps" },
        { name: "Allen & Ginter", brand: "Topps" },
        { name: "Stadium Club", brand: "Topps" },
        { name: "Pristine", brand: "Topps" },
        { name: "Five Star", brand: "Topps" },
        { name: "Sterling", brand: "Topps" },
        { name: "Tribute", brand: "Topps" },
        { name: "Tier One", brand: "Topps" },
        { name: "Bowman", brand: "Bowman" },
        { name: "Bowman Chrome", brand: "Bowman" },
        { name: "Bowman Draft", brand: "Bowman" },
        { name: "Bowman Platinum", brand: "Bowman" },
      ],
    },
  },
  NHL: {
    yearLabel: "season",
    sportSlug: "hockey",
    seasonalReleaseMonth: 2,
    sets: {
      ud: [
        { name: "Series 1", brand: "Upper Deck" },
        { name: "Series 2", brand: "Upper Deck" },
        { name: "SP", brand: "Upper Deck" },
        { name: "SP Authentic", brand: "Upper Deck" },
        { name: "The Cup", brand: "Upper Deck" },
        { name: "Black Diamond", brand: "Upper Deck" },
        { name: "Synergy", brand: "Upper Deck" },
      ],
    },
  },
};

const GRADIENT_BY_SPORT = {
  NBA: { from: "#7c3aed", to: "#0ea5e9" },
  NFL: { from: "#1e40af", to: "#a855f7" },
  MLB: { from: "#16a34a", to: "#84cc16" },
  NHL: { from: "#0891b2", to: "#1e3a8a" },
};

// Slugify a set name. "Allen & Ginter" -> "allen-and-ginter", etc.
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Educated-guess release date for a given (sport, year).
function releaseDateFor(sport, year, monthDefault) {
  // Basketball / hockey use season notation (year-(year+1)), released
  // around year+1 hobby month. Football releases late in `year`, baseball
  // mid-`year`.
  if (sport === "NBA" || sport === "NHL") {
    return `${year + 1}-${String(monthDefault).padStart(2, "0")}-15`;
  }
  return `${year}-${String(monthDefault).padStart(2, "0")}-15`;
}

function yearLabelFor(sport, year) {
  if (sport === "NBA" || sport === "NHL") {
    return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
  }
  return String(year);
}

// SQL escape helpers
const sql = (s) => s.replace(/'/g, "''");

// Build all SKUs
const rows = [];
const YEARS = [2021, 2022, 2023, 2024, 2025];

for (const [sport, cfg] of Object.entries(SPORT_CONFIG)) {
  const grad = GRADIENT_BY_SPORT[sport];
  for (const year of YEARS) {
    for (const setGroupName of Object.keys(cfg.sets)) {
      const sets = cfg.sets[setGroupName];

      // For NBA/NFL: respect the brand transition (Panini/Topps eras)
      const isPaniniEra = setGroupName === "panini";
      const isToppsEra = setGroupName === "topps";
      if (isPaniniEra && cfg.transitionYear && year >= cfg.transitionYear) continue;
      if (isToppsEra && cfg.transitionYear && year < cfg.transitionYear) continue;

      for (const set of sets) {
        const yearLabel = yearLabelFor(sport, year);
        const slug = `${yearLabel}-${slugify(set.brand)}-${slugify(set.name)}-${cfg.sportSlug}-hobby-box`;
        const release = releaseDateFor(sport, year, cfg.seasonalReleaseMonth);
        const sportName = sport === "MLB" ? "MLB" : sport;
        const description = `${yearLabel} ${set.brand} ${set.name} ${sportName} Hobby Box.`;

        rows.push(
          `  ('${slug}', ${year}, '${sql(set.brand)}', '${sport}', '${sql(set.name)}', 'Hobby Box', '${release}', '${sql(description)}', null, '${grad.from}', '${grad.to}', false)`,
        );
      }
    }
  }
}

console.log(
  `-- Auto-generated by scripts/generate-historical-skus.mjs on ${new Date().toISOString().slice(0, 10)}.`,
);
console.log(`-- ${rows.length} historical SKUs across NBA/NFL/MLB/NHL, 2021-2025.`);
console.log(`-- ALL SKUs are is_published = false (hidden from public). Admin`);
console.log(`-- flips the toggle in /admin/catalog when ready to release.`);
console.log(`--`);
console.log(`-- The variant_group + variant_type derive automatically via the`);
console.log(`-- _skus_derive_variant trigger from migration 0013/0016/0018.\n`);

console.log(
  `insert into skus (slug, year, brand, sport, set_name, product, release_date, description, image_url, gradient_from, gradient_to, is_published)\nvalues`,
);
console.log(rows.join(",\n"));
console.log(`on conflict (slug) do nothing;`);
