-- 0068_ascended_prismatic_full_variants.sql
-- Round 4 Pokemon: drop Storm Emerald (defer until officially dated)
-- and fill out the FULL retail variant lineup for the two top products
-- right now — Ascended Heroes (Jan 30, 2026) and Prismatic Evolutions
-- (Jan 17, 2025, still trading at premium prices).
--
-- Pokemon TCG variant lineup beyond Booster Box / ETB / Bundle:
--   - Booster Box Case (6 booster boxes per case)
--   - Elite Trainer Box Case (10 ETBs per case)
--   - Mini Tin Display (10 mini tins per display)
--   - Single Mini Tin (one tin, retail-tier)
--   - 3-Pack Blister (3 booster packs + promo card)
--   - Sticker Collection (sticker promo + boosters)
--
-- All inserts is_published=FALSE — staged on the pokemon-tcg branch.

-- ---------------------------------------------------------------------
-- 1. Drop Storm Emerald (deferred — date isn't officially announced)
-- ---------------------------------------------------------------------
delete from skus
  where slug like '2026-pokemon-tcg-storm-emerald-%';

-- ---------------------------------------------------------------------
-- 2. Ascended Heroes (Jan 30, 2026) — TOP PRODUCT
--    Already have: Booster Box, ETB, Booster Bundle (from 0067)
--    Adding: BB Case, ETB Case, Mini Tin Display, Mini Tin, Blister, Sticker
-- ---------------------------------------------------------------------
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2026-pokemon-tcg-ascended-heroes-booster-box-case', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Booster Box Case', '2026-01-30',
   'Pokemon TCG Ascended Heroes Booster Box Case. 6 booster boxes per case = 216 packs total. Hobby-tier volume rip for shops and serious collectors.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'booster-box-case'),
  ('2026-pokemon-tcg-ascended-heroes-elite-trainer-box-case', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Elite Trainer Box Case', '2026-01-30',
   'Pokemon TCG Ascended Heroes Elite Trainer Box Case. 10 ETBs per case. Bulk pack-rip + accessory volume for collectors and shops.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'elite-trainer-box-case'),
  ('2026-pokemon-tcg-ascended-heroes-mini-tin-display', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Mini Tin Display', '2026-01-30',
   'Pokemon TCG Ascended Heroes Mini Tin Display. 10 mini tins per display, each containing 2 booster packs + a metallic Pokemon coin.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'mini-tin-display'),
  ('2026-pokemon-tcg-ascended-heroes-mini-tin', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Mini Tin', '2026-01-30',
   'Pokemon TCG Ascended Heroes Mini Tin. Single tin with 2 booster packs + Pokemon coin. Entry-level collector item.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'mini-tin'),
  ('2026-pokemon-tcg-ascended-heroes-blister-pack', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   '3-Pack Blister', '2026-01-30',
   'Pokemon TCG Ascended Heroes 3-Pack Blister. 3 booster packs + promo card. Big-box retail tier.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'blister-pack'),
  ('2026-pokemon-tcg-ascended-heroes-sticker-collection', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Sticker Collection', '2026-01-30',
   'Pokemon TCG Ascended Heroes Sticker Collection. Sticker pack with promo card + boosters. Themed collector item.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'sticker-collection'),

-- ---------------------------------------------------------------------
-- 3. Prismatic Evolutions (Jan 17, 2025) — #2 PRODUCT, still premium
--    Already have (from 0065): Booster Box, ETB, Bundle, Premium, UPC
--    Adding: BB Case, ETB Case, Mini Tin Display, Mini Tin, Sticker
-- ---------------------------------------------------------------------
  ('2025-pokemon-tcg-prismatic-evolutions-booster-box-case', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Booster Box Case', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Booster Box Case. 6 booster boxes per case = 216 packs total. Eevee/Eeveelution-themed flagship — case-tier secondary market is wild.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'booster-box-case'),
  ('2025-pokemon-tcg-prismatic-evolutions-elite-trainer-box-case', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Elite Trainer Box Case', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Elite Trainer Box Case. 10 ETBs per case. The hottest Pokemon ETB case of 2025.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'elite-trainer-box-case'),
  ('2025-pokemon-tcg-prismatic-evolutions-mini-tin-display', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Mini Tin Display', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Mini Tin Display. 10 mini tins per display. Each tin: 2 boosters + Eeveelution coin.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'mini-tin-display'),
  ('2025-pokemon-tcg-prismatic-evolutions-mini-tin', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Mini Tin', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Mini Tin. Single tin with 2 booster packs + Eeveelution-themed Pokemon coin.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'mini-tin'),
  ('2025-pokemon-tcg-prismatic-evolutions-sticker-collection', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Sticker Collection', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Sticker Collection. Sticker pack with promo card + boosters.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'sticker-collection')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
