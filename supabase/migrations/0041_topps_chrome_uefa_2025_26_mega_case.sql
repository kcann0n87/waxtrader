-- 0041_topps_chrome_uefa_2025_26_mega_case.sql
-- Adds the Mega Box + Hobby Case variants for 2025-26 Topps Chrome UEFA
-- Club Competitions (released today, 2026-05-07). Migration 0034 had
-- only the Hobby Box; the cleanup SQL renamed its slug but never
-- introduced the Case or Mega siblings. Idempotent ON CONFLICT.
--
-- Hobby Case: 12 hobby boxes per case (per Topps spec).
-- Mega Box: retail-channel variant with retail-exclusive parallels.

insert into skus (
  slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published
)
values
  ('2025-26-topps-chrome-uefa-club-competitions-soccer-hobby-case', 2025, 'Topps', 'Soccer', 'Chrome UEFA Club Competitions', 'Hobby Case', '2026-05-07',
    '2025-26 Topps Chrome UEFA Club Competitions Hobby Case. Sealed case of 12 hobby boxes — Champions League, Europa League, Europa Conference League. Refractor parallels and 1 auto per inner box.',
    null, '#0ea5e9', '#1e3a8a', true),

  ('2025-26-topps-chrome-uefa-club-competitions-soccer-mega-box', 2025, 'Topps', 'Soccer', 'Chrome UEFA Club Competitions', 'Mega Box', '2026-05-07',
    '2025-26 Topps Chrome UEFA Club Competitions Mega Box. Retail-channel variant with retail-exclusive parallels — same UEFA chrome chase, different parallel lineup than hobby.',
    null, '#0ea5e9', '#1e3a8a', true)

on conflict (slug) do nothing;
