-- 0072_bowman_u_default_to_hobby_box.sql
-- Ensure 2025-26 Topps Bowman U (Bowman University Best) NBA defaults
-- to its hobby box variant on the product page, with hobby case
-- available as a secondary variant chip.
--
-- The product page picks the default variant via sortByVariantOrder:
-- our canonical variant order is blaster → hanger → mega → HOBBY-BOX
-- → … → HOBBY-CASE. So as long as both rows exist with correct
-- variant_type values AND are is_published=true, hobby-box defaults.
--
-- This migration:
--   1. Ensures both rows exist in the catalog with correct values
--      (idempotent UPSERTs)
--   2. Force-sets is_published=true on both
--   3. Pins variant_group + variant_type explicitly so resolveProduct
--      can collapse them onto the canonical /product/<group> URL

insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-topps-bowman-u-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Bowman U',
   'Hobby Box', '2026-05-15',
   '2025-26 Topps Bowman University Best NBA Hobby Box. Premium NCAA-focused product — first officially licensed NCAA + NBA combined Bowman release. 4 autographs per box.',
   '/products/2025-26-topps-bowman-u-basketball-hobby-box.jpg',
   '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-u-basketball', 'hobby-box'),
  ('2025-26-topps-bowman-u-basketball-hobby-case', 2025, 'Topps', 'NBA', 'Bowman U',
   'Hobby Case', '2026-05-15',
   '2025-26 Topps Bowman University Best NBA Hobby Case. Multiple hobby boxes per case — 8 boxes typical for Bowman premium case configurations.',
   null,
   '#0ea5e9', '#1e3a8a', true,
   '2025-26-topps-bowman-u-basketball', 'hobby-case')
on conflict (slug) do update set
  is_published = true,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type,
  set_name = excluded.set_name,
  -- Don't overwrite description / release_date / image_url if they
  -- were edited from the admin UI — only force-update the structural
  -- fields needed for variant collapsing.
  description = case
    when skus.description is null or skus.description = ''
      then excluded.description
    else skus.description
  end;
