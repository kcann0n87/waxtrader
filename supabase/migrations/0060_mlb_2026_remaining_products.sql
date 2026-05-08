-- 0060_mlb_2026_remaining_products.sql
-- Fills the rest of the 2026 MLB calendar from Beckett. Migration 0056
-- already added Topps Series 1, Heritage, Bowman flagship + Mega,
-- Panini Donruss, Topps Chrome Black. This round covers the niche
-- and premium adjacent products on the 2026 MLB calendar:
--
--   - Topps Hobby Rip Night (Feb 21, 2026) — special-event Topps
--     product
--   - Topps Now Road To Opening Day (Mar 20, 2026) — Topps Now style
--   - Topps Collector Kit Wave 1 (Mar 25, 2026) — niche kit format
--   - Topps Series 1 Celebration Mega Box (Mar 26, 2026) — special
--     edition mega of Series 1 with exclusive parallels
--   - Panini Stars Stripes Prizm USA Baseball (Apr 3, 2026) —
--     USA Baseball Olympics-aligned product
--   - Leaf Metal Baseball (Apr 22, 2026) — Leaf brand premium prospect
--   - Donruss Elite Baseball (Jun 17, 2026) — premium Donruss line
--
-- Source: Beckett's 2026 MLB calendar at
-- https://www.beckett.com/news/2026-baseball-card-release-dates-checklists-and-set-information/
--
-- All hobby-box only this round; image_url=null (gradient fallback).

insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  ('2026-topps-hobby-rip-night-baseball-hobby-box', 2026, 'Topps', 'MLB', 'Hobby Rip Night',
   'Hobby Box', '2026-02-21',
   '2026 Topps Hobby Rip Night MLB Hobby Box. Special-event hobby release with rip-card mechanic — break the card open to reveal cards inside. Limited print run.',
   null, '#dc2626', '#0f172a', true,
   '2026-topps-hobby-rip-night-baseball', 'hobby-box'),
  ('2026-topps-now-road-to-opening-day-baseball-hobby-box', 2026, 'Topps', 'MLB', 'Now Road to Opening Day',
   'Hobby Box', '2026-03-20',
   '2026 Topps Now Road to Opening Day MLB Hobby Box. Topps Now-style on-demand cards capturing the 2026 Spring Training and lead-up to Opening Day.',
   null, '#dc2626', '#1e293b', true,
   '2026-topps-now-road-to-opening-day-baseball', 'hobby-box'),
  ('2026-topps-collector-kit-wave-1-baseball-hobby-box', 2026, 'Topps', 'MLB', 'Collector Kit Wave 1',
   'Hobby Box', '2026-03-25',
   '2026 Topps Collector Kit Wave 1 MLB Hobby Box. Themed collector kit with curated parallels and inserts. Hobby-only format.',
   null, '#a16207', '#0f172a', true,
   '2026-topps-collector-kit-wave-1-baseball', 'hobby-box'),
  ('2026-topps-series-1-baseball-celebration-mega-box', 2026, 'Topps', 'MLB', 'Series 1 Celebration',
   'Mega Box', '2026-03-26',
   '2026 Topps Series 1 Celebration MLB Mega Box. Special-edition Series 1 mega with celebration-themed parallels and exclusive inserts. Same base set as Series 1.',
   null, '#dc2626', '#fbbf24', true,
   '2026-topps-series-1-baseball-celebration', 'mega-box'),
  ('2026-panini-stars-and-stripes-prizm-usa-baseball-hobby-box', 2026, 'Panini', 'MLB', 'Stars & Stripes Prizm USA',
   'Hobby Box', '2026-04-03',
   '2026 Panini Stars & Stripes Prizm USA Baseball Hobby Box. USA Baseball-themed Prizm with Olympics-aligned stars and Team USA prospects. Patriotic design language.',
   null, '#1e3a8a', '#dc2626', true,
   '2026-panini-stars-and-stripes-prizm-usa-baseball', 'hobby-box'),
  ('2026-leaf-metal-baseball-hobby-box', 2026, 'Leaf', 'MLB', 'Metal',
   'Hobby Box', '2026-04-22',
   '2026 Leaf Metal Baseball Hobby Box. Leaf''s premium prospect-focused metal-style cards with on-card autographs. Top draft prospects + minor leaguers.',
   null, '#0f172a', '#a16207', true,
   '2026-leaf-metal-baseball', 'hobby-box'),
  ('2026-panini-donruss-elite-baseball-hobby-box', 2026, 'Panini', 'MLB', 'Donruss Elite',
   'Hobby Box', '2026-06-17',
   '2026 Panini Donruss Elite MLB Hobby Box. Premium Elite Series Status parallels and on-card autographs. Donruss premium tier.',
   null, '#7c3aed', '#0f172a', true,
   '2026-panini-donruss-elite-baseball', 'hobby-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
