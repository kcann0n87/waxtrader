#!/usr/bin/env node
/**
 * Add the missing 2025 NFL retail tiers — Topps Chrome Football already has
 * Hobby/Mega/Value but was missing Blaster/Hanger/FotL/Jumbo. Same idea
 * applies to a couple Panini retail variants.
 *
 * Idempotent: deterministic UUIDv5 + upsert. Safe to re-run.
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
  // ── 2025 Topps Chrome Football retail tiers ─────────────────────────
  {
    slug: "2025-topps-chrome-football-blaster-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Blaster Box",
    sport: "NFL",
    release_date: "2025-12-03",
    description:
      "Retail Blaster of Topps Chrome Football. 6 packs × 4 cards. Blaster-exclusive lava refractor parallels.",
    gradient_from: "#1c0814",
    gradient_to: "#0a0306",
  },
  {
    slug: "2025-topps-chrome-football-hanger-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Hanger Box",
    sport: "NFL",
    release_date: "2025-12-03",
    description:
      "Retail peg-hanger configuration. Hanger-exclusive aqua refractor parallels and a cheaper way into the Chrome rainbow.",
    gradient_from: "#0d1a2c",
    gradient_to: "#04070d",
  },
  {
    slug: "2025-topps-chrome-football-jumbo-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "Jumbo Box",
    sport: "NFL",
    release_date: "2025-12-03",
    description:
      "Hobby-only Jumbo configuration. Bigger packs, more autos per box, jumbo-exclusive parallel print runs.",
    gradient_from: "#1c1530",
    gradient_to: "#070612",
  },
  {
    slug: "2025-topps-chrome-football-fotl-hobby-box",
    year: 2025,
    brand: "Topps",
    set_name: "Chrome",
    product: "FotL Hobby Box",
    sport: "NFL",
    release_date: "2025-11-26",
    description:
      "First-off-the-Line pre-release. Limited print run with FotL-exclusive black-on-black foil parallels.",
    gradient_from: "#1d0f1f",
    gradient_to: "#06030a",
  },

  // ── 2025 Panini Prizm Football retail tiers ─────────────────────────
  {
    slug: "2025-panini-prizm-football-mega-box",
    year: 2025,
    brand: "Panini",
    set_name: "Prizm",
    product: "Mega Box",
    sport: "NFL",
    release_date: "2025-12-10",
    description:
      "Walmart Mega Box configuration. Mega-only orange wave and pink ice prizm parallels.",
    gradient_from: "#1f0a14",
    gradient_to: "#070306",
  },
  {
    slug: "2025-panini-prizm-football-blaster-box",
    year: 2025,
    brand: "Panini",
    set_name: "Prizm",
    product: "Blaster Box",
    sport: "NFL",
    release_date: "2025-12-10",
    description:
      "Retail Blaster of Prizm Football. Blaster-exclusive blue ice and red ice prizm parallels.",
    gradient_from: "#1a0a25",
    gradient_to: "#06030a",
  },
  {
    slug: "2025-panini-prizm-football-hanger-box",
    year: 2025,
    brand: "Panini",
    set_name: "Prizm",
    product: "Hanger Box",
    sport: "NFL",
    release_date: "2025-12-10",
    description:
      "Retail peg-hanger Prizm Football. Hanger-exclusive purple wave parallels.",
    gradient_from: "#170c2c",
    gradient_to: "#04030a",
  },
  {
    slug: "2025-panini-donruss-football-mega-box",
    year: 2025,
    brand: "Panini",
    set_name: "Donruss",
    product: "Mega Box",
    sport: "NFL",
    release_date: "2025-08-13",
    description:
      "Donruss Football retail Mega. Press Proof Gold Mega parallels and rated rookie inserts.",
    gradient_from: "#1c1a30",
    gradient_to: "#06070d",
  },
];

console.log(`Adding ${SKUS.length} NFL retail SKUs\n`);

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

console.log(`\n✓ ${inserted} inserted, ${updated} updated.`);
