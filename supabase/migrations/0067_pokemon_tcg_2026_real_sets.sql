-- 0067_pokemon_tcg_2026_real_sets.sql
-- Replaces the Q2 2026 TBA placeholder from migration 0064 with the
-- actual 4 confirmed 2026 Pokemon TCG sets per Pokemon.com /
-- PokeBeach / Bulbapedia.
--
-- 2026 Pokemon TCG calendar (confirmed):
--   - Jan 30: Ascended Heroes
--   - Mar 27: Mega Evolution—Perfect Order (Mega Zygarde, Starmie,
--     Clefable, Skarmory ex first appearances)
--   - May 22: Chaos Rising
--   - Aug/Sept: Storm Emerald (date TBA — using Sept 4 as best
--     estimate, will refine when announced)
--
-- 30th Celebration all-foil set is also coming late 2026 but no
-- date confirmed yet — leaving for a future round.
--
-- All inserts is_published=FALSE — staged on the pokemon-tcg branch.

-- ---------------------------------------------------------------------
-- 1. Remove the placeholder Q2 TBA SKUs from migration 0064
-- ---------------------------------------------------------------------
delete from skus
  where slug in (
    '2026-pokemon-tcg-q2-set-booster-box',
    '2026-pokemon-tcg-q2-set-elite-trainer-box'
  );

-- ---------------------------------------------------------------------
-- 2. Add the 4 real 2026 sets (3 variants each: Booster Box, ETB, Bundle)
-- ---------------------------------------------------------------------
insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  -- Ascended Heroes (Jan 30, 2026)
  ('2026-pokemon-tcg-ascended-heroes-booster-box', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Booster Box', '2026-01-30',
   'Pokemon TCG Ascended Heroes Booster Box. First mainline 2026 release. 36 packs of 10 cards. Continuation of the Phantasmal Flames story arc.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'booster-box'),
  ('2026-pokemon-tcg-ascended-heroes-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Elite Trainer Box', '2026-01-30',
   'Pokemon TCG Ascended Heroes Elite Trainer Box. 9 packs + sleeves + energy + accessories.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'elite-trainer-box'),
  ('2026-pokemon-tcg-ascended-heroes-booster-bundle', 2026, 'Pokemon', 'Pokemon', 'Ascended Heroes',
   'Booster Bundle', '2026-01-30',
   'Pokemon TCG Ascended Heroes Booster Bundle. 6 packs entry-level retail.',
   null, '#fbbf24', '#0f172a', false,
   '2026-pokemon-tcg-ascended-heroes', 'booster-bundle'),

  -- Mega Evolution—Perfect Order (Mar 27, 2026)
  ('2026-pokemon-tcg-perfect-order-booster-box', 2026, 'Pokemon', 'Pokemon', 'Perfect Order',
   'Booster Box', '2026-03-27',
   'Pokemon TCG Mega Evolution—Perfect Order Booster Box. Continuation of the Mega Evolution arc — first appearances of Mega Zygarde ex, Mega Starmie ex, Mega Clefable ex, Mega Skarmory ex. 124-card set. 36 packs of 10 cards.',
   null, '#7c3aed', '#dc2626', false,
   '2026-pokemon-tcg-perfect-order', 'booster-box'),
  ('2026-pokemon-tcg-perfect-order-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Perfect Order',
   'Elite Trainer Box', '2026-03-27',
   'Pokemon TCG Mega Evolution—Perfect Order Elite Trainer Box. 9 packs + Tyrunt full-art promo + 65 sleeves + 40 energy + dice + coin + box.',
   null, '#7c3aed', '#dc2626', false,
   '2026-pokemon-tcg-perfect-order', 'elite-trainer-box'),
  ('2026-pokemon-tcg-perfect-order-booster-bundle', 2026, 'Pokemon', 'Pokemon', 'Perfect Order',
   'Booster Bundle', '2026-03-27',
   'Pokemon TCG Mega Evolution—Perfect Order Booster Bundle. 6 packs entry-level retail.',
   null, '#7c3aed', '#dc2626', false,
   '2026-pokemon-tcg-perfect-order', 'booster-bundle'),

  -- Chaos Rising (May 22, 2026)
  ('2026-pokemon-tcg-chaos-rising-booster-box', 2026, 'Pokemon', 'Pokemon', 'Chaos Rising',
   'Booster Box', '2026-05-22',
   'Pokemon TCG Chaos Rising Booster Box. Q2 2026 mainline set. 36 packs of 10 cards.',
   null, '#dc2626', '#0f172a', false,
   '2026-pokemon-tcg-chaos-rising', 'booster-box'),
  ('2026-pokemon-tcg-chaos-rising-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Chaos Rising',
   'Elite Trainer Box', '2026-05-22',
   'Pokemon TCG Chaos Rising Elite Trainer Box. 9 packs + accessories.',
   null, '#dc2626', '#0f172a', false,
   '2026-pokemon-tcg-chaos-rising', 'elite-trainer-box'),
  ('2026-pokemon-tcg-chaos-rising-booster-bundle', 2026, 'Pokemon', 'Pokemon', 'Chaos Rising',
   'Booster Bundle', '2026-05-22',
   'Pokemon TCG Chaos Rising Booster Bundle. 6 packs.',
   null, '#dc2626', '#0f172a', false,
   '2026-pokemon-tcg-chaos-rising', 'booster-bundle'),

  -- Storm Emerald (Aug/Sept 2026 — using Sept 4 as best estimate)
  ('2026-pokemon-tcg-storm-emerald-booster-box', 2026, 'Pokemon', 'Pokemon', 'Storm Emerald',
   'Booster Box', '2026-09-04',
   'Pokemon TCG Storm Emerald Booster Box. Late-summer 2026 mainline. 36 packs of 10 cards. Date is a placeholder — will refine when officially announced.',
   null, '#16a34a', '#0f172a', false,
   '2026-pokemon-tcg-storm-emerald', 'booster-box'),
  ('2026-pokemon-tcg-storm-emerald-elite-trainer-box', 2026, 'Pokemon', 'Pokemon', 'Storm Emerald',
   'Elite Trainer Box', '2026-09-04',
   'Pokemon TCG Storm Emerald Elite Trainer Box. 9 packs + accessories.',
   null, '#16a34a', '#0f172a', false,
   '2026-pokemon-tcg-storm-emerald', 'elite-trainer-box'),
  ('2026-pokemon-tcg-storm-emerald-booster-bundle', 2026, 'Pokemon', 'Pokemon', 'Storm Emerald',
   'Booster Bundle', '2026-09-04',
   'Pokemon TCG Storm Emerald Booster Bundle. 6 packs.',
   null, '#16a34a', '#0f172a', false,
   '2026-pokemon-tcg-storm-emerald', 'booster-bundle')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;
