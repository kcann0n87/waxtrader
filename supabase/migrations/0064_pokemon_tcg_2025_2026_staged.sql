-- 0064_pokemon_tcg_2025_2026_staged.sql
-- Pokemon TCG calendar buildout for 2025/2026 — STAGED with
-- is_published=false. Lets admins preview the Pokemon catalog on the
-- pokemon-tcg branch's Vercel preview URL without exposing the SKUs
-- on production waxdepot.io.
--
-- To go live: run this migration (rows insert as hidden), test via
-- /admin/catalog?sport=Pokemon&hidden=1 → click into each, verify,
-- then UPDATE skus SET is_published = true WHERE sport = 'Pokemon'
-- AND slug LIKE '202[5-6]-pokemon-tcg-%' to flip them all live in
-- one shot.
--
-- Major 2025/2026 Pokemon TCG products covered:
--   - Mega Evolution (the big September 2025 launch — first
--     Mega-themed set in years, massive demand)
--   - Mega Evolution: Phantasmal Flames (early 2026 follow-up)
--   - 2026 Q1 release (placeholder for next set)
--
-- Variant types follow Pokemon TCG retail conventions:
--   - booster-box (36 packs, hobby tier)
--   - elite-trainer-box (10 packs + accessories)
--   - booster-bundle (6 packs, retail)
--   - premium-collection (themed promo box)
--   - upc (Ultra-Premium Collection — top-tier flagship)

insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  -- Mega Evolution (Sept 2025) — flagship return of Mega Pokemon
  ('2025-pokemon-tcg-mega-evolution-booster-box', 2025, 'Pokemon', 'Pokemon', 'Mega Evolution',
   'Booster Box', '2025-09-26',
   'Pokemon TCG Mega Evolution Booster Box. The flagship Mega-themed set returning Mega Charizard X/Y, Mega Mewtwo, and other classic Mega Pokemon to the modern format. 36 packs of 10 cards.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-mega-evolution', 'booster-box'),
  ('2025-pokemon-tcg-mega-evolution-elite-trainer-box', 2025, 'Pokemon', 'Pokemon', 'Mega Evolution',
   'Elite Trainer Box', '2025-09-26',
   'Pokemon TCG Mega Evolution Elite Trainer Box. 10 booster packs + 65 card sleeves + 45 energy + dice + status counters + collector''s box. Premium retail.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-mega-evolution', 'elite-trainer-box'),
  ('2025-pokemon-tcg-mega-evolution-booster-bundle', 2025, 'Pokemon', 'Pokemon', 'Mega Evolution',
   'Booster Bundle', '2025-09-26',
   'Pokemon TCG Mega Evolution Booster Bundle. 6 booster packs in collector packaging. Entry-level retail format.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-mega-evolution', 'booster-bundle'),
  ('2025-pokemon-tcg-mega-evolution-premium-collection', 2025, 'Pokemon', 'Pokemon', 'Mega Evolution',
   'Premium Collection', '2025-09-26',
   'Pokemon TCG Mega Evolution Premium Collection. Includes oversized Mega promo card, multiple booster packs, and exclusive accessories.',
   null, '#dc2626', '#0f172a', false,
   '2025-pokemon-tcg-mega-evolution', 'premium-collection'),
  ('2025-pokemon-tcg-mega-evolution-upc', 2025, 'Pokemon', 'Pokemon', 'Mega Evolution',
   'Ultra-Premium Collection', '2025-10-24',
   'Pokemon TCG Mega Evolution Ultra-Premium Collection (UPC). The top-tier collector product — features a Mega-themed metal card, multiple booster packs, oversized promos, and premium accessories. Retails ~$120.',
   null, '#dc2626', '#fbbf24', false,
   '2025-pokemon-tcg-mega-evolution', 'upc'),

  -- Mega Evolution Phantasmal Flames (early 2026, sequential SV-era release)
  ('2026-pokemon-tcg-phantasmal-flames-booster-box', 2026, 'Pokemon', 'Pokemon', 'Phantasmal Flames',
   'Booster Box', '2026-02-06',
   'Pokemon TCG Phantasmal Flames Booster Box. Early 2026 release continuing the Mega Evolution story arc. 36 packs of 10 cards. Follow-up to Mega Evolution''s September 2025 debut.',
   null, '#7c3aed', '#0f172a', false,
   '2026-pokemon-tcg-phantasmal-flames', 'booster-box'),
  ('2026-pokemon-tcg-phantasmal-flames-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Phantasmal Flames',
   'Elite Trainer Box', '2026-02-06',
   'Pokemon TCG Phantasmal Flames Elite Trainer Box. 10 booster packs + 65 sleeves + 45 energy + accessories + collector''s box.',
   null, '#7c3aed', '#0f172a', false,
   '2026-pokemon-tcg-phantasmal-flames', 'elite-trainer-box'),
  ('2026-pokemon-tcg-phantasmal-flames-booster-bundle', 2026, 'Pokemon', 'Pokemon', 'Phantasmal Flames',
   'Booster Bundle', '2026-02-06',
   'Pokemon TCG Phantasmal Flames Booster Bundle. 6 packs entry-level retail.',
   null, '#7c3aed', '#0f172a', false,
   '2026-pokemon-tcg-phantasmal-flames', 'booster-bundle'),

  -- Q2 2026 placeholder (TBA set)
  ('2026-pokemon-tcg-q2-set-booster-box', 2026, 'Pokemon', 'Pokemon', 'Q2 2026 Set (TBA)',
   'Booster Box', '2026-05-01',
   'Pokemon TCG Q2 2026 Set Booster Box. Placeholder for the next Pokemon TCG mainline release — name and exact theme TBA. 36 packs of 10 cards.',
   null, '#16a34a', '#0f172a', false,
   '2026-pokemon-tcg-q2-set', 'booster-box'),
  ('2026-pokemon-tcg-q2-set-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Q2 2026 Set (TBA)',
   'Elite Trainer Box', '2026-05-01',
   'Pokemon TCG Q2 2026 Set Elite Trainer Box. Placeholder for the next Pokemon TCG mainline ETB.',
   null, '#16a34a', '#0f172a', false,
   '2026-pokemon-tcg-q2-set', 'elite-trainer-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
