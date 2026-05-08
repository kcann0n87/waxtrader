-- 0050_product_variant_lineup_round4.sql
-- Round-four variant expansion. Soccer + remaining NFL retail.
--
-- Scope:
--   1. 2025-26 Panini Prizm FIFA Soccer — blaster, choice, hobby case
--      (had only hobby box; release May 8, 2026)
--   2. 2025-26 Topps Chrome UEFA Club Competitions — blaster (had hobby
--      + case + mega; rounding out the retail line)
--   3. 2025 Panini Mosaic NFL — hobby box, mega, hobby case (had only
--      blaster). Released Sept 2025.
--   4. 2025 Panini Select NFL — hobby box, hanger, H2, value (had
--      blaster + mega + case). Released Feb 19, 2026.
--
-- All new rows: image_url=null, is_published=true, variant_group +
-- variant_type set so they collapse onto the canonical product page.
--
-- Idempotent via ON CONFLICT (slug) DO UPDATE.

-- ===========================================================================
-- 1. 2025-26 Panini Prizm FIFA Soccer — retail variants
--    Hobby box already in catalog (May 8, 2026 release).
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-panini-prizm-fifa-soccer-blaster-box', 2025, 'Panini', 'Soccer', 'Prizm FIFA',
   'Blaster Box', '2026-05-08',
   '2025-26 Panini Prizm FIFA Soccer Blaster Box. 4 packs of 6 cards. Blaster-exclusive parallels — entry-level retail format with the same 300-card base set.',
   null, '#2563eb', '#0f172a', true,
   '2025-26-panini-prizm-fifa-soccer', 'blaster-box'),
  ('2025-26-panini-prizm-fifa-soccer-choice-box', 2025, 'Panini', 'Soccer', 'Prizm FIFA',
   'Choice Box', '2026-05-08',
   '2025-26 Panini Prizm FIFA Soccer Choice Box. 1 pack of 8 cards. Premium small-format retail — Choice-exclusive parallels.',
   null, '#2563eb', '#0f172a', true,
   '2025-26-panini-prizm-fifa-soccer', 'choice-box'),
  ('2025-26-panini-prizm-fifa-soccer-hobby-case', 2025, 'Panini', 'Soccer', 'Prizm FIFA',
   'Hobby Case', '2026-05-08',
   '2025-26 Panini Prizm FIFA Soccer Hobby Case. 12 hobby boxes per case. 12 autographs guaranteed across the case.',
   null, '#2563eb', '#0f172a', true,
   '2025-26-panini-prizm-fifa-soccer', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set variant_group = '2025-26-panini-prizm-fifa-soccer', variant_type = 'hobby-box'
  where slug = '2025-26-panini-prizm-fifa-soccer-hobby-box';

-- ===========================================================================
-- 2. 2025-26 Topps Chrome UEFA Club Competitions — blaster
--    Hobby + Case + Mega already in catalog. Adding blaster.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-topps-chrome-uefa-club-competitions-soccer-blaster-box', 2025, 'Topps', 'Soccer', 'Chrome UEFA Club Competitions',
   'Blaster Box', '2026-05-07',
   '2025-26 Topps Chrome UEFA Club Competitions Soccer Blaster Box. Retail-tier chrome — blaster-exclusive parallels including format-only refractor variants.',
   null, '#2563eb', '#0f172a', true,
   '2025-26-topps-chrome-uefa-club-competitions-soccer', 'blaster-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set
  variant_group = '2025-26-topps-chrome-uefa-club-competitions-soccer',
  variant_type = case
    when slug = '2025-26-topps-chrome-uefa-club-competitions-soccer-hobby-box' then 'hobby-box'
    when slug = '2025-26-topps-chrome-uefa-club-competitions-soccer-hobby-case' then 'hobby-case'
    when slug = '2025-26-topps-chrome-uefa-club-competitions-soccer-mega-box' then 'mega-box'
    else variant_type
  end
  where slug in (
    '2025-26-topps-chrome-uefa-club-competitions-soccer-hobby-box',
    '2025-26-topps-chrome-uefa-club-competitions-soccer-hobby-case',
    '2025-26-topps-chrome-uefa-club-competitions-soccer-mega-box'
  );

-- ===========================================================================
-- 3. 2025 Panini Mosaic NFL — hobby, mega, hobby case (only blaster
--    was in catalog). Sept 2025 release.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-panini-mosaic-football-hobby-box', 2025, 'Panini', 'NFL', 'Mosaic',
   'Hobby Box', '2025-09-24',
   '2025 Panini Mosaic NFL Hobby Box. 20 parallels per box (~2 per pack). Tessellation, Gold, and Blue Mosaic Prizms. Insert sets: Epic Performers, Notoriety, Touchdown Masters, Stained Glass.',
   null, '#7c3aed', '#0f172a', true,
   '2025-panini-mosaic-football', 'hobby-box'),
  ('2025-panini-mosaic-football-mega-box', 2025, 'Panini', 'NFL', 'Mosaic',
   'Hobby Mega Box', '2025-09-24',
   '2025 Panini Mosaic NFL Hobby Mega Box. Hobby Mega-exclusive Camo Red Mosaic parallels. Higher-volume retail format.',
   null, '#7c3aed', '#0f172a', true,
   '2025-panini-mosaic-football', 'hobby-mega-box'),
  ('2025-panini-mosaic-football-hobby-case', 2025, 'Panini', 'NFL', 'Mosaic',
   'Hobby Case', '2025-09-24',
   '2025 Panini Mosaic NFL Hobby Case. Multiple hobby boxes per case for collector volume rips.',
   null, '#7c3aed', '#0f172a', true,
   '2025-panini-mosaic-football', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set variant_group = '2025-panini-mosaic-football', variant_type = 'blaster-box'
  where slug = '2025-panini-mosaic-football-blaster-box';

-- ===========================================================================
-- 4. 2025 Panini Select NFL — hobby box, hanger, H2, value
--    Blaster + Mega + Case already in. Released Feb 19, 2026.
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-panini-select-football-hobby-box', 2025, 'Panini', 'NFL', 'Select',
   'Hobby Box', '2026-02-19',
   '2025 Panini Select NFL Hobby Box. 500-card base set. 2 autographs + 1 memorabilia card per box on average. 15 Prizm parallels, 6 inserts, 2 Field Level base cards.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-select-football', 'hobby-box'),
  ('2025-panini-select-football-hanger-box', 2025, 'Panini', 'NFL', 'Select',
   'Hanger Box', '2026-02-19',
   '2025 Panini Select NFL Hanger Box. Hanger-exclusive parallels — mid-tier retail format.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-select-football', 'hanger-box'),
  ('2025-panini-select-football-h2-box', 2025, 'Panini', 'NFL', 'Select',
   'H2 Box', '2026-02-19',
   '2025 Panini Select NFL H2 (Hybrid Hobby) Box. 4 packs of 6 cards. Mix of hobby and retail content with H2-exclusive parallels.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-select-football', 'h2-box'),
  ('2025-panini-select-football-value-box', 2025, 'Panini', 'NFL', 'Select',
   'Value Box', '2026-02-19',
   '2025 Panini Select NFL Value Box. Entry-level retail with value-exclusive parallels.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-select-football', 'value-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

update skus set
  variant_group = '2025-panini-select-football',
  variant_type = case
    when slug = '2025-panini-select-football-blaster-box' then 'blaster-box'
    when slug = '2025-panini-select-football-mega-box' then 'mega-box'
    when slug = '2025-panini-select-football-hobby-case' then 'hobby-case'
    else variant_type
  end
  where slug in (
    '2025-panini-select-football-blaster-box',
    '2025-panini-select-football-mega-box',
    '2025-panini-select-football-hobby-case'
  );
