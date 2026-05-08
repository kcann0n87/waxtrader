-- 0054_topps_basketball_flagship_and_image_fixes.sql
-- Image audit caught two issues:
--
--   1. The image at /products/2025-26-topps-inception-basketball-
--      hobby-box.jpg was actually the regular 2025-26 Topps
--      Basketball flagship (Cooper Flagg cover, "1 Autograph or
--      Relic" — Inception promises 2 on-card autos, this is the
--      wrong product). Inception NBA releases Sept 2026; the
--      flagship released October 23, 2025 per Beckett.
--
--   2. We never had the 2025-26 Topps Basketball flagship in the
--      catalog. Adding it now with the corrected image binding +
--      the standard hobby/jumbo/mega/blaster/case retail line.
--
-- Operations:
--   - Null the Inception NBA image_url (use gradient until a real
--     Inception product photo is available — Inception's Sept 2026
--     release means real photos don't exist yet).
--   - Add 2025-26 Topps Basketball SKU group (5 variants).
--   - File rename was done in the same commit:
--     /products/2025-26-topps-inception-basketball-hobby-box.jpg →
--     /products/2025-26-topps-basketball-hobby-box.jpg
--
-- Idempotent — UPDATEs by slug, INSERTs ON CONFLICT.

-- ---------------------------------------------------------------------
-- 1. Null the wrong image on Inception NBA
-- ---------------------------------------------------------------------
update skus set image_url = null
  where slug = '2025-26-topps-inception-basketball-hobby-box';

-- ---------------------------------------------------------------------
-- 2. Add 2025-26 Topps Basketball flagship (was missing)
--    Released: Oct 23, 2025 per Beckett. Cooper Flagg / Dylan Harper
--    rookie targets. Standard licensed Topps NBA flagship.
-- ---------------------------------------------------------------------
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-topps-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Topps',
   'Hobby Box', '2025-10-23',
   '2025-26 Topps Basketball Hobby Box. The new Topps NBA flagship after the Panini-to-Topps license transition. 1 autograph or relic per box, hobby-exclusive Black Rainbow parallels. Cooper Flagg, Dylan Harper, Ace Bailey rookie chase.',
   '/products/2025-26-topps-basketball-hobby-box.jpg',
   '#dc2626', '#0f172a', true,
   '2025-26-topps-basketball', 'hobby-box'),
  ('2025-26-topps-basketball-jumbo-box', 2025, 'Topps', 'NBA', 'Topps',
   'Hobby Jumbo Box', '2025-10-23',
   '2025-26 Topps Basketball Hobby Jumbo Box. Higher pack count + more guaranteed hits than standard hobby. Premium configuration.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-basketball', 'hobby-jumbo-box'),
  ('2025-26-topps-basketball-mega-box', 2025, 'Topps', 'NBA', 'Topps',
   'Mega Box', '2025-10-23',
   '2025-26 Topps Basketball Mega Box. Mega-exclusive parallels and inserts.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-basketball', 'mega-box'),
  ('2025-26-topps-basketball-blaster-box', 2025, 'Topps', 'NBA', 'Topps',
   'Blaster Box', '2025-10-23',
   '2025-26 Topps Basketball Blaster Box. Entry-level retail with blaster-exclusive parallels.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-basketball', 'blaster-box'),
  ('2025-26-topps-basketball-hobby-case', 2025, 'Topps', 'NBA', 'Topps',
   'Hobby Case', '2025-10-23',
   '2025-26 Topps Basketball Hobby Case. Multiple hobby boxes per case for collectors ripping volume.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-basketball', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type,
  image_url = excluded.image_url;
