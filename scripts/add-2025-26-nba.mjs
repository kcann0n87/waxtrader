#!/usr/bin/env node
/**
 * Add the missing 2025-26 NBA retail tiers and Topps-era products.
 *
 * Why: Topps took over the NBA license starting 2025-26, so the entire
 * 25-26 NBA hobby season is Topps-only. Our DB had Chrome Hobby + Cosmic
 * Chrome Hobby + Finest Hobby but was missing every retail tier (Mega,
 * Blaster, Value, Hanger), the FotL hobby pre-release, the Sapphire
 * online edition, and the supporting brands (Stadium Club, Inception,
 * Bowman U, Bowman Best).
 *
 * Idempotent: deterministic UUIDv5-from-slug + upsert. Safe to re-run.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

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

const SKUS = [
  // ── 2025-26 Topps Chrome Basketball — full retail tier ──────────────
  {
    slug: "2025-26-topps-chrome-basketball-mega-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Mega Box",
    sport: "NBA",
    release_date: "2026-02-04",
    description:
      "Walmart-exclusive Mega configuration of Topps Chrome Basketball. Mega-only refractor parallels (orange wave is the chase), retail-friendly price.",
    gradient_from: "#1e1e2e",
    gradient_to: "#0f0f1a",
  },
  {
    slug: "2025-26-topps-chrome-basketball-blaster-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Blaster Box",
    sport: "NBA",
    release_date: "2026-02-04",
    description:
      "Retail Blaster of Topps Chrome Basketball. 6 packs × 4 cards. Blaster-exclusive lava refractor parallels.",
    gradient_from: "#0c0c1a",
    gradient_to: "#1a0f24",
  },
  {
    slug: "2025-26-topps-chrome-basketball-value-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Value Box",
    sport: "NBA",
    release_date: "2026-02-04",
    description:
      "Target Value Box configuration. Smaller pack count than Hobby but still chrome refractor parallels and Value-exclusive variants.",
    gradient_from: "#1c1530",
    gradient_to: "#080814",
  },
  {
    slug: "2025-26-topps-chrome-basketball-hanger-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Hanger Box",
    sport: "NBA",
    release_date: "2026-02-04",
    description:
      "Retail peg-hanger configuration of Chrome Basketball. Hanger-exclusive aqua refractor parallels.",
    gradient_from: "#0f1a2c",
    gradient_to: "#06070f",
  },
  {
    slug: "2025-26-topps-chrome-basketball-jumbo-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Jumbo Box",
    sport: "NBA",
    release_date: "2026-02-04",
    description:
      "Hobby-only Jumbo configuration. Bigger packs, more autos per box, jumbo-exclusive parallel print runs.",
    gradient_from: "#21172e",
    gradient_to: "#0a0816",
  },
  {
    slug: "2025-26-topps-chrome-basketball-fotl-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "FotL Hobby Box",
    sport: "NBA",
    release_date: "2026-01-28",
    description:
      "First-off-the-Line pre-release. Limited print run with FotL-exclusive black-on-black foil parallels.",
    gradient_from: "#1d0f1f",
    gradient_to: "#06030a",
  },

  // ── 2025-26 Topps Chrome Sapphire (online exclusive) ────────────────
  {
    slug: "2025-26-topps-chrome-sapphire-edition-basketball-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome Sapphire",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2026-04-15",
    description:
      "Topps online-exclusive sapphire-finish Chrome Basketball. Deep blue base + sapphire-themed parallel rainbow (orange, ice, night sky, /99 logo, /50 padparadscha).",
    gradient_from: "#0a1133",
    gradient_to: "#06081a",
  },

  // ── 2025-26 Other Topps NBA brands ──────────────────────────────────
  {
    slug: "2025-26-topps-stadium-club-basketball-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Stadium Club",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2026-05-13",
    description:
      "Stadium Club's signature wide-angle photography meets the new Topps NBA license. The most aesthetic NBA flagship product of the year.",
    gradient_from: "#0d2230",
    gradient_to: "#040910",
  },
  {
    slug: "2025-26-topps-inception-basketball-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Inception",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2026-06-17",
    description:
      "Premium hobby-only Topps Inception Basketball. Encased rookie autographs, jumbo patch autos, and Inception-exclusive parallels.",
    gradient_from: "#1a0f24",
    gradient_to: "#080510",
  },
  {
    slug: "2025-26-topps-bowman-best-basketball-hobby-box",
    year: 2025,
    brand: "Bowman",
    set_name: "Best",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2026-04-29",
    description:
      "Bowman Best Basketball — Topps's prospecting brand expanded to the NBA. Refractor finish, on-card rookie autos, NCAA-to-NBA chase.",
    gradient_from: "#1a1530",
    gradient_to: "#070612",
  },
  {
    slug: "2025-26-topps-bowman-u-basketball-hobby-box",
    year: 2025,
    brand: "Bowman",
    set_name: "U",
    product: "Hobby Box",
    sport: "NBA",
    release_date: "2026-03-11",
    description:
      "Bowman U Basketball — NCAA jerseys for the next NBA wave. Featuring the 2026 draft class in college uniforms before they go pro.",
    gradient_from: "#1f0f12",
    gradient_to: "#0a0506",
  },
];

console.log(`Adding ${SKUS.length} new 2025-26 NBA SKUs\n`);

let inserted = 0;
let updated = 0;
for (const s of SKUS) {
  const id = uuidFromSlug(s.slug);
  const { data: existing } = await sb
    .from("skus")
    .select("id")
    .eq("slug", s.slug)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from("skus")
      .update({
        year: s.year,
        brand: s.brand,
        set_name: s.set_name,
        product: s.product,
        sport: s.sport,
        release_date: s.release_date,
        description: s.description,
        gradient_from: s.gradient_from,
        gradient_to: s.gradient_to,
      })
      .eq("id", existing.id);
    if (error) {
      console.log(`  ! ${s.slug}: ${error.message}`);
    } else {
      console.log(`  ↻ updated  ${s.slug}`);
      updated++;
    }
  } else {
    const { error } = await sb.from("skus").insert({ id, ...s });
    if (error) {
      console.log(`  ! ${s.slug}: ${error.message}`);
    } else {
      console.log(`  + inserted ${s.slug}`);
      inserted++;
    }
  }
}

console.log(
  `\n✓ ${inserted} inserted, ${updated} updated. Run scripts/refresh-catalog.mjs --images to fetch box photos.`,
);
