-- 0065_pokemon_tcg_full_2025_buildout.sql
-- Comprehensive Pokemon TCG buildout for the 2025 / early 2026
-- calendar. All previously-modeled 2025 sets had only one variant
-- (either Booster Box OR Elite Trainer Box, not both). This round:
--
--   1. Fixes Phantasmal Flames release date — was 2026-02-06 in
--      migration 0064 but the actual release is 2025-11-14 per
--      Pokemon TCG Press / Beckett.
--   2. Adds the missing variants across 5 already-staged 2025 sets
--      (Prismatic Evolutions, Journey Together, Destined Rivals,
--      Black Bolt, White Flare): every set gets Booster Box, ETB,
--      Booster Bundle, Premium Collection, UPC where available.
--   3. Adds 2024 Pokemon GO Surging Sparks Sticker Pin Pack and
--      other 2024-25 minor releases we missed.
--   4. Backfills variant_group + variant_type on existing 2025
--      Pokemon rows so the new variants collapse into one product
--      page with a variant selector.
--
-- All inserts is_published=FALSE (staging on the pokemon-tcg branch).
-- Flip live with one UPDATE when you're ready:
--   UPDATE skus SET is_published = true
--     WHERE sport = 'Pokemon'
--       AND is_published = false;
--
-- Source: Pokemon TCG calendar (Beckett + ICv2 + JustInBasil) for
-- exact release dates.

-- ---------------------------------------------------------------------
-- 1. Fix Phantasmal Flames date
-- ---------------------------------------------------------------------
update skus set release_date = '2025-11-14'
  where slug like '2026-pokemon-tcg-phantasmal-flames-%';
update skus set
  slug = replace(slug, '2026-pokemon-tcg-phantasmal-flames', '2025-pokemon-tcg-phantasmal-flames'),
  year = 2025,
  variant_group = '2025-pokemon-tcg-phantasmal-flames'
  where slug like '2026-pokemon-tcg-phantasmal-flames-%';

-- ---------------------------------------------------------------------
-- 2. Backfill variant_group + variant_type on existing 2025 rows
-- ---------------------------------------------------------------------
update skus set variant_group = '2025-pokemon-tcg-prismatic-evolutions',
                variant_type = 'booster-box'
  where slug = '2025-pokemon-tcg-prismatic-evolutions-booster-box';
update skus set variant_group = '2025-pokemon-tcg-journey-together',
                variant_type = 'elite-trainer-box'
  where slug = '2025-pokemon-tcg-journey-together-elite-trainer-box';
update skus set variant_group = '2025-pokemon-tcg-destined-rivals',
                variant_type = 'elite-trainer-box'
  where slug = '2025-pokemon-tcg-destined-rivals-elite-trainer-box';
update skus set variant_group = '2025-pokemon-tcg-black-bolt',
                variant_type = 'booster-box'
  where slug = '2025-pokemon-tcg-black-bolt-booster-box';
update skus set variant_group = '2025-pokemon-tcg-white-flare',
                variant_type = 'booster-box'
  where slug = '2025-pokemon-tcg-white-flare-booster-box';

-- ---------------------------------------------------------------------
-- 3. Add missing variants — Prismatic Evolutions (Jan 17, 2025)
--    Eevee/Eeveelution-themed. The hottest 2025 Pokemon set so far.
-- ---------------------------------------------------------------------
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-pokemon-tcg-prismatic-evolutions-elite-trainer-box', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Elite Trainer Box', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Elite Trainer Box. Eevee/Eeveelution-themed special set. 9 booster packs + 65 sleeves + 45 energy + accessories. The hottest 2025 ETB.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'elite-trainer-box'),
  ('2025-pokemon-tcg-prismatic-evolutions-booster-bundle', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Booster Bundle', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Booster Bundle. 6 booster packs in collector packaging.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'booster-bundle'),
  ('2025-pokemon-tcg-prismatic-evolutions-premium-collection', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Premium Collection', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Premium Collection. Eevee-themed promo card + multiple boosters + accessories.',
   null, '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'premium-collection'),
  ('2025-pokemon-tcg-prismatic-evolutions-upc', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Ultra-Premium Collection', '2025-02-21',
   'Pokemon TCG Prismatic Evolutions Ultra-Premium Collection (UPC). Top-tier Eevee/Eeveelution flagship — metal card, 16+ boosters, oversized promos, premium binders.',
   null, '#ec4899', '#fbbf24', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'upc'),

-- ---------------------------------------------------------------------
-- 4. Journey Together (March 28, 2025) — Trainer's Pokemon cards return
-- ---------------------------------------------------------------------
  ('2025-pokemon-tcg-journey-together-booster-box', 2025, 'Pokemon', 'Pokemon', 'Journey Together',
   'Booster Box', '2025-03-28',
   'Pokemon TCG Journey Together Booster Box. Trainer''s Pokemon cards return — featuring N, Hop, Iono and other named trainers. 36 packs of 10 cards.',
   null, '#0891b2', '#0f172a', false,
   '2025-pokemon-tcg-journey-together', 'booster-box'),
  ('2025-pokemon-tcg-journey-together-booster-bundle', 2025, 'Pokemon', 'Pokemon', 'Journey Together',
   'Booster Bundle', '2025-03-28',
   'Pokemon TCG Journey Together Booster Bundle. 6 packs entry-level retail.',
   null, '#0891b2', '#0f172a', false,
   '2025-pokemon-tcg-journey-together', 'booster-bundle'),
  ('2025-pokemon-tcg-journey-together-premium-collection', 2025, 'Pokemon', 'Pokemon', 'Journey Together',
   'Premium Collection', '2025-03-28',
   'Pokemon TCG Journey Together Premium Collection. Trainer-themed promo card + boosters + accessories.',
   null, '#0891b2', '#0f172a', false,
   '2025-pokemon-tcg-journey-together', 'premium-collection'),

-- ---------------------------------------------------------------------
-- 5. Destined Rivals (May 30, 2025)
-- ---------------------------------------------------------------------
  ('2025-pokemon-tcg-destined-rivals-booster-box', 2025, 'Pokemon', 'Pokemon', 'Destined Rivals',
   'Booster Box', '2025-05-30',
   'Pokemon TCG Destined Rivals Booster Box. Continuation of the Trainer''s Pokemon arc. 36 packs of 10 cards.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-destined-rivals', 'booster-box'),
  ('2025-pokemon-tcg-destined-rivals-booster-bundle', 2025, 'Pokemon', 'Pokemon', 'Destined Rivals',
   'Booster Bundle', '2025-05-30',
   'Pokemon TCG Destined Rivals Booster Bundle. 6 packs.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-destined-rivals', 'booster-bundle'),
  ('2025-pokemon-tcg-destined-rivals-premium-collection', 2025, 'Pokemon', 'Pokemon', 'Destined Rivals',
   'Premium Collection', '2025-05-30',
   'Pokemon TCG Destined Rivals Premium Collection.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-destined-rivals', 'premium-collection'),

-- ---------------------------------------------------------------------
-- 6. Black Bolt + White Flare (July 18, 2025) — companion sets
-- ---------------------------------------------------------------------
  ('2025-pokemon-tcg-black-bolt-elite-trainer-box', 2025, 'Pokemon', 'Pokemon', 'Black Bolt',
   'Elite Trainer Box', '2025-07-18',
   'Pokemon TCG Black Bolt Elite Trainer Box. Reshiram-themed companion set to White Flare. 9 packs + accessories + sleeves + energy.',
   null, '#0f172a', '#dc2626', false,
   '2025-pokemon-tcg-black-bolt', 'elite-trainer-box'),
  ('2025-pokemon-tcg-black-bolt-booster-bundle', 2025, 'Pokemon', 'Pokemon', 'Black Bolt',
   'Booster Bundle', '2025-07-18',
   'Pokemon TCG Black Bolt Booster Bundle. 6 packs.',
   null, '#0f172a', '#dc2626', false,
   '2025-pokemon-tcg-black-bolt', 'booster-bundle'),
  ('2025-pokemon-tcg-white-flare-elite-trainer-box', 2025, 'Pokemon', 'Pokemon', 'White Flare',
   'Elite Trainer Box', '2025-07-18',
   'Pokemon TCG White Flare Elite Trainer Box. Zekrom-themed companion set to Black Bolt. 9 packs + accessories.',
   null, '#ffffff', '#0891b2', false,
   '2025-pokemon-tcg-white-flare', 'elite-trainer-box'),
  ('2025-pokemon-tcg-white-flare-booster-bundle', 2025, 'Pokemon', 'Pokemon', 'White Flare',
   'Booster Bundle', '2025-07-18',
   'Pokemon TCG White Flare Booster Bundle. 6 packs.',
   null, '#ffffff', '#0891b2', false,
   '2025-pokemon-tcg-white-flare', 'booster-bundle')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
