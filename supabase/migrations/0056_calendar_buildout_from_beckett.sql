-- 0056_calendar_buildout_from_beckett.sql
-- Comprehensive calendar buildout sourced from Beckett's official
-- release calendars across all major sports:
--   - NBA: 2025-26 basketball page
--   - NHL: 2025-26 hockey page
--   - NFL: 2025 football page
--   - MLB: 2025 + 2026 baseball pages
--
-- Adds 30 missing flagship/premium SKUs that we didn't have in the
-- catalog, all dated from Beckett. Each is hobby-box only — case/mega/
-- blaster retail variants can follow in a later round if needed. Most
-- of these are premium hobby-only products by design (Bowman's Best,
-- Definitive, Transcendent, etc.).
--
-- Image bindings: image_url=null for all (gradient fallback). Real
-- product photos to be sourced + bound later.
--
-- All inserts are ON CONFLICT DO UPDATE to be idempotent.

-- ===========================================================================
-- MLB 2026 — full new flagship season (none of these were in the catalog)
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2026-topps-series-1-baseball-hobby-box', 2026, 'Topps', 'MLB', 'Series 1',
   'Hobby Box', '2026-02-11',
   '2026 Topps Series 1 MLB Hobby Box. The flagship 2026 MLB release. 20 packs of 12 cards. 1 autograph or relic per box. Standard Topps base set kicks off the new season.',
   null, '#dc2626', '#1e3a8a', true,
   '2026-topps-series-1-baseball', 'hobby-box'),
  ('2026-topps-heritage-baseball-hobby-box', 2026, 'Topps', 'MLB', 'Heritage',
   'Hobby Box', '2026-03-18',
   '2026 Topps Heritage MLB Hobby Box. 2026 Heritage celebrates the 1977 design. 24 packs of 9 cards. Themed parallels (Bicentennial, Color of the Year, Chrome).',
   null, '#a16207', '#1e293b', true,
   '2026-topps-heritage-baseball', 'hobby-box'),
  ('2026-bowman-baseball-hobby-box', 2026, 'Bowman', 'MLB', 'Bowman',
   'Hobby Box', '2026-05-13',
   '2026 Bowman MLB Hobby Box. The premier prospect product. 24 packs of 8 cards. 1 Chrome Prospect autograph + 1 Mini-Diamond + 1 X-Fractor guaranteed.',
   null, '#16a34a', '#0f172a', true,
   '2026-bowman-baseball', 'hobby-box'),
  ('2026-bowman-baseball-mega-box', 2026, 'Bowman', 'MLB', 'Bowman',
   'Mega Box', '2026-05-27',
   '2026 Bowman MLB Mega Box. Mega-exclusive Mojo refractors and Chrome packs. $49.99 MSRP.',
   null, '#16a34a', '#0f172a', true,
   '2026-bowman-baseball', 'mega-box'),
  ('2026-panini-donruss-baseball-hobby-box', 2026, 'Panini', 'MLB', 'Donruss',
   'Hobby Box', '2026-05-27',
   '2026 Panini Donruss MLB Hobby Box. Continuing the Donruss tradition; vintage-style design with Rated Rookies.',
   null, '#dc2626', '#0f172a', true,
   '2026-panini-donruss-baseball', 'hobby-box'),
  ('2026-topps-chrome-black-baseball-hobby-box', 2026, 'Topps', 'MLB', 'Chrome Black',
   'Hobby Box', '2026-04-29',
   '2026 Topps Chrome Black MLB Hobby Box. Premium black-themed chrome with 2 packs per box, 6 cards per pack. 1 encased autograph guaranteed. $199.99 MSRP.',
   null, '#0f172a', '#1e293b', true,
   '2026-topps-chrome-black-baseball', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description, release_date = excluded.release_date,
  is_published = excluded.is_published, variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- MLB 2025 — premium + niche flagship products we missed
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-topps-bowman-best-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Bowman Best',
   'Hobby Box', '2026-03-11',
   '2025 Bowman''s Best MLB Hobby Box. Premium prospect chrome. 2 mini boxes per master box, 6 packs per mini, 5 cards per pack. 4 autographs per master box.',
   null, '#16a34a', '#0f172a', true,
   '2025-topps-bowman-best-baseball', 'hobby-box'),
  ('2025-topps-museum-collection-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Museum Collection',
   'Hobby Box', '2026-02-06',
   '2025 Topps Museum Collection MLB Hobby Box. Premium hobby-only product. 1 pack per box, 5 cards per pack. 4 hits per box including 2 autographs and 2 relics.',
   null, '#a16207', '#1e293b', true,
   '2025-topps-museum-collection-baseball', 'hobby-box'),
  ('2025-topps-definitive-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Definitive',
   'Hobby Box', '2026-04-07',
   '2025 Topps Definitive MLB Hobby Box. Ultra-premium product. 1 pack of 7 cards per box. 5 autographs and 2 relic cards per box.',
   null, '#0f172a', '#7c3aed', true,
   '2025-topps-definitive-baseball', 'hobby-box'),
  ('2025-topps-transcendent-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Transcendent',
   'Hobby Box', '2026-04-01',
   '2025 Topps Transcendent MLB Hobby Box. Top-tier ultra-premium release. Limited print run, all-hits product with high-end autograph book cards.',
   null, '#0f172a', '#fbbf24', true,
   '2025-topps-transcendent-baseball', 'hobby-box'),
  ('2025-topps-gilded-collection-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Gilded Collection',
   'Hobby Box', '2026-02-20',
   '2025 Topps Gilded Collection MLB Hobby Box. Gold-themed premium. 1 pack of 4 cards per box. 1 autograph and 3 base/parallels/inserts per box.',
   null, '#a16207', '#0f172a', true,
   '2025-topps-gilded-collection-baseball', 'hobby-box'),
  ('2025-topps-archives-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Archives',
   'Hobby Box', '2025-12-12',
   '2025 Topps Archives MLB Hobby Box. Throwback designs from past Topps sets. 24 packs of 8 cards. 2 autographs per box.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-topps-archives-baseball', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description, release_date = excluded.release_date,
  is_published = excluded.is_published, variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- NBA 2025-26 — Topps in-season retail line + premium adds
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-topps-holiday-basketball-mega-box', 2025, 'Topps', 'NBA', 'Holiday',
   'Mega Box', '2025-10-30',
   '2025-26 Topps Holiday NBA Mega Box. Festive-themed retail product. Snowflake parallels and holiday-exclusive inserts. 10 packs per box.',
   null, '#dc2626', '#16a34a', true,
   '2025-26-topps-holiday-basketball', 'mega-box'),
  ('2025-26-topps-midnight-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Midnight',
   'Hobby Box', '2026-01-29',
   '2025-26 Topps Midnight NBA Hobby Box. Black-bordered chrome variant. Fanatics Live exclusive — small print run, premium chrome cards.',
   null, '#0f172a', '#1e293b', true,
   '2025-26-topps-midnight-basketball', 'hobby-box'),
  ('2025-26-topps-three-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Three',
   'Hobby Box', '2026-03-05',
   '2025-26 Topps Three NBA Hobby Box. New Topps brand focused on chrome refractors and high-grade rookie rookie autographs.',
   null, '#dc2626', '#0f172a', true,
   '2025-26-topps-three-basketball', 'hobby-box'),
  ('2025-26-topps-chrome-mcdonalds-all-american-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Chrome McDonald''s All American',
   'Hobby Box', '2026-03-12',
   '2025-26 Topps Chrome McDonald''s All American Basketball Hobby Box. Tribute to the McDonald''s All American Game with chrome rookie autographs.',
   null, '#dc2626', '#fbbf24', true,
   '2025-26-topps-chrome-mcdonalds-all-american-basketball', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description, release_date = excluded.release_date,
  is_published = excluded.is_published, variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- NHL 2025-26 — major Upper Deck flagship line we missed
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-upper-deck-mvp-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'MVP',
   'Hobby Box', '2025-07-30',
   '2025-26 Upper Deck MVP NHL Hobby Box. Entry-tier set with full base + Rookies + classic MVP design. 24 packs of 6 cards.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-mvp-hockey', 'hobby-box'),
  ('2025-26-upper-deck-tim-hortons-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'Tim Hortons',
   'Hobby Box', '2025-10-06',
   '2025-26 Upper Deck Tim Hortons NHL Hobby Box. Cards distributed through Tim Hortons stores in Canada. Box version of the popular promotion.',
   null, '#dc2626', '#fbbf24', true,
   '2025-26-upper-deck-tim-hortons-hockey', 'hobby-box'),
  ('2025-26-upper-deck-allure-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'Allure',
   'Hobby Box', '2026-01-14',
   '2025-26 Upper Deck Allure NHL Hobby Box. Chrome-style refractor product. 8 packs of 5 cards. 1 autograph + 1 memorabilia card per box.',
   null, '#7c3aed', '#0f172a', true,
   '2025-26-upper-deck-allure-hockey', 'hobby-box'),
  ('2025-26-o-pee-chee-hockey-hobby-box', 2025, 'O-Pee-Chee', 'NHL', 'O-Pee-Chee',
   'Hobby Box', '2026-01-29',
   '2025-26 O-Pee-Chee NHL Hobby Box. Vintage-style retro design from the Upper Deck-owned O-Pee-Chee brand. 32 packs of 8 cards. Marquee Rookies.',
   null, '#dc2626', '#1e3a8a', true,
   '2025-26-o-pee-chee-hockey', 'hobby-box'),
  ('2025-26-upper-deck-sp-game-used-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'SP Game Used',
   'Hobby Box', '2026-02-11',
   '2025-26 Upper Deck SP Game Used NHL Hobby Box. Premium relic product. 5 packs of 5 cards. 6 hits per box including auto + relics.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-sp-game-used-hockey', 'hobby-box'),
  ('2025-26-upper-deck-credentials-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'Credentials',
   'Hobby Box', '2026-04-29',
   '2025-26 Upper Deck Credentials NHL Hobby Box. Photographic-style premium product. 1 autograph + 1 memorabilia per box on average.',
   null, '#0891b2', '#1e3a8a', true,
   '2025-26-upper-deck-credentials-hockey', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description, release_date = excluded.release_date,
  is_published = excluded.is_published, variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- NFL 2025 — big-name premium products missing from catalog
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-panini-score-football-hobby-box', 2025, 'Panini', 'NFL', 'Score',
   'Hobby Box', '2025-07-03',
   '2025 Panini Score NFL Hobby Box. The traditional season-opener product. 24 packs of 12 cards. Rookie chase + classic Score design.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-score-football', 'hobby-box'),
  ('2025-panini-luminance-football-hobby-box', 2025, 'Panini', 'NFL', 'Luminance',
   'Hobby Box', '2025-07-23',
   '2025 Panini Luminance NFL Hobby Box. Premium glossy chrome stock. 4 packs of 6 cards. 5 autos + 1 memorabilia per box on average.',
   null, '#7c3aed', '#0f172a', true,
   '2025-panini-luminance-football', 'hobby-box'),
  ('2025-panini-origins-football-hobby-box', 2025, 'Panini', 'NFL', 'Origins',
   'Hobby Box', '2025-08-27',
   '2025 Panini Origins NFL Hobby Box. Premium pre-rookie debut product. 1 pack of 7 cards. 4 autographs + 2 memorabilia per box.',
   null, '#a16207', '#0f172a', true,
   '2025-panini-origins-football', 'hobby-box'),
  ('2025-panini-black-football-hobby-box', 2025, 'Panini', 'NFL', 'Black',
   'Hobby Box', '2025-10-08',
   '2025 Panini Black NFL Hobby Box. Premium black-themed product. 1 pack of 8 cards. 5 autographs + 1 memorabilia card per box.',
   null, '#0f172a', '#1e293b', true,
   '2025-panini-black-football', 'hobby-box'),
  ('2025-panini-impeccable-football-hobby-box', 2025, 'Panini', 'NFL', 'Impeccable',
   'Hobby Box', '2025-10-22',
   '2025 Panini Impeccable NFL Hobby Box. Ultra-premium with .999 silver bullion-style cards. 1 pack of 5 cards. 3 autographs + 2 silver coins per box.',
   null, '#0f172a', '#fbbf24', true,
   '2025-panini-impeccable-football', 'hobby-box'),
  ('2025-panini-absolute-football-hobby-box', 2025, 'Panini', 'NFL', 'Absolute',
   'Hobby Box', '2025-10-31',
   '2025 Panini Absolute NFL Hobby Box. Mid-tier premium. 8 packs of 5 cards. 5 autographs + 5 memorabilia cards per box on average.',
   null, '#dc2626', '#0f172a', true,
   '2025-panini-absolute-football', 'hobby-box'),
  ('2025-panini-photogenic-football-hobby-box', 2025, 'Panini', 'NFL', 'PhotoGenic',
   'Hobby Box', '2026-02-25',
   '2025 Panini PhotoGenic NFL Hobby Box. Photo-real autographed card product. Premium hobby format with 2 autographs per box.',
   null, '#7c3aed', '#0f172a', true,
   '2025-panini-photogenic-football', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description, release_date = excluded.release_date,
  is_published = excluded.is_published, variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ===========================================================================
-- 2025-26 NHL Tim Hortons Team Canada Olympic — Olympic-themed product
-- (Useful given the 2026 Winter Olympics in Italy)
-- ===========================================================================
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2025-26-upper-deck-tim-hortons-team-canada-olympic-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'Tim Hortons Team Canada Olympic',
   'Hobby Box', '2026-02-02',
   '2025-26 Upper Deck Tim Hortons Team Canada Olympic NHL Hobby Box. Special Olympic-themed product released alongside the 2026 Winter Games. Tim Hortons retail distribution.',
   null, '#dc2626', '#fbbf24', true,
   '2025-26-upper-deck-tim-hortons-team-canada-olympic-hockey', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description, release_date = excluded.release_date,
  is_published = excluded.is_published, variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
