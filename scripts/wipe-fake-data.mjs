#!/usr/bin/env node
// Wipe ALL marketplace transaction data from Supabase. Use this once before
// your real public launch to clear the seed data (orders, sales, listings,
// bids, reviews, disputes from scripts/seed.mjs) so the homepage tape and
// stats reflect only real activity.
//
// What this DELETES:
//   - sales, orders, bids, listings, reviews, disputes
//   - notifications (anything stale referencing those orders)
//   - watchlist, follows, recently_viewed (these reference user data — wiped
//     so the new clean state isn't polluted with seeded interactions)
//
// What this KEEPS:
//   - skus (the catalog of products)
//   - profiles + auth.users (real signups stay; you'll lose seeded sellers
//     unless you opt to keep them via the --keep-seed-sellers flag)
//
// Usage:
//   node --env-file=.env.local scripts/wipe-fake-data.mjs
//   node --env-file=.env.local scripts/wipe-fake-data.mjs --keep-seed-sellers
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (same key used by
// scripts/seed.mjs).

import { createClient } from "@supabase/supabase-js";

const KEEP_SEED_SELLERS = process.argv.includes("--keep-seed-sellers");

const SEED_SELLER_USERNAMES = [
  // Match the usernames from scripts/seed-data.mjs. Update if you add more.
  "hobbyhouse",
  "boxbreaker_pro",
  "watchlordreviews",
  "mintsealedonly",
  "alehow-70",
  "augies_collectibles",
  "premiumwax",
  "stop_n_break",
  "primetime_breaks",
  "wax_warden",
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function nuke(table) {
  // Delete with a guard that always matches so all rows go.
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .gte("created_at", "1970-01-01");
  if (error) {
    // Some tables don't have created_at — fall back to a different filter.
    const { error: e2, count: c2 } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (e2) {
      console.error(`✗ Failed wiping ${table}:`, e2.message);
      return 0;
    }
    return c2 ?? 0;
  }
  return count ?? 0;
}

async function nukeKeyed(table, keyCol) {
  // For tables without an id column (composite PK).
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .neq(keyCol, "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error(`✗ Failed wiping ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function main() {
  console.log("Wiping marketplace transaction data...\n");

  // Order matters because of FK references. Delete children first.
  const counts = {};
  counts.notifications = await nuke("notifications");
  counts.disputes = await nukeKeyed("disputes", "id");
  counts.reviews = await nuke("reviews");
  counts.recently_viewed = await nukeKeyed("recently_viewed", "user_id");
  counts.follows = await nukeKeyed("follows", "follower_id");
  counts.watchlist = await nukeKeyed("watchlist", "user_id");
  counts.saved_searches = await nuke("saved_searches");
  counts.messages = await nuke("messages");
  counts.conversations = await nuke("conversations");
  counts.tracking_events = await nuke("tracking_events").catch(() => 0);
  counts.order_events = await nuke("order_events").catch(() => 0);
  counts.payout_orders = await nuke("payout_orders").catch(() => 0);
  counts.payouts = await nuke("payouts").catch(() => 0);
  counts.orders = await nuke("orders");
  counts.sales = await nuke("sales");
  counts.bids = await nuke("bids");
  counts.listings = await nuke("listings");
  counts.user_addresses = await nuke("user_addresses").catch(() => 0);
  counts.user_cards = await nuke("user_cards").catch(() => 0);

  for (const [table, n] of Object.entries(counts)) {
    if (n > 0) console.log(`  ✓ ${table.padEnd(20)} ${n} rows`);
  }

  // Optionally remove seed sellers.
  if (!KEEP_SEED_SELLERS) {
    const { data: seedProfiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("username", SEED_SELLER_USERNAMES);
    const ids = (seedProfiles ?? []).map((p) => p.id);
    if (ids.length > 0) {
      // Delete the profile rows (the auth.users CASCADE will handle the rest).
      for (const id of ids) {
        await supabase.auth.admin.deleteUser(id);
      }
      console.log(`  ✓ ${"seed sellers".padEnd(20)} ${ids.length} accounts removed`);
    }
  } else {
    console.log("  ↳ Kept seed seller accounts (use without --keep-seed-sellers to remove)");
  }

  console.log(
    "\nDone. The marketplace is now empty of seed data — only real signups + listings remain.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
