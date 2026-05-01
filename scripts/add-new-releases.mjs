#!/usr/bin/env node
/**
 * Insert newest hot 2025/2026 SKUs (Topps Chrome Football across all retail
 * tiers, Pokemon Mega Evolution, Topps Chrome Black premium, Stadium Club,
 * Bowman Mega) and download their StockX product photos.
 *
 * Idempotent: if a slug already exists in the skus table, we skip the
 * insert and only refresh the image.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = resolve(__dirname, "..", "public", "products");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Deterministic UUIDv5-ish from a string so re-runs produce the same id.
function uuidFromSlug(slug) {
  const hash = createHash("sha1").update(`waxdepot:${slug}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "5" + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join("-");
}

// year_full: e.g. 2025 or "2025-26" multi-year (basketball/hockey)
const NEW_SKUS = [
  // ── Topps Chrome Football: full retail-tier coverage ─────────────────
  {
    slug: "2025-topps-chrome-football-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Hobby Box",
    sport: "NFL",
    release_date: "2026-04-15",
    description:
      "Topps Chrome NFL flagship. The chrome refractor experience for football — 2 autographs per box, plus rainbow refractor parallels.",
    gradient: ["#475569", "#cbd5e1"],
    stockx_key: "2025-Topps-Chrome-Football-Hobby-Box",
  },
  {
    slug: "2025-topps-chrome-football-mega-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Mega Box",
    sport: "NFL",
    release_date: "2026-04-15",
    description:
      "Walmart-exclusive Mega Box edition. Same Chrome design, retail-friendly price point, with Mega-exclusive parallels.",
    gradient: ["#7c2d12", "#fbbf24"],
    stockx_key: "2025-Topps-Chrome-Football-Mega-Box",
  },
  {
    slug: "2025-topps-chrome-football-value-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Value Box",
    sport: "NFL",
    release_date: "2026-04-15",
    description:
      "Target-exclusive Value Box. Lighter pack count than Hobby but still chrome refractor parallels and hits.",
    gradient: ["#dc2626", "#fbbf24"],
    stockx_key: "2025-Topps-Chrome-Football-Value-Box",
  },
  // ── Topps Chrome Black (premium baseball) ────────────────────────────
  {
    slug: "2026-topps-chrome-black-baseball-hobby-box",
    year: 2026,
    brand: "Topps",
    set_name: "Chrome Black",
    product: "Hobby Box",
    sport: "MLB",
    release_date: "2026-08-19",
    description:
      "Premium black-edition Topps Chrome. 2 on-card autographs per box, every card a numbered parallel.",
    gradient: ["#0a0a0a", "#525252"],
    stockx_key: "2026-Topps-Chrome-Black-Baseball-Hobby-Box",
  },
  // ── Bowman Mega Box (retail gateway) ─────────────────────────────────
  {
    slug: "2025-bowman-baseball-mega-box",
    year: 2025,
    brand: "Bowman",
    set_name: "Bowman",
    product: "Mega Box",
    sport: "MLB",
    release_date: "2025-04-30",
    description:
      "Walmart-exclusive Mega Box of 2025 Bowman. Mega-exclusive Mojo refractors and rookie cards.",
    gradient: ["#1d4ed8", "#fbbf24"],
    stockx_key: "2025-Bowman-Baseball-Mega-Box",
  },
  // ── Stadium Club (collector favorite) ────────────────────────────────
  {
    slug: "2025-topps-stadium-club-baseball-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Stadium Club",
    product: "Hobby Box",
    sport: "MLB",
    release_date: "2025-08-13",
    description:
      "Premium photography-driven baseball release. 2 autographs per box, beautiful chrome and refractor variants.",
    gradient: ["#0e7490", "#67e8f9"],
    stockx_key: "2025-Topps-Stadium-Club-Baseball-Hobby-Box",
  },
  // ── More Topps 2025 baseball releases (Series 2, premium tier) ──
  {
    slug: "2025-topps-series-2-baseball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Series 2", product: "Hobby Box",
    sport: "MLB", release_date: "2025-06-11",
    description: "Topps Series 2 — second half of the flagship 350-card base set, plus retired-player hits.",
    gradient: ["#dc2626", "#0f172a"],
    stockx_key: "2025-Topps-Series-2-Baseball-Hobby-Box",
  },
  {
    slug: "2025-topps-pristine-baseball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Pristine", product: "Hobby Box",
    sport: "MLB", release_date: "2025-10-15",
    description: "Premium baseball — all hits, no base. 8 cards including 4 autos and 4 mem.",
    gradient: ["#0f172a", "#fbbf24"],
    stockx_key: "2025-Topps-Pristine-Baseball-Hobby-Box",
  },
  {
    slug: "2025-topps-five-star-baseball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Five Star", product: "Hobby Box",
    sport: "MLB", release_date: "2025-11-19",
    description: "Ultra-premium — 4 cards per pack, all on-card autos and patches.",
    gradient: ["#7c2d12", "#fbbf24"],
    stockx_key: "2025-Topps-Five-Star-Baseball-Hobby-Box",
  },
  {
    slug: "2025-topps-tribute-baseball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Tribute", product: "Hobby Box",
    sport: "MLB", release_date: "2025-09-03",
    description: "High-end tribute set focused on legends + rookies. 4 autos + 2 relics per box.",
    gradient: ["#1e40af", "#fde047"],
    stockx_key: "2025-Topps-Tribute-Baseball-Hobby-Box",
  },
  {
    slug: "2025-topps-sterling-baseball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Sterling", product: "Hobby Box",
    sport: "MLB", release_date: "2025-12-10",
    description: "Sterling silver-finished cards. 5 autos per box on average, all on-card.",
    gradient: ["#475569", "#f5f5f4"],
    stockx_key: "2025-Topps-Sterling-Baseball-Hobby-Box",
  },
  {
    slug: "2025-topps-holiday-baseball-mega-box",
    year: 2025, brand: "Topps", set_name: "Holiday", product: "Mega Box",
    sport: "MLB", release_date: "2025-11-26",
    description: "Walmart-exclusive holiday-themed Mega Box. Snow/metallic parallels.",
    gradient: ["#dc2626", "#15803d"],
    stockx_key: "2025-Topps-Holiday-Baseball-Mega-Box",
  },
  {
    slug: "2025-topps-chrome-baseball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Chrome", product: "Hobby Box",
    sport: "MLB", release_date: "2025-08-13",
    description: "Topps Chrome flagship — chromium refractor parallels of Series 1+2 base.",
    gradient: ["#475569", "#cbd5e1"],
    stockx_key: "2025-Topps-Chrome-Baseball-Hobby-Box",
  },
  // ── 2025-26 NBA Topps additions (Cosmic Chrome already in catalog) ──
  {
    slug: "2025-26-topps-chrome-basketball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Chrome", product: "Hobby Box",
    sport: "NBA", release_date: "2026-04-22",
    description: "First-year Topps Chrome Basketball after the NBA license return. Wembanyama/Flagg refractors.",
    gradient: ["#0f172a", "#cbd5e1"],
    stockx_key: "2025-26-Topps-Chrome-Basketball-Hobby-Box",
  },
  {
    slug: "2025-26-topps-finest-basketball-hobby-box",
    year: 2025, brand: "Topps", set_name: "Finest", product: "Hobby Box",
    sport: "NBA", release_date: "2026-06-17",
    description: "Topps Finest Basketball — high-end refractors and on-card autos.",
    gradient: ["#1e1b4b", "#fbbf24"],
    stockx_key: "2025-26-Topps-Finest-Basketball-Hobby-Box",
  },
  // Note: Soccer (Panini Prizm Premier League etc.) requires the DB enum
  // to include 'Soccer' first. Run this in the Supabase SQL editor:
  //   ALTER TYPE sport ADD VALUE IF NOT EXISTS 'Soccer';
  // then uncomment the soccer entry and re-run.
  // {
  //   slug: "2024-25-panini-prizm-premier-league-soccer-hobby-box",
  //   year: 2024, brand: "Panini", set_name: "Prizm Premier League",
  //   product: "Hobby Box", sport: "Soccer", release_date: "2025-04-23",
  //   description: "EPL-licensed Prizm rookies + rainbow parallels.",
  //   gradient: ["#0c4a6e", "#7dd3fc"],
  //   stockx_key: "2024-25-Panini-Prizm-Premier-League-Soccer-Hobby-Box",
  // },
  {
    slug: "2024-25-panini-flawless-basketball-hobby-box",
    year: 2024,
    brand: "Panini",
    set_name: "Flawless",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2025-12-10",
    description:
      "The most expensive NBA box money can buy. 10 cards including diamond-embedded autograph patches.",
    gradient: ["#1e1b4b", "#fbbf24"],
    stockx_key: "2024-25-Panini-Flawless-Basketball-Hobby-Box",
  },
  {
    slug: "2025-bowman-chrome-baseball-hobby-box",
    year: 2025,
    brand: "Bowman",
    set_name: "Chrome",
    product: "Hobby Box",
    sport: "MLB",
    release_date: "2025-08-27",
    description:
      "Bowman Chrome flagship. The single biggest set for prospect chrome rookie cards and refractor autos.",
    gradient: ["#475569", "#f87171"],
    stockx_key: "2025-Bowman-Chrome-Baseball-Hobby-Box",
  },
  {
    slug: "2025-topps-chrome-sapphire-edition-baseball-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome Sapphire Edition",
    product: "Hobby Box",
    sport: "MLB",
    release_date: "2025-09-24",
    description:
      "Online-exclusive Topps Chrome variant on sapphire-blue stock. Limited print, premium parallels.",
    gradient: ["#0f172a", "#3b82f6"],
    stockx_key: "2025-Topps-Chrome-Sapphire-Edition-Baseball-Hobby-Box",
  },
  {
    slug: "2024-25-panini-donruss-basketball-hobby-box",
    year: 2024,
    brand: "Panini",
    set_name: "Donruss",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2024-12-04",
    description:
      "Panini Donruss Basketball flagship. Optic Press Proofs, Rated Rookies, broadly accessible price point.",
    gradient: ["#7c2d12", "#fde047"],
    stockx_key: "2024-25-Panini-Donruss-Basketball-Hobby-Box",
  },
  {
    slug: "2024-25-panini-hoops-basketball-hobby-box",
    year: 2024,
    brand: "Panini",
    set_name: "Hoops",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2024-11-13",
    description:
      "Panini Hoops Basketball. Entry-tier NBA with 4 autographs/memorabilia per box.",
    gradient: ["#7c2d12", "#fb923c"],
    stockx_key: "2024-25-Panini-Hoops-Basketball-Hobby-Box",
  },
];

async function fetchJpg(key) {
  const url = `https://images.stockx.com/images/${key}.jpg`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: "https://stockx.com/" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`only ${buf.length} bytes`);
  return buf;
}

console.log(`\nAdding ${NEW_SKUS.length} new SKUs to catalog\n`);
let inserted = 0;
let imageOk = 0;

for (const sku of NEW_SKUS) {
  const id = uuidFromSlug(sku.slug);
  const row = {
    id,
    slug: sku.slug,
    year: sku.year,
    brand: sku.brand,
    set_name: sku.set_name,
    product: sku.product,
    sport: sku.sport,
    release_date: sku.release_date,
    description: sku.description,
    gradient_from: sku.gradient[0],
    gradient_to: sku.gradient[1],
    image_url: null, // set after image download
  };
  // upsert so re-running is safe
  const { error: upErr } = await sb.from("skus").upsert(row, { onConflict: "slug" });
  if (upErr) {
    console.log(`  ✗ ${sku.slug} insert: ${upErr.message}`);
    continue;
  }
  inserted++;

  try {
    const buf = await fetchJpg(sku.stockx_key);
    const dest = resolve(PRODUCTS_DIR, `${sku.slug}.jpg`);
    writeFileSync(dest, buf);
    await sb
      .from("skus")
      .update({ image_url: `/products/${sku.slug}.jpg` })
      .eq("id", id);
    console.log(`  ✓ ${(buf.length / 1024).toFixed(0).padStart(3)} KB ${sku.slug}`);
    imageOk++;
  } catch (e) {
    console.log(`  + (no image yet) ${sku.slug}: ${e.message}`);
  }
}

console.log(
  `\n=== ${inserted} SKUs upserted, ${imageOk} images downloaded ===`,
);
