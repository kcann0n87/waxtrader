-- 0047_product_variant_lineup_round1.sql
-- Round-one variant expansion. Many products in the catalog had only
-- a hobby box row when the actual retail lineup includes mega, blaster,
-- value, jumbo, tin, and case configurations. This migration:
--
--   1. Hides 2025-26 Topps Bowman Best Basketball (doesn't exist as a
--      distinct product — what we labeled "Bowman Best" is actually
--      "Bowman University Best" / "Bowman U Best" which we already have
--      as 2025-26-topps-bowman-u-basketball-*).
--
--   2. Adds the 2025-26 Topps Bowman flagship (NEW product — first time
--      Bowman returns to NBA, with NBA + NCAA combined checklist).
--      Variants: Hobby, Hobby Jumbo, Mega, Value Blaster, Hobby Case.
--
--   3. Adds 2025-26 Panini Donruss NBA retail variants (mega, blaster,
--      hanger). Hobby box already in catalog.
--
--   4. Adds 2025-26 Upper Deck Series 1 Hockey retail variants
--      (blaster, mega, tin, hobby case). Hobby box already in catalog.
--
--   5. Adds 2025 Topps Series 1 + Series 2 Baseball retail variants
--      (jumbo, mega, blaster, value). Hobby + case already in catalog.
--
-- All new rows: image_url=null (gradient fallback until photos
-- uploaded), is_published=true, variant_group set so they collapse
-- onto the existing hobby-box product page automatically.
--
-- All inserts use ON CONFLICT (slug) DO UPDATE so re-runs update in
-- place and never duplicate.

-- ===========================================================================
-- 1. Hide phantom Bowman Best NBA (real product is Bowman U Best)
-- ===========================================================================
update skus
  set is_published = false,
      description = '⚠ Not a distinct product — 2025-26 NBA "Best" branding lives on Bowman University Best (Bowman U). This SKU was a duplicate. Hidden from catalog.'
  where slug in (
    '2025-26-topps-bowman-best-basketball-hobby-box',
    '2025-26-topps-bowman-best-basketball-hobby-case'
  );

-- ===========================================================================
-- 2. 2025-26 Topps Bowman Basketball — NEW FLAGSHIP (NBA + NCAA combined)
--    Release: April 22, 2026 (Mega: May 7, 2026)
--    Hobby: 20 packs/8 cards, 2 autos (1 NBA, 1 NIL)
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-topps-bowman-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Bowman',
   'Hobby Box', '2026-04-22',
   '2025-26 Topps Bowman NBA Hobby Box. First NBA Bowman in years — combined NBA + officially licensed NCAA checklist. 20 packs of 8 cards. 2 autographs per box (1 NBA + 1 NIL/NCAA). Chrome Mini-Diamond Refractor + 6 base parallels guaranteed.',
   null, '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-basketball', 'hobby-box'),
  ('2025-26-topps-bowman-basketball-hobby-jumbo-box', 2025, 'Topps', 'NBA', 'Bowman',
   'Hobby Jumbo Box', '2026-04-22',
   '2025-26 Topps Bowman NBA Hobby Jumbo Box. 12 packs per box (8 boxes per case). The most-autos-per-box format for Bowman NBA — three Chrome autographs per box.',
   null, '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-basketball', 'hobby-jumbo-box'),
  ('2025-26-topps-bowman-basketball-mega-box', 2025, 'Topps', 'NBA', 'Bowman',
   'Mega Box', '2026-05-07',
   '2025-26 Topps Bowman NBA Mega Box. 6 packs per box, 7 cards per pack. Mega-exclusive Mojo parallels not found in hobby. $59.99 MSRP.',
   null, '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-basketball', 'mega-box'),
  ('2025-26-topps-bowman-basketball-value-box', 2025, 'Topps', 'NBA', 'Bowman',
   'Value Box', '2026-04-22',
   '2025-26 Topps Bowman NBA Value Blaster Box. 6 packs per box, 10 cards per pack. Value-exclusive parallels and SSP designs. $29.99 MSRP — entry-level retail format.',
   null, '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-basketball', 'value-box'),
  ('2025-26-topps-bowman-basketball-hobby-case', 2025, 'Topps', 'NBA', 'Bowman',
   'Hobby Case', '2026-04-22',
   '2025-26 Topps Bowman NBA Hobby Case. 12 hobby boxes per case. 24 autographs guaranteed per case (12 NBA + 12 NIL/NCAA).',
   null, '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-basketball', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- 3. 2025-26 Panini Donruss NBA — retail variants (hobby already exists)
--    Unlicensed — same UNLICENSED warning as the hobby description.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-panini-donruss-basketball-mega-box', 2025, 'Panini', 'NBA', 'Donruss',
   'Mega Box', '2026-05-13',
   '2025-26 Panini Donruss NBA Mega Box. UNLICENSED — Panini lost the NBA license Oct 1, 2025; cards show player names + team cities only, no team logos. Mega-exclusive parallels and inserts.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-26-panini-donruss-basketball', 'mega-box'),
  ('2025-26-panini-donruss-basketball-blaster-box', 2025, 'Panini', 'NBA', 'Donruss',
   'Blaster Box', '2026-05-13',
   '2025-26 Panini Donruss NBA Blaster Box. UNLICENSED — Panini lost the NBA license Oct 1, 2025. Entry-level retail — base set, parallels, and Rated Rookies.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-26-panini-donruss-basketball', 'blaster-box'),
  ('2025-26-panini-donruss-basketball-hanger-box', 2025, 'Panini', 'NBA', 'Donruss',
   'Hanger Box', '2026-05-13',
   '2025-26 Panini Donruss NBA Hanger Box. UNLICENSED — Panini lost the NBA license Oct 1, 2025. Larger-than-pack but smaller-than-blaster retail format.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-26-panini-donruss-basketball', 'hanger-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Also backfill variant_group on the existing Donruss hobby-box row.
update skus
  set variant_group = '2025-26-panini-donruss-basketball',
      variant_type = 'hobby-box'
  where slug = '2025-26-panini-donruss-basketball-hobby-box';

-- ===========================================================================
-- 4. 2025-26 Upper Deck Series 1 Hockey — retail variants
--    Hobby box already in catalog (release Nov 19, 2025 already passed).
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-upper-deck-series-1-hockey-blaster-box', 2025, 'Upper Deck', 'NHL', 'Series 1',
   'Blaster Box', '2025-11-05',
   '2025-26 Upper Deck Series 1 NHL Blaster Box. 4 packs per box, 20 boxes per case. Each box averages 1 Young Guns rookie + 1 OPC Glossy + 1 Encore + 1 Green Dazzlers. $24.95 MSRP.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-1-hockey', 'blaster-box'),
  ('2025-26-upper-deck-series-1-hockey-mega-box', 2025, 'Upper Deck', 'NHL', 'Series 1',
   'Mega Box', '2025-11-05',
   '2025-26 Upper Deck Series 1 NHL Mega Box. Includes a 1994/95 Rookie Die-Cut bonus pack. $12.95 MSRP — most accessible retail format.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-1-hockey', 'mega-box'),
  ('2025-26-upper-deck-series-1-hockey-tin-box', 2025, 'Upper Deck', 'NHL', 'Series 1',
   'Tin Box', '2025-11-05',
   '2025-26 Upper Deck Series 1 NHL Tin. 8 regular packs + 1 exclusive 3-card Dazzlers bonus pack. 12 cards per pack. ~3 Young Guns per tin on average. $54.95 MSRP.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-1-hockey', 'tin-box'),
  ('2025-26-upper-deck-series-1-hockey-hobby-case', 2025, 'Upper Deck', 'NHL', 'Series 1',
   'Hobby Case', '2025-11-19',
   '2025-26 Upper Deck Series 1 NHL Hobby Case. 12 hobby boxes per case. The flagship NHL hobby release — Bedard, Fantilli, Carlsson Young Guns rookies for collectors.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-1-hockey', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Backfill variant_group on the existing Series 1 hobby-box row.
update skus
  set variant_group = '2025-26-upper-deck-series-1-hockey',
      variant_type = 'hobby-box'
  where slug = '2025-26-upper-deck-series-1-hockey-hobby-box';

-- ===========================================================================
-- 5. 2025 Topps Series 1 Baseball — retail variants (hobby + case exist)
--    Released: Feb 12, 2025. Real shipped product.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-series-1-baseball-jumbo-box', 2025, 'Topps', 'MLB', 'Series 1',
   'Hobby Jumbo Box', '2025-02-12',
   '2025 Topps Series 1 MLB Hobby Jumbo Box. 10 packs of 40 cards. 1 auto + 2 relics per box, exclusive Confetti parallels. The most-hits-per-box format.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-1-baseball', 'hobby-jumbo-box'),
  ('2025-topps-series-1-baseball-mega-box', 2025, 'Topps', 'MLB', 'Series 1',
   'Mega Box', '2025-02-12',
   '2025 Topps Series 1 MLB Mega Box. 16 packs of 14 cards. Mega-exclusive 1990 Topps Baseball foilboard inserts. $49.99 MSRP.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-1-baseball', 'mega-box'),
  ('2025-topps-series-1-baseball-blaster-box', 2025, 'Topps', 'MLB', 'Series 1',
   'Blaster Box', '2025-02-12',
   '2025 Topps Series 1 MLB Blaster Box. Retail format with exclusive Spring Training cactus/palm parallels. Entry-level price point.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-1-baseball', 'blaster-box'),
  ('2025-topps-series-1-baseball-value-box', 2025, 'Topps', 'MLB', 'Series 1',
   'Value Box', '2025-02-12',
   '2025 Topps Series 1 MLB Value Box. Exclusive Holo Foil parallels in Purple (#/250), Gold (#/50), and Red (#/10).',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-1-baseball', 'value-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- 6. 2025 Topps Series 2 Baseball — retail variants (hobby exists)
--    Released: June 11, 2025. Same retail lineup as Series 1.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-series-2-baseball-jumbo-box', 2025, 'Topps', 'MLB', 'Series 2',
   'Hobby Jumbo Box', '2025-06-11',
   '2025 Topps Series 2 MLB Hobby Jumbo Box. 10 packs of 40 cards. 1 auto + 2 relics per box.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-2-baseball', 'hobby-jumbo-box'),
  ('2025-topps-series-2-baseball-mega-box', 2025, 'Topps', 'MLB', 'Series 2',
   'Mega Box', '2025-06-11',
   '2025 Topps Series 2 MLB Mega Box. 16 packs of 14 cards. Retail-exclusive parallels.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-2-baseball', 'mega-box'),
  ('2025-topps-series-2-baseball-blaster-box', 2025, 'Topps', 'MLB', 'Series 2',
   'Blaster Box', '2025-06-11',
   '2025 Topps Series 2 MLB Blaster Box. Entry-level retail format with exclusive parallels.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-2-baseball', 'blaster-box'),
  ('2025-topps-series-2-baseball-value-box', 2025, 'Topps', 'MLB', 'Series 2',
   'Value Box', '2025-06-11',
   '2025 Topps Series 2 MLB Value Box. Exclusive Holo Foil parallels in numbered colors.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-series-2-baseball', 'value-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Belt-and-suspenders: backfill variant_group on the Series 1/2 hobby-box rows
-- (in case 0046's regex sweep missed them).
update skus
  set variant_group = '2025-topps-series-1-baseball',
      variant_type = 'hobby-box'
  where slug = '2025-topps-series-1-baseball-hobby-box';

update skus
  set variant_group = '2025-topps-series-1-baseball',
      variant_type = 'hobby-case'
  where slug = '2025-topps-series-1-baseball-hobby-case';

update skus
  set variant_group = '2025-topps-series-2-baseball',
      variant_type = 'hobby-box'
  where slug = '2025-topps-series-2-baseball-hobby-box';
