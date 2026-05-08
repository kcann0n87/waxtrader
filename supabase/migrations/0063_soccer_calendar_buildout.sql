-- 0063_soccer_calendar_buildout.sql
-- Soccer calendar buildout. Sources: waxstat 2025-26 + 2026 soccer
-- calendars + Beckett individual product pages.
--
-- Adds the major flagship + premium soccer products we don't have yet:
--
--   - 2026 Panini Prizm World Cup Soccer (Jun 17, 2026) — the
--     flagship 2026 FIFA World Cup product. Massive demand — World
--     Cup is in USA/Canada/Mexico summer 2026.
--   - 2026 Panini Donruss World Cup (anchored to same release window)
--   - 2026 Topps Chrome Premier League EPL (Feb 5, 2026 — past)
--   - 2025 Topps Inception MLS (Nov 24, 2025 — past)
--   - 2026 Topps MLS Chrome (Feb 2027 — past, late-season retro)
--   - 2026 Leaf Glory of the Game Soccer (Jul 3, 2026)
--
-- All hobby-box only this round; image_url=null. World Cup products
-- in particular will see massive launch demand — having them in the
-- catalog ahead of release lets sellers pre-list.

insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2026-panini-prizm-world-cup-soccer-hobby-box', 2026, 'Panini', 'Soccer', 'Prizm World Cup',
   'Hobby Box', '2026-06-17',
   '2026 Panini Prizm FIFA World Cup Soccer Hobby Box. The flagship product for the 2026 FIFA World Cup hosted in USA, Canada, and Mexico. Star-driven Prizm parallels with the biggest names in international football.',
   null, '#16a34a', '#1e3a8a', true,
   '2026-panini-prizm-world-cup-soccer', 'hobby-box'),
  ('2026-panini-donruss-world-cup-soccer-hobby-box', 2026, 'Panini', 'Soccer', 'Donruss World Cup',
   'Hobby Box', '2026-06-24',
   '2026 Panini Donruss FIFA World Cup Soccer Hobby Box. Mid-tier Donruss for the 2026 World Cup. Rated Rookies + Optic parallels with World Cup-themed inserts.',
   null, '#dc2626', '#1e3a8a', true,
   '2026-panini-donruss-world-cup-soccer', 'hobby-box'),
  ('2026-topps-chrome-premier-league-epl-soccer-hobby-box', 2026, 'Topps', 'Soccer', 'Chrome Premier League',
   'Hobby Box', '2026-02-05',
   '2026 Topps Chrome Premier League EPL Soccer Hobby Box. Chrome flagship for the 2025-26 Premier League season. Refractor parallels and on-card autographs of EPL stars.',
   null, '#7c3aed', '#0f172a', true,
   '2026-topps-chrome-premier-league-epl-soccer', 'hobby-box'),
  ('2025-topps-inception-mls-soccer-hobby-box', 2025, 'Topps', 'Soccer', 'Inception MLS',
   'Hobby Box', '2025-11-24',
   '2025 Topps Inception MLS Major League Soccer Hobby Box. Premium on-card autographs from MLS stars. 1 autograph or auto-relic per box, 7 cards total. Lionel Messi, Christian Pulisic targets.',
   null, '#0f172a', '#7c3aed', true,
   '2025-topps-inception-mls-soccer', 'hobby-box'),
  ('2026-topps-mls-chrome-soccer-hobby-box', 2026, 'Topps', 'Soccer', 'MLS Chrome',
   'Hobby Box', '2027-02-06',
   '2026 Topps MLS Chrome Soccer Hobby Box. Chrome-stock MLS product for the 2026 season. Refractors, parallels, and rookie autographs.',
   null, '#7c3aed', '#0f172a', true,
   '2026-topps-mls-chrome-soccer', 'hobby-box'),
  ('2026-leaf-glory-of-the-game-soccer-hobby-box', 2026, 'Leaf', 'Soccer', 'Glory of the Game',
   'Hobby Box', '2026-07-03',
   '2026 Leaf Glory of the Game Soccer Hobby Box. Leaf brand high-end soccer release post-World Cup. Premium autographs and memorabilia from international stars.',
   null, '#a16207', '#0f172a', true,
   '2026-leaf-glory-of-the-game-soccer', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
