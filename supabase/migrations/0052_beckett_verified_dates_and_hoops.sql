-- 0052_beckett_verified_dates_and_hoops.sql
-- Date corrections + missing Hoops product. All dates cross-checked
-- against Beckett's 2025-26 NBA release calendar
-- (https://www.beckett.com/news/2025-26-basketball-card-release-dates-checklists-and-set-information/).
--
-- Date fixes:
--   - Topps Cosmic Chrome NBA: 2026-05-01 → 2026-04-29 (Beckett)
--   - Topps Bowman U Best NBA: 2026-03-23 → 2026-05-15 (Beckett:
--     "2025-26 Bowman Best University Basketball | May 15, 2026")
--
-- New product: 2025-26 Topps NBA Hoops Basketball — completely
-- missing from catalog. Real Topps-licensed NBA product with player
-- team jerseys on the cards (unlike Panini's unlicensed releases).
-- Released May 14, 2026 per Beckett. Adding hobby + retail variants.
-- Cooper Flagg, Dylan Harper, Ace Bailey rookie targets.
--
-- Image bindings: real product photos sourced and saved to
-- /public/products/ for Bowman flagship + Donruss + Hoops. Setting
-- image_url so the gradient fallback gets replaced.
--
-- Idempotent — UPDATEs key on slug, INSERT uses ON CONFLICT.

-- ---------------------------------------------------------------------
-- 1. Date corrections (Beckett-verified)
-- ---------------------------------------------------------------------
update skus set release_date = '2026-04-29'
  where slug = '2025-26-topps-cosmic-chrome-basketball-hobby-box';
update skus set release_date = '2026-04-29'
  where slug = '2025-26-topps-cosmic-chrome-basketball-hobby-case';

update skus set release_date = '2026-05-15'
  where slug = '2025-26-topps-bowman-u-basketball-hobby-box';
update skus set release_date = '2026-05-15'
  where slug = '2025-26-topps-bowman-u-basketball-hobby-case';

-- ---------------------------------------------------------------------
-- 2. Bind the verified product images
-- ---------------------------------------------------------------------
update skus set image_url = '/products/2025-26-topps-bowman-basketball-hobby-box.jpg'
  where slug = '2025-26-topps-bowman-basketball-hobby-box';

update skus set image_url = '/products/2025-26-panini-donruss-basketball-hobby-box.jpg'
  where slug = '2025-26-panini-donruss-basketball-hobby-box';

-- ---------------------------------------------------------------------
-- 3. NEW: 2025-26 Topps NBA Hoops Basketball
--    Real Topps-licensed NBA product (jerseys + team logos on cards).
--    Released May 14, 2026. Multiple retail formats.
-- ---------------------------------------------------------------------
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-topps-nba-hoops-basketball-hobby-box', 2025, 'Topps', 'NBA', 'NBA Hoops',
   'Hobby Box', '2026-05-14',
   '2025-26 Topps NBA Hoops Basketball Hobby Box. The first Hoops under Topps after the Panini-to-Topps NBA license transition. Fully licensed — team logos, full jerseys, real NBA team names. 20 packs of 8 cards. 1 autograph per box. Cooper Flagg, Dylan Harper, Ace Bailey rookie cards.',
   '/products/2025-26-topps-nba-hoops-basketball-hobby-box.jpg',
   '#dc2626', '#0f172a', true,
   '2025-26-topps-nba-hoops-basketball', 'hobby-box'),
  ('2025-26-topps-nba-hoops-basketball-mega-box', 2025, 'Topps', 'NBA', 'NBA Hoops',
   'Mega Box', '2026-05-14',
   '2025-26 Topps NBA Hoops Basketball Mega Box. Mega-exclusive parallels and inserts. Higher-volume retail rip.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-nba-hoops-basketball', 'mega-box'),
  ('2025-26-topps-nba-hoops-basketball-blaster-box', 2025, 'Topps', 'NBA', 'NBA Hoops',
   'Blaster Box', '2026-05-14',
   '2025-26 Topps NBA Hoops Basketball Blaster Box. Entry-level retail with blaster-exclusive parallels.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-nba-hoops-basketball', 'blaster-box'),
  ('2025-26-topps-nba-hoops-basketball-hobby-case', 2025, 'Topps', 'NBA', 'NBA Hoops',
   'Hobby Case', '2026-05-14',
   '2025-26 Topps NBA Hoops Basketball Hobby Case. 20 hobby boxes per case. 20 autographs guaranteed.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-nba-hoops-basketball', 'hobby-case')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type,
  image_url = excluded.image_url;
