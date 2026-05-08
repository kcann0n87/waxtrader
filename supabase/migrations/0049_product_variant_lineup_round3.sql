-- 0049_product_variant_lineup_round3.sql
-- Round-three variant expansion. Covers the major MLB Chrome products
-- + Stadium Club + the Donruss NFL hobby/retail line that previously
-- only had a mega-box row in the catalog.
--
-- Scope:
--   1. 2025 Topps Chrome MLB — jumbo, mega, value, hobby case (had only
--      hobby box). Premium chrome flagship; Sapphire is a separate SKU.
--   2. 2025 Bowman Chrome MLB — jumbo, mega (had only hobby box). No
--      retail blaster/value for Bowman Chrome by design — it's a
--      hobby-tier product. Sapphire Edition exists as its own SKU.
--   3. 2025 Topps Stadium Club MLB — mega, blaster (had only hobby box).
--      Released Feb 18, 2026.
--   4. 2025 Panini Donruss NFL — hobby, blaster, hanger, value, hobby
--      case (only mega was in the catalog; the rest of the line never
--      modeled). Released around Sept 17, 2025.
--
-- All new rows: image_url=null, is_published=true, variant_group +
-- variant_type set so the existing product page redirect logic
-- collapses them onto the canonical hobby-box (or in Donruss NFL's
-- case, the hobby-box once it exists).
--
-- Idempotent via ON CONFLICT (slug) DO UPDATE.

-- ===========================================================================
-- 1. 2025 Topps Chrome MLB — additional retail variants
--    Released: July 23, 2025. Hobby is the main; this fills out the line.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-chrome-baseball-jumbo-box', 2025, 'Topps', 'MLB', 'Chrome',
   'Hobby Jumbo Box', '2025-07-23',
   '2025 Topps Chrome MLB Hobby Jumbo Box. Premium hobby format — 3 Chrome autographs per box vs. 1 in standard hobby. Best for autograph chasers.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-chrome-baseball', 'hobby-jumbo-box'),
  ('2025-topps-chrome-baseball-mega-box', 2025, 'Topps', 'MLB', 'Chrome',
   'Mega Box', '2025-07-23',
   '2025 Topps Chrome MLB Mega Box. 7 packs of 6 cards. 10 X-Fractor parallels guaranteed. $64.99 MSRP.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-chrome-baseball', 'mega-box'),
  ('2025-topps-chrome-baseball-value-box', 2025, 'Topps', 'MLB', 'Chrome',
   'Value Box', '2025-07-23',
   '2025 Topps Chrome MLB Value Blaster. 7 packs of 4 cards. Retail-exclusive Sepia + RayWave parallels and Lightboard variations. $39.99 MSRP.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-chrome-baseball', 'value-box'),
  ('2025-topps-chrome-baseball-hobby-case', 2025, 'Topps', 'MLB', 'Chrome',
   'Hobby Case', '2025-07-23',
   '2025 Topps Chrome MLB Hobby Case. 12 hobby boxes per case. 12 Chrome autographs guaranteed.',
   null, '#dc2626', '#0f172a', true,
   '2025-topps-chrome-baseball', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set variant_group = '2025-topps-chrome-baseball', variant_type = 'hobby-box'
  where slug = '2025-topps-chrome-baseball-hobby-box';

-- ===========================================================================
-- 2. 2025 Bowman Chrome MLB — jumbo + mega (hobby tier; no retail blaster)
--    Released: Sept 23, 2025. Sapphire Edition is a distinct SKU.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-bowman-chrome-baseball-jumbo-box', 2025, 'Bowman', 'MLB', 'Bowman Chrome',
   'Hobby Jumbo Box', '2025-09-23',
   '2025 Bowman Chrome MLB Hobby Jumbo Box. Premium prospect chrome — most autographs per box of any Bowman Chrome configuration.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-chrome-baseball', 'hobby-jumbo-box'),
  ('2025-bowman-chrome-baseball-mega-box', 2025, 'Bowman', 'MLB', 'Bowman Chrome',
   'Mega Box', '2025-09-23',
   '2025 Bowman Chrome MLB Mega Box. 5 base packs + 2 Mega Chrome exclusive packs. Mega-only Mega Refractors (Aqua, Purple, Steel Metal, Black) + Rose Gold Mojo 1-of-1.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-chrome-baseball', 'mega-box'),
  ('2025-bowman-chrome-baseball-hobby-case', 2025, 'Bowman', 'MLB', 'Bowman Chrome',
   'Hobby Case', '2025-09-23',
   '2025 Bowman Chrome MLB Hobby Case. 12 hobby boxes per case. 24 Chrome Prospect autographs guaranteed.',
   null, '#16a34a', '#0f172a', true,
   '2025-bowman-chrome-baseball', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set variant_group = '2025-bowman-chrome-baseball', variant_type = 'hobby-box'
  where slug = '2025-bowman-chrome-baseball-hobby-box';

-- ===========================================================================
-- 3. 2025 Topps Stadium Club MLB — mega, blaster (hobby existed)
--    Released: Feb 18, 2026. Stadium Club skips jumbo configs by design.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-stadium-club-baseball-mega-box', 2025, 'Topps', 'MLB', 'Stadium Club',
   'Mega Box', '2026-02-18',
   '2025 Topps Stadium Club MLB Mega Box. 18 packs of 8 cards. 9 mega-exclusive Light Blue parallels per box. $49.99 MSRP.',
   null, '#a16207', '#1e293b', true,
   '2025-topps-stadium-club-baseball', 'mega-box'),
  ('2025-topps-stadium-club-baseball-blaster-box', 2025, 'Topps', 'MLB', 'Stadium Club',
   'Blaster Box', '2026-02-18',
   '2025 Topps Stadium Club MLB Blaster Box. 8 packs of 5 cards. 4 blaster-exclusive Lime Green parallels per box. $24.99 MSRP.',
   null, '#a16207', '#1e293b', true,
   '2025-topps-stadium-club-baseball', 'blaster-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set variant_group = '2025-topps-stadium-club-baseball', variant_type = 'hobby-box'
  where slug = '2025-topps-stadium-club-baseball-hobby-box';

-- ===========================================================================
-- 4. 2025 Panini Donruss NFL — full retail + hobby line
--    Mega already in catalog (Sept 17, 2025 release). Adding the rest:
--    hobby, blaster, hanger, value, hobby case.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-panini-donruss-football-hobby-box', 2025, 'Panini', 'NFL', 'Donruss',
   'Hobby Box', '2025-09-17',
   '2025 Panini Donruss NFL Hobby Box. 400-card base set with 100 Rated Rookies. 1 autograph + 1 relic per box on average. $434.95 MSRP — premium hobby flagship.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-donruss-football', 'hobby-box'),
  ('2025-panini-donruss-football-blaster-box', 2025, 'Panini', 'NFL', 'Donruss',
   'Blaster Box', '2025-09-17',
   '2025 Panini Donruss NFL Blaster Box. 6 packs of 15 cards. Blaster-exclusive parallels — Cam Ward, Travis Hunter Rated Rookie targets. ~$39.96 retail.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-donruss-football', 'blaster-box'),
  ('2025-panini-donruss-football-hanger-box', 2025, 'Panini', 'NFL', 'Donruss',
   'Hanger Box', '2025-09-17',
   '2025 Panini Donruss NFL Hanger Box. Larger-than-pack retail format with hanger-exclusive parallels.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-donruss-football', 'hanger-box'),
  ('2025-panini-donruss-football-value-box', 2025, 'Panini', 'NFL', 'Donruss',
   'Value Box', '2025-09-17',
   '2025 Panini Donruss NFL Value Box. Value-tier retail with format-exclusive parallels. Entry-level price point.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-donruss-football', 'value-box'),
  ('2025-panini-donruss-football-hobby-case', 2025, 'Panini', 'NFL', 'Donruss',
   'Hobby Case', '2025-09-17',
   '2025 Panini Donruss NFL Hobby Case. 12 hobby boxes per case. 12 autographs + 12 relics guaranteed.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-donruss-football', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set variant_group = '2025-panini-donruss-football', variant_type = 'mega-box'
  where slug = '2025-panini-donruss-football-mega-box';
