#!/usr/bin/env node
/**
 * Single-pass catalog refresh:
 *   1. Generates a rich, on-brand description for every SKU in the DB based
 *      on a curated set knowledge map + the SKU's brand/set/product/sport.
 *   2. Re-downloads the StockX direct-CDN image (box photo, not a single
 *      card) for every SKU using strict box-anchored URL keys, with
 *      brand-specific overrides for the SKUs whose CDN key doesn't match
 *      a clean transform of our slug.
 *   3. Updates each SKU row with the new description and image_url.
 *
 * Run with:
 *   node --env-file=.env.local scripts/refresh-catalog.mjs
 *
 * Idempotent. Safe to re-run.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = resolve(__dirname, "..", "public", "products");
if (!existsSync(PRODUCTS_DIR)) mkdirSync(PRODUCTS_DIR, { recursive: true });

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// ============================================================================
// Description knowledge map
// ============================================================================
//
// Keyed by `${brand}|${set_name}` (case-sensitive). Each entry contains:
//   - identity:  what the product is and its hobby standing
//   - chase:     parallels/hits collectors hunt
// Box configuration is derived per-product from CONFIG below.
//
// Anything not in this map gets a sensible generic description.

const SETS = {
  // ── Topps MLB ──────────────────────────────────────────────────────
  "Topps|Series 1": {
    identity:
      "The flagship of baseball cards. Topps Series 1 is the season opener — every active MLB rookie's first base card lives here.",
    chase: "1989 35th anniversary inserts, on-card autos, gold /2025 parallels",
  },
  "Topps|Series 2": {
    identity:
      "The mid-summer follow-up to Series 1. New rookies that broke camp late, plus updated photos and fresh insert sets.",
    chase: "1989 35th inserts continued, gold /2025, on-card autos",
  },
  "Topps|Update": {
    identity:
      "The third leg of the flagship trilogy. Update covers post-trade-deadline call-ups and All-Star Game cards — the rookie debut card you actually want.",
    chase: "All-Star ASG inserts, rookie debut RC, on-card autos",
  },
  "Topps|Chrome": {
    identity:
      "Chrome is the cleanest looking refractor product in the hobby. The base set you actually want to keep.",
    chase: "superfractor 1/1, gold refractor /50, atomic, sepia, x-fractor",
  },
  "Topps|Chrome Update": {
    identity:
      "The chrome version of Update Series. Refractor parallels of the rookie-debut and All-Star cards from flagship Update.",
    chase: "superfractor 1/1, gold /50, atomic, on-card auto refractors",
  },
  "Topps|Chrome Black": {
    identity:
      "Premium chrome on a matte-black background. Every card in the set is numbered — there are no base cards.",
    chase: "1/1 superfractor, on-card autos /99, /49, /25",
  },
  "Topps|Chrome Sapphire": {
    identity:
      "Online-exclusive chrome. The deep sapphire-blue base design and the parallel rainbow are the calling cards.",
    chase: "1/1 superfractor, blue refractors /125, gold /50, autos",
  },
  "Topps|Cosmic Chrome": {
    identity:
      "Topps Chrome's cosmic-themed sister set — galaxy backgrounds and refractor parallels with names like Black Hole and Supernova.",
    chase: "supernova 1/1, black hole /5, galactic /25, eclipse /50",
  },
  "Topps|Pristine": {
    identity:
      "Premium encased chrome. Every card is sealed in a hard plastic case, and every box delivers high-end autos and rookie patches.",
    chase: "encased 1/1s, on-card patch autos /25, rookie auto patches",
  },
  "Topps|Five Star": {
    identity:
      "High-end Topps. Five autos or premium relics per box — no base cards, just signed pieces.",
    chase: "five-star signatures /5, jumbo patches, dual/triple autos",
  },
  "Topps|Tier One": {
    identity:
      "Mid-tier autos and bat-knob relics. Three hits per box with a focus on on-card signatures.",
    chase: "Acclaimed Achievements autos, bat knob relics 1/1, dual autos",
  },
  "Topps|Tribute": {
    identity:
      "Veteran-heavy autos and relics. Three hits per box, leans on Hall of Fame signatures.",
    chase: "Tribute autos, jumbo patches /25, cut signatures",
  },
  "Topps|Sterling": {
    identity:
      "Ultra-premium with an emphasis on game-used patches and sterling-silver-stamped signatures.",
    chase: "patch autos /10, sterling signatures /5, 1/1 plates",
  },
  "Topps|Heritage": {
    identity:
      "Modern players on classic 1976 Topps designs. Throwback fans love the design fidelity.",
    chase: "real one autos, chrome refractor /569, action variations",
  },
  "Topps|Stadium Club": {
    identity:
      "The photography card. Wide-angle action shots over a clean low-text design — the most aesthetic flagship product.",
    chase: "Stadium Club autos, chrome refractor /1990, photo variations",
  },
  "Topps|Allen and Ginter": {
    identity:
      "The hobby's quirkiest release. Players, presidents, athletes from other sports, and weird mini-card non-sports inserts.",
    chase: "rip cards, framed mini autos, relics, /5 mini parallels",
  },
  "Topps|Holiday": {
    identity:
      "Walmart-exclusive Mega holiday-themed product. Snowflake parallels, holiday inserts, retail-friendly price.",
    chase: "holiday metallic /50, snowflake parallels, autos",
  },
  "Topps|Finest": {
    identity:
      "Topps Finest — the original chrome-style hobby-only product. Premium finish, focused checklist.",
    chase: "Finest 1/1 superfractors, on-card autos, refractor parallels",
  },

  // ── Bowman MLB ─────────────────────────────────────────────────────
  "Bowman|Bowman": {
    identity:
      "Bowman is the prospecting playground — first Bowman cards (FBC) of MLB's next wave. Every elite minor leaguer debuts here before MLB.",
    chase: "1st Bowman autos, chrome refractor /499, color parallels",
  },
  "Bowman|Chrome": {
    identity:
      "The chrome version of Bowman flagship. Same prospect checklist, refractor finish, on-card autos.",
    chase: "1st Bowman Chrome autos, superfractor 1/1, refractors /499",
  },
  "Bowman|Draft": {
    identity:
      "Every player from the most-recent MLB Draft, plus international prospects. Chrome refractors and on-card autos.",
    chase: "1st Bowman Chrome Draft auto, superfractor, color refractors",
  },
  "Bowman|Platinum": {
    identity:
      "Bowman's platinum-themed parallel-heavy set. Diamond ice and platinum parallels are the calling card.",
    chase: "ice diamond /150, platinum 1/1, top prospect autos",
  },

  // ── Panini NBA ─────────────────────────────────────────────────────
  "Panini|Prizm": {
    identity:
      "Prizm is the hobby's flagship NBA product. The silver, blue ice, and gold parallels carry serious resale weight.",
    chase: "gold prizm /10, black 1/1, silver prizm RCs, color blast inserts",
  },
  "Panini|Prizm Monopoly": {
    identity:
      "Prizm crossed with the Monopoly board — property-themed parallels named after the board's spaces.",
    chase: "Boardwalk 1/1, Park Place /5, railroad parallels, mr. monopoly autos",
  },
  "Panini|Mosaic": {
    identity:
      "Prizm's textured-finish sister product. Same checklist, different parallels and inserts.",
    chase: "genesis 1/1, gold mosaic /10, choice parallels",
  },
  "Panini|Donruss": {
    identity:
      "The longest-running modern set. Rated Rookies and a deep parallel rainbow at every retail tier.",
    chase: "press proof gold /10, blue laser /99, rated rookie autos",
  },
  "Panini|Donruss Optic": {
    identity:
      "Donruss with a chrome refractor finish. Holo Prizm parallels and rated-rookie chrome autos.",
    chase: "holo prizm /99, gold /10, black 1/1, choice parallels",
  },
  "Panini|Hoops": {
    identity:
      "The most affordable NBA hobby release. Big checklists, retail-friendly hits, classic Hoops design.",
    chase: "purple parallels, hoops tribute autos, color rookies",
  },
  "Panini|Select": {
    identity:
      "Three checklist tiers per pack — Concourse, Premier Level, Club Level — with shimmer prizm parallels.",
    chase: "tie-dye prizm /25, gold /10, club-level shimmer prizm",
  },
  "Panini|Court Kings": {
    identity:
      "Original-art NBA cards. Painted player portraits, on-card autos, and signed art parallels.",
    chase: "courtside autos, ruby /49, sapphire /99, original-art autos",
  },
  "Panini|Spectra": {
    identity:
      "Mid-high-end Panini. Refractor finish, autographed patch rookies, neon parallels.",
    chase: "neon green /25, gold /10, RPA on-card autos",
  },
  "Panini|National Treasures": {
    identity:
      "The hobby's headline product. Two-or-three hits per box, every one a premium auto patch or a 1/1.",
    chase: "RPA /99, jumbo patch autos /25, logoman 1/1",
  },
  "Panini|Immaculate": {
    identity:
      "Premium hobby-only product. Five autos or relics per box, leans on encased rookie patches.",
    chase: "RPA /99, sneaker swatch autos, shadowbox /25, logoman 1/1",
  },
  "Panini|Flawless": {
    identity:
      "Ultra-high-end Panini. Every card is encased in acrylic; every box delivers diamond, ruby, or emerald rookies.",
    chase: "diamond rookies /20, ruby autos /15, on-card patch autos",
  },
  "Panini|Contenders": {
    identity:
      "Rookie Ticket on-card autographs are the calling card. Optic refractor parallels in the chrome version.",
    chase: "Rookie Ticket autos, Cracked Ice /22, Championship Ticket 1/1",
  },
  "Panini|Mosaic": {
    identity:
      "The textured-prism sister of Prizm. Same flagship checklist with reactive-blue and genesis parallels.",
    chase: "genesis 1/1, reactive blue /99, choice parallels",
  },

  // ── Upper Deck NHL ────────────────────────────────────────────────
  "Upper Deck|Series 1": {
    identity:
      "The hockey hobby's foundation. Young Guns rookies — the most important NHL rookie cards in the hobby — debut here.",
    chase: "Young Guns RC, exclusives /100, high-gloss /10, canvas",
  },
  "Upper Deck|Series 2": {
    identity:
      "The follow-up to Series 1 — second batch of Young Guns rookies and updated season photography.",
    chase: "Young Guns RC, exclusives /100, canvas /UD-1, high gloss",
  },
  "Upper Deck|SP": {
    identity:
      "Premium UD product. Authentic Rookies are the chase — premium SP rookie cards numbered to the player's jersey.",
    chase: "Authentic Rookies /999, future watch autos, blue ice /50",
  },
  "Upper Deck|SP Authentic": {
    identity:
      "The original Authentic Rookies brand. Numbered rookie cards and on-card autos.",
    chase: "Future Watch Autos, Sign of the Times, /99 jersey rookies",
  },
  "Upper Deck|The Cup": {
    identity:
      "Hockey's Flawless. Encased patches, premium autos, and rookie patch autos numbered to the player's jersey.",
    chase: "Rookie Patch Auto /99, Cup Quad Patches, /1 cup logo patches",
  },
};

// Box configuration per product type.
const CONFIG = {
  "Hobby Box":
    "Hobby Box · the configuration LCS shops break — full pack count, hit guarantees, hobby-only parallels",
  "Jumbo Box":
    "Jumbo Box · oversized packs (typically 32–50 cards) with extra autos and exclusive jumbo parallels",
  "Mega Box":
    "Mega Box · Walmart/Target-exclusive retail with mega-only parallels at a friendly price",
  "Value Box":
    "Value Box · retail value configuration — lighter pack count, retail-only parallels",
  "Blaster Box": "Blaster Box · retail mass-market — quick rip, retail-only parallels",
  "Hanger Box":
    "Hanger Box · retail peg-hanger configuration with hanger-exclusive parallels",
  "Booster Box":
    "Booster Box · TCG sealed product — full booster count with booster-only chase parallels",
  "Elite Trainer Box":
    "Elite Trainer Box · TCG ETB configuration with promo packs, sleeves, and dice",
  "FotL Hobby Box":
    "First-off-the-Line Hobby · pre-release exclusive with FotL-only parallels and limited print run",
};

const ROOKIES = {
  NFL: {
    2025: "Cam Ward, Travis Hunter, Shedeur Sanders, Ashton Jeanty",
    2026: "Arch Manning, Jeremiah Smith, Ryan Williams, DJ Lagway",
  },
  NBA: {
    2025: "Cooper Flagg, Dylan Harper, VJ Edgecombe, Ace Bailey",
    2026: "AJ Dybantsa, Cameron Boozer, Darryn Peterson, Mikel Brown Jr.",
  },
  MLB: {
    2024: "Paul Skenes, Jackson Holliday, Jackson Merrill, James Wood",
    2025: "Roman Anthony, Walker Jenkins, Sebastian Walcott, Ethan Salas",
    2026: "Roki Sasaki, Konnor Griffin, Jasson Domínguez, Christian Moore",
  },
  NHL: {
    2024: "Macklin Celebrini, Lane Hutson, Logan Stankoven, Cutter Gauthier",
    2025: "Matvei Michkov, Berkly Catton, Cayden Lindstrom, Tij Iginla",
  },
};

function rookieClass(sport, year) {
  return ROOKIES[sport]?.[year] ?? null;
}

function generateDescription(sku) {
  const key = `${sku.brand}|${sku.set_name}`;
  const profile = SETS[key];
  const config = CONFIG[sku.product] ?? `${sku.product} · sealed factory configuration`;

  if (profile) {
    const rookies = rookieClass(sku.sport, sku.year);
    const rookieLine = rookies ? ` Rookie class headlined by ${rookies}.` : "";
    return `${profile.identity} ${config}.${rookieLine} Chase: ${profile.chase}.`;
  }

  // Generic fallback for SKUs not in the knowledge map.
  const rookies = rookieClass(sku.sport, sku.year);
  const rookieLine = rookies ? ` Rookies to chase: ${rookies}.` : "";
  return `${sku.year} ${sku.brand} ${sku.set_name} ${sku.sport} sealed wax. ${config}.${rookieLine}`;
}

// ============================================================================
// StockX image refresh — guarantees a box photo, not a single card
// ============================================================================

// SKUs whose StockX image-CDN key doesn't cleanly transform from our slug.
const STOCKX_OVERRIDES = {
  "2025-26-topps-cosmic-chrome-basketball-hobby-box":
    "2026-Topps-Cosmic-Chrome-Basketball-Hobby-Box",
  "2026-topps-series-1-baseball-jumbo-box":
    "2026-Topps-Series-1-Baseball-Hobby-Jumbo-Box",
  "2025-topps-allen-and-ginter-baseball-hobby-box":
    "2025-Topps-Allen-Ginter-Baseball-Hobby-Box",
  "2025-bowman-draft-baseball-jumbo-box":
    "2025-Bowman-Draft-Baseball-Hobby-Box",
  "2024-topps-update-baseball-hobby-box":
    "2024-Topps-Update-Series-Baseball-Hobby-Box",
};

function defaultStockxKey(slug) {
  return slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("-");
}

async function fetchJpg(key) {
  const url = `https://images.stockx.com/images/${key}.jpg`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: "https://stockx.com/" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`only ${buf.length} bytes — likely a placeholder`);
  const sig = buf.slice(0, 4).toString("hex");
  if (!sig.startsWith("ffd8") && !sig.startsWith("89504e47") && !sig.startsWith("52494646")) {
    throw new Error(`not a real image (sig=${sig})`);
  }
  return buf;
}

async function refreshImage(slug) {
  // Skip pure card-show slugs etc — we only handle our box products
  const candidates = [];
  if (STOCKX_OVERRIDES[slug]) candidates.push(STOCKX_OVERRIDES[slug]);
  candidates.push(defaultStockxKey(slug));
  // Try a "Hobby" insertion variant for slugs that say "Jumbo Box" but the
  // CDN key has "Hobby Jumbo Box".
  if (slug.includes("-jumbo-box") && !slug.includes("-hobby-jumbo-box")) {
    candidates.push(defaultStockxKey(slug.replace("-jumbo-box", "-hobby-jumbo-box")));
  }
  for (const key of candidates) {
    try {
      const buf = await fetchJpg(key);
      const dest = resolve(PRODUCTS_DIR, `${slug}.jpg`);
      writeFileSync(dest, buf);
      return { ok: true, key, bytes: buf.length };
    } catch {
      /* try next */
    }
  }
  return { ok: false };
}

// ============================================================================
// Main
// ============================================================================

const REFRESH_IMAGES = process.argv.includes("--images");
const REFRESH_DESCRIPTIONS = !process.argv.includes("--images-only");

const { data: skus, error } = await sb
  .from("skus")
  .select("id, slug, year, brand, set_name, product, sport, image_url, description")
  .order("release_date", { ascending: false });
if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Catalog refresh — ${skus.length} SKUs\n`);

let descUpdated = 0;
let imgUpdated = 0;
let imgFailed = [];

for (const sku of skus) {
  const updates = {};

  if (REFRESH_DESCRIPTIONS) {
    const newDesc = generateDescription(sku);
    if (newDesc !== sku.description) {
      updates.description = newDesc;
    }
  }

  if (REFRESH_IMAGES) {
    const result = await refreshImage(sku.slug);
    if (result.ok) {
      const path = `/products/${sku.slug}.jpg`;
      if (sku.image_url !== path) updates.image_url = path;
      console.log(
        `  📦 ${sku.slug}  ←  ${result.key} (${(result.bytes / 1024).toFixed(0)} KB)`,
      );
      imgUpdated++;
    } else {
      imgFailed.push(sku.slug);
      console.log(`  ✗  ${sku.slug}  — no StockX match`);
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error: upErr } = await sb.from("skus").update(updates).eq("id", sku.id);
    if (upErr) {
      console.log(`  ! ${sku.slug}: ${upErr.message}`);
    } else if (updates.description) {
      descUpdated++;
    }
  }
}

console.log(`\n✓ ${descUpdated} descriptions updated`);
if (REFRESH_IMAGES) {
  console.log(`✓ ${imgUpdated} images refreshed`);
  if (imgFailed.length > 0) {
    console.log(`✗ ${imgFailed.length} images failed:`);
    for (const s of imgFailed) console.log(`    - ${s}`);
  }
}
