-- 0044_inception_dates_and_panini_nba_unlicensed.sql
-- Three corrections after spot-checking the 2025-26 NBA / 2025 MLB
-- catalog against Topps + Panini America + Beckett:
--
-- 1. 2025-26 Topps Inception NBA had a placeholder release_date of
--    2026-02-15 (carried over from migration 0014; migration 0017
--    explicitly flagged it as "date not yet confirmed"). Real release
--    is September 2026 — Inception NBA always streets late in the
--    season, not mid-season. Setting to 2026-09-23 (Wednesday, last
--    full week of September — Topps's typical launch slot).
--
-- 2. Add 2025 Topps Inception MLB to the catalog. Preorder window
--    opened May 18, 2026; product ships ~June 18. The premium MLB
--    on-card-auto product, comparable to Inception NFL/NBA. Slug
--    matches our 2025-mlb naming convention.
--
-- 3. Panini's 2025-26 NBA products (Donruss, Signature Series, Noir)
--    are real and dropping on schedule — but Panini lost the NBA
--    license October 1, 2025, so these releases are UNLICENSED:
--    player names + team cities only, no team logos / nicknames /
--    full uniforms. Append a clear note to each description so
--    buyers know what they're getting.
--
-- Idempotent — UPDATEs key on slug, INSERT uses ON CONFLICT.

-- ---------------------------------------------------------------------
-- 1. Fix Inception NBA date (placeholder → real Sept 2026 date)
-- ---------------------------------------------------------------------
update skus
  set release_date = '2026-09-23',
      description = '2025-26 Topps Inception NBA Hobby Box. Premium on-card autographs from rookies and stars. 1 autograph or auto-relic per box, 7 cards total. Late-season release — typical Inception slot is September.'
  where slug = '2025-26-topps-inception-basketball-hobby-box';

-- ---------------------------------------------------------------------
-- 2. Add 2025 Topps Inception MLB (the MLB version, distinct from the
--    Sterling MLB SKU we already have)
-- ---------------------------------------------------------------------
insert into skus (
  slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published
) values (
  '2025-topps-inception-baseball-hobby-box',
  2025,
  'Topps',
  'MLB',
  'Inception',
  'Hobby Box',
  '2026-05-18',
  '2025 Topps Inception MLB Hobby Box. Premium on-card rookie autographs — Roki Sasaki, Jasson Dominguez RC era. Preorder window May 18, ships ~June 18. 7 cards per box; 1 autograph or auto-relic guaranteed.',
  null,
  '#0f172a',
  '#7c3aed',
  true
)
on conflict (slug) do update
  set release_date = excluded.release_date,
      description = excluded.description,
      is_published = true;

-- ---------------------------------------------------------------------
-- 3. Mark Panini 2025-26 NBA products as unlicensed in their description
--    (Donruss, Signature Series, Noir — the three real-but-unlicensed
--    products on our catalog after 0039 hid Prizm NBA).
-- ---------------------------------------------------------------------
update skus
  set description = '2025-26 Panini Donruss NBA Hobby Box. UNLICENSED — Panini lost the NBA license Oct 1, 2025, so this release shows player names and team cities only, with no team logos or nicknames. Still a Donruss flagship: 3 autographs per box, Optic parallels, Downtown debuts.'
  where slug = '2025-26-panini-donruss-basketball-hobby-box';

update skus
  set description = '2025-26 Panini Signature Series NBA Hobby Box. UNLICENSED — Panini''s NBA license ended Oct 1, 2025, so cards show player names and team cities only (no logos). Heavy autograph product: signatures dominate the checklist.'
  where slug = '2025-26-panini-signature-series-basketball-hobby-box';

update skus
  set description = '2025-26 Panini Noir NBA Hobby Box. UNLICENSED — Panini lost the NBA license Oct 1, 2025, so this release shows player names + team cities only (no team logos). Premium cinematic-style design; 5 autographs + 1 memorabilia card per box.'
  where slug = '2025-26-panini-noir-basketball-hobby-box';
