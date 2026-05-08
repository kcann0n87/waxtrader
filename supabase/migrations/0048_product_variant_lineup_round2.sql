-- 0048_product_variant_lineup_round2.sql
-- Round-two variant expansion. Adds the retail formats for high-traffic
-- 2025 NFL, 2025-26 NHL Series 2, and 2025 MLB releases that round 1
-- (migration 0047) didn't cover.
--
-- Scope:
--   1. 2025 Panini Prizm NFL — jumbo, FOTL, value (hobby/mega/blaster/
--      hanger/case already in catalog)
--   2. 2025-26 Upper Deck Series 2 NHL — blaster, mega, tin, hobby case
--      (hobby already in catalog; release March 4, 2026)
--   3. 2025 Bowman MLB flagship — hobby, jumbo, value, hobby case
--      (only mega was in the catalog before — May 28 release shipped
--      with full retail line we never added)
--   4. 2025 Topps Update MLB — jumbo, mega, value (hobby exists)
--   5. 2025 Topps Heritage MLB — blaster, value (hobby exists; Heritage
--      doesn't release jumbo/mega configs by design)
--
-- All new rows: image_url=null, is_published=true, variant_group +
-- variant_type set so they collapse onto the canonical hobby-box
-- product page.
--
-- Idempotent via ON CONFLICT (slug) DO UPDATE on every insert.

-- ===========================================================================
-- 1. 2025 Panini Prizm NFL — additional variants
--    Released: Feb 2, 2026. Hobby, Mega, Blaster, Hanger, Case already in.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-panini-prizm-football-jumbo-box', 2025, 'Panini', 'NFL', 'Prizm',
   'Hobby Jumbo Box', '2026-02-02',
   '2025 Panini Prizm NFL Hobby Jumbo Box. Larger pack count than standard hobby — premium-tier rip with the most autos per box of any Prizm format. Cam Ward, Travis Hunter rookie autographs target.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-prizm-football', 'hobby-jumbo-box'),
  ('2025-panini-prizm-football-fotl-hobby-box', 2025, 'Panini', 'NFL', 'Prizm',
   'FOTL Hobby Box', '2026-01-26',
   '2025 Panini Prizm NFL FOTL (First Off The Line) Hobby Box. 12 packs of 12 cards. Pre-release exclusive with FOTL-only Pink parallels. Configures identically to standard hobby otherwise.',
   null, '#ec4899', '#0f172a', true,
   '2025-panini-prizm-football', 'fotl-hobby-box'),
  ('2025-panini-prizm-football-value-box', 2025, 'Panini', 'NFL', 'Prizm',
   'Value Box', '2026-02-02',
   '2025 Panini Prizm NFL Value Box. Retail value pack with format-exclusive parallels. Entry-level price point.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-prizm-football', 'value-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- 2. 2025-26 Upper Deck Series 2 NHL — retail variants
--    Released: March 4, 2026. Hobby box already in catalog.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-upper-deck-series-2-hockey-blaster-box', 2025, 'Upper Deck', 'NHL', 'Series 2',
   'Blaster Box', '2026-03-04',
   '2025-26 Upper Deck Series 2 NHL Blaster Box. 4 packs of 12 cards. Each box averages 1 Young Guns + 1 Encore + 1 OPC Glossy + 1 Green Dazzlers. $24.95 MSRP.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-2-hockey', 'blaster-box'),
  ('2025-26-upper-deck-series-2-hockey-mega-box', 2025, 'Upper Deck', 'NHL', 'Series 2',
   'Mega Box', '2026-03-04',
   '2025-26 Upper Deck Series 2 NHL Mega Box. Most accessible retail format with format-exclusive parallels.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-2-hockey', 'mega-box'),
  ('2025-26-upper-deck-series-2-hockey-tin-box', 2025, 'Upper Deck', 'NHL', 'Series 2',
   'Tin Box', '2026-03-04',
   '2025-26 Upper Deck Series 2 NHL Tin. 8 regular packs of 12 cards + 1 exclusive 3-card Dazzlers bonus pack. ~3 Young Guns per tin. Tin-exclusive Red and Black Dazzlers parallels.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-2-hockey', 'tin-box'),
  ('2025-26-upper-deck-series-2-hockey-hobby-case', 2025, 'Upper Deck', 'NHL', 'Series 2',
   'Hobby Case', '2026-03-04',
   '2025-26 Upper Deck Series 2 NHL Hobby Case. 12 hobby boxes per case. Suzuki and the rest of the Series 2 Young Guns checklist.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-series-2-hockey', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Backfill variant_group on existing Series 2 hobby-box row.
update skus
  set variant_group = '2025-26-upper-deck-series-2-hockey',
      variant_type = 'hobby-box'
  where slug = '2025-26-upper-deck-series-2-hockey-hobby-box';

-- ===========================================================================
-- 3. 2025 Bowman MLB flagship — full retail lineup (only mega was in catalog)
--    Released: May 28, 2025. Mass-market product with all retail formats.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-bowman-baseball-hobby-box', 2025, 'Bowman', 'MLB', 'Bowman',
   'Hobby Box', '2025-05-28',
   '2025 Bowman MLB Hobby Box. 24 packs of 8 cards. 1 Chrome Prospect autograph + 1 Mini-Diamond + 1 X-Fractor guaranteed per box. The flagship prospect product — Reptilian Red and Fuchsia Wave refractors debut here.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-baseball', 'hobby-box'),
  ('2025-bowman-baseball-jumbo-box', 2025, 'Bowman', 'MLB', 'Bowman',
   'Hobby Jumbo Box', '2025-05-28',
   '2025 Bowman MLB Hobby Jumbo Box. 12 packs of 28 cards (336 total). 3 Chrome Prospect autographs per box — most autos of any 2025 Bowman format.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-baseball', 'hobby-jumbo-box'),
  ('2025-bowman-baseball-value-box', 2025, 'Bowman', 'MLB', 'Bowman',
   'Value Box', '2025-05-28',
   '2025 Bowman MLB Value Blaster Box. 6 packs of 12 cards. Value-exclusive Green parallels, Firefractors (#/3), and exclusive Paper autos.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-baseball', 'value-box'),
  ('2025-bowman-baseball-hobby-case', 2025, 'Bowman', 'MLB', 'Bowman',
   'Hobby Case', '2025-05-28',
   '2025 Bowman MLB Hobby Case. 12 hobby boxes per case. 12 Chrome Prospect autographs guaranteed.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-baseball', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Backfill variant_group on the existing mega-box row.
update skus
  set variant_group = '2025-bowman-baseball',
      variant_type = 'mega-box'
  where slug = '2025-bowman-baseball-mega-box';

-- ===========================================================================
-- 4. 2025 Topps Update MLB — retail variants (hobby exists)
--    Released: October 2025. Same retail line as Series 1/2.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-update-baseball-jumbo-box', 2025, 'Topps', 'MLB', 'Update',
   'Hobby Jumbo Box', '2025-10-08',
   '2025 Topps Update MLB Hobby Jumbo Box. 10 packs of 40 cards. 3 hits per box including 1+ autograph. First appearance of Golden Mirror Autographs.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-update-baseball', 'hobby-jumbo-box'),
  ('2025-topps-update-baseball-mega-box', 2025, 'Topps', 'MLB', 'Update',
   'Mega Box', '2025-10-08',
   '2025 Topps Update MLB Mega Box. Holiday-themed parallels and 35th anniversary 1990 Topps Baseball cards.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-update-baseball', 'mega-box'),
  ('2025-topps-update-baseball-value-box', 2025, 'Topps', 'MLB', 'Update',
   'Value Box', '2025-10-08',
   '2025 Topps Update MLB Value Blaster Box. Includes 3 exclusive Halloween-themed Holiday parallel cards. $24.99 MSRP.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-update-baseball', 'value-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Backfill variant_group on existing Update hobby-box row.
update skus
  set variant_group = '2025-topps-update-baseball',
      variant_type = 'hobby-box'
  where slug = '2025-topps-update-baseball-hobby-box';

-- ===========================================================================
-- 5. 2025 Topps Heritage MLB — retail variants (hobby exists)
--    Released early 2025. Heritage line is hobby + retail blasters/value;
--    no jumbo or mega configs by design.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-heritage-baseball-blaster-box', 2025, 'Topps', 'MLB', 'Heritage',
   'Blaster Box', '2025-03-12',
   '2025 Topps Heritage MLB Blaster Box. 8 packs of 8 cards. 1976 design + Bicentennial theme. 1 chrome refractor + 1 Pink Sparkle parallel per box.',
   null, '#a16207', '#1e293b', true,
   '2025-topps-heritage-baseball', 'blaster-box'),
  ('2025-topps-heritage-baseball-value-box', 2025, 'Topps', 'MLB', 'Heritage',
   'Value Box', '2025-03-12',
   '2025 Topps Heritage MLB Value Box. Value-exclusive Dark Green Bordered + Pink Sparkle parallels. Entry-level retail tier.',
   null, '#a16207', '#1e293b', true,
   '2025-topps-heritage-baseball', 'value-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- Backfill variant_group on existing Heritage hobby-box row.
update skus
  set variant_group = '2025-topps-heritage-baseball',
      variant_type = 'hobby-box'
  where slug = '2025-topps-heritage-baseball-hobby-box';
