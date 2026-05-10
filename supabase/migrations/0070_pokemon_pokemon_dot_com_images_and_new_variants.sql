-- 0070_pokemon_pokemon_dot_com_images_and_new_variants.sql
-- Pokemon.com static-asset CDN turned out to host every official
-- product photo at a predictable URL pattern:
--   /static-assets/.../incrementals/<year>/<setcode>-<variant>/<setcode>-<variant>-169-en.png
-- This round binds every official photo we could harvest + adds 4
-- new product types we hadn't modeled (Pokemon Center exclusive ETB,
-- First Partners Pin Collection, Premium Poster Collection,
-- Binder Collection).
--
-- Top-product image binds (replaces lower-quality picclick scrapes):
--   - Ascended Heroes ETB (already had picclick, swapping to PC)
--   - Ascended Heroes Booster Bundle (same)
--   - Ascended Heroes Sticker Collection (NEW image)
--   - Perfect Order Booster Bundle (NEW image)
--   - Perfect Order Elite Trainer Box (NEW image)
--   - Prismatic Evolutions Booster Bundle (replace picclick)
--   - Prismatic Evolutions Elite Trainer Box (replace picclick)
--   - Prismatic Evolutions Sticker Collection (NEW image)
--
-- New SKUs added (4 for Ascended Heroes + Prismatic):
--   - Ascended Heroes Pokemon Center Elite Trainer Box (Pokemon
--     Center exclusive variant — different artwork from regular ETB)
--   - Ascended Heroes First Partners Deluxe Pin Collection
--   - Ascended Heroes Premium Poster Collection
--   - Prismatic Evolutions Binder Collection (Eeveelution-themed
--     storage binder + boosters)
--
-- All inserts is_published=FALSE — staged on the pokemon-tcg branch.

-- ---------------------------------------------------------------------
-- Bind / replace existing image URLs with Pokemon.com PNGs
-- ---------------------------------------------------------------------
update skus set image_url = '/products/2026-pokemon-tcg-ascended-heroes-sticker-collection.png'
  where slug = '2026-pokemon-tcg-ascended-heroes-sticker-collection';

update skus set image_url = '/products/2026-pokemon-tcg-perfect-order-booster-bundle.png'
  where slug = '2026-pokemon-tcg-perfect-order-booster-bundle';
update skus set image_url = '/products/2026-pokemon-tcg-perfect-order-elite-trainer-box.png'
  where slug = '2026-pokemon-tcg-perfect-order-elite-trainer-box';

-- Replace lower-quality picclick scrapes with high-quality Pokemon.com
update skus set image_url = '/products/2025-pokemon-tcg-prismatic-evolutions-booster-bundle.png'
  where slug = '2025-pokemon-tcg-prismatic-evolutions-booster-bundle';
update skus set image_url = '/products/2025-pokemon-tcg-prismatic-evolutions-elite-trainer-box.png'
  where slug = '2025-pokemon-tcg-prismatic-evolutions-elite-trainer-box';
update skus set image_url = '/products/2025-pokemon-tcg-prismatic-evolutions-sticker-collection.png'
  where slug = '2025-pokemon-tcg-prismatic-evolutions-sticker-collection';

-- ---------------------------------------------------------------------
-- Add 4 new SKUs for niche variants Pokemon.com had
-- ---------------------------------------------------------------------
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2026-pokemon-tcg-ascended-heroes-pokemon-center-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Pokemon Center ETB', '2026-01-30',
   'Pokemon TCG Ascended Heroes Pokemon Center Elite Trainer Box. Pokemon Center exclusive variant — different artwork from regular ETB. 9 packs + Pokemon Center exclusive promo + accessories.',
   '/products/2026-pokemon-tcg-ascended-heroes-pokemon-center-elite-trainer-box.png',
   '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'pokemon-center-elite-trainer-box'),
  ('2026-pokemon-tcg-ascended-heroes-first-partners-pin-collection', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'First Partners Pin Collection', '2026-01-30',
   'Pokemon TCG Ascended Heroes First Partners Deluxe Pin Collection. Themed pin collection with multiple boosters + collectible pins.',
   '/products/2026-pokemon-tcg-ascended-heroes-first-partners-pin-collection.png',
   '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'pin-collection'),
  ('2026-pokemon-tcg-ascended-heroes-premium-poster-collection', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Premium Poster Collection', '2026-01-30',
   'Pokemon TCG Ascended Heroes Premium Poster Collection. Includes oversized art poster + multiple boosters + accessories.',
   '/products/2026-pokemon-tcg-ascended-heroes-premium-poster-collection.png',
   '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'poster-collection'),
  ('2025-pokemon-tcg-prismatic-evolutions-binder-collection', 2025, 'Pokemon', 'Pokemon', 'Prismatic Evolutions',
   'Binder Collection', '2025-01-17',
   'Pokemon TCG Prismatic Evolutions Binder Collection. Eeveelution-themed storage binder + multiple boosters + collector promos.',
   '/products/2025-pokemon-tcg-prismatic-evolutions-binder-collection.png',
   '#ec4899', '#0f172a', false,
   '2025-pokemon-tcg-prismatic-evolutions', 'binder-collection')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type,
  image_url = excluded.image_url;
