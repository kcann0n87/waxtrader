#!/usr/bin/env node
// Auto-wires product images into lib/data.ts + scripts/seed-data.mjs.
//
// Usage:
//   1. Drop image files into public/products/ named <slug>.jpg or .png
//   2. Run:  node scripts/wire-images.mjs
//
// The script finds every SKU whose slug matches a file in public/products/
// but doesn't yet have an imageUrl, then adds the imageUrl line to both the
// runtime catalog (src/lib/data.ts) and the seed data (scripts/seed-data.mjs).
//
// Idempotent — running it twice is safe.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PRODUCTS_DIR = join(ROOT, "public", "products");
const LIB_DATA = join(ROOT, "src", "lib", "data.ts");
const SEED_DATA = join(ROOT, "scripts", "seed-data.mjs");

async function main() {
  // 1. Get every <slug>.{jpg,jpeg,png,webp} in public/products/
  let files;
  try {
    files = await readdir(PRODUCTS_DIR);
  } catch {
    console.error(`✗ ${PRODUCTS_DIR} doesn't exist. Create it and drop images in.`);
    process.exit(1);
  }
  const imageBySlug = new Map();
  for (const f of files) {
    const m = f.match(/^(.+)\.(jpe?g|png|webp)$/i);
    if (m) imageBySlug.set(m[1], `/products/${f}`);
  }
  if (imageBySlug.size === 0) {
    console.log("No images found in public/products/. Nothing to wire.");
    return;
  }

  // 2. Wire each file
  const dataSrc = await readFile(LIB_DATA, "utf8");
  const seedSrc = await readFile(SEED_DATA, "utf8");

  let dataOut = dataSrc;
  let seedOut = seedSrc;
  let added = 0;
  let already = 0;
  let missingSku = 0;

  for (const [slug, imageUrl] of imageBySlug) {
    // Match the SKU object containing slug: "<slug>" (multi-line)
    const skuRe = new RegExp(
      `(\\{[^}]*?slug:\\s*"${slug}"[^}]*?\\})`,
      "s",
    );
    const dataMatch = dataSrc.match(skuRe);
    if (!dataMatch) {
      missingSku++;
      console.warn(`! No SKU with slug "${slug}" — image dropped but unused.`);
      continue;
    }
    const block = dataMatch[1];
    if (block.includes("imageUrl:")) {
      already++;
      continue;
    }

    // Insert imageUrl right after description: "..."
    const updatedBlock = block.replace(
      /(description:\s*"[^"]*",)/,
      `$1\n    imageUrl: "${imageUrl}",`,
    );
    dataOut = dataOut.replace(block, updatedBlock);

    // Same for seed-data.mjs
    const seedMatch = seedOut.match(skuRe);
    if (seedMatch && !seedMatch[1].includes("imageUrl:")) {
      const seedUpdated = seedMatch[1].replace(
        /(description:\s*"[^"]*",)/,
        `$1\n    imageUrl: "${imageUrl}",`,
      );
      seedOut = seedOut.replace(seedMatch[1], seedUpdated);
    }

    added++;
    console.log(`✓ ${slug}`);
  }

  if (added > 0) {
    await writeFile(LIB_DATA, dataOut);
    await writeFile(SEED_DATA, seedOut);
  }

  console.log(
    `\n${added} image${added === 1 ? "" : "s"} wired · ${already} already had imageUrl · ${missingSku} files without a matching SKU`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
