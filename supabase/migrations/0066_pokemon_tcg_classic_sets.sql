-- 0066_pokemon_tcg_classic_sets.sql
-- Round 3 of Pokemon TCG buildout — closes the holes in our 2022-2024
-- catalog. Migration 0065 expanded variants for 2025 sets we already
-- had; this round adds entirely-missing major releases.
--
-- Missing classic sets added (2 variants each: Booster Box + ETB):
--   - 2022 Pokemon GO (Jul 1, 2022) — still actively traded for the
--     iconic Pikachu / Mewtwo / Mew lineup, mobile-app crossover
--   - 2023 Crown Zenith (Jan 20, 2023) — last major SwSh-era set
--     with Galarian Gallery secret rares. High demand for collectors
--   - 2023 Scarlet & Violet base (Mar 31, 2023) — the inaugural SV
--     set, Pikachu/Squawkabilly chase
--   - 2023 Paldea Evolved (Jun 9, 2023) — second SV set with
--     paradox/ancient Pokemon
--
-- Missing 2024 ETBs (we had Booster Box, missing the matching ETB):
--   - Temporal Forces ETB (Mar 22, 2024)
--   - Shrouded Fable ETB (Aug 2, 2024)
--   - Obsidian Flames ETB (Aug 11, 2023)
--
-- All inserts is_published=FALSE — staged on the pokemon-tcg branch.
-- Variant_group + variant_type set so they auto-collapse with each
-- set's existing booster-box row when the variants go live together.

insert into skus (slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published,
  variant_group, variant_type)
values
  -- 2022 Pokemon GO
  ('2022-pokemon-tcg-pokemon-go-booster-box', 2022, 'Pokemon', 'Pokemon', 'Pokemon GO',
   'Booster Box', '2022-07-01',
   'Pokemon TCG Pokemon GO Booster Box. Mobile-app crossover special set. Pikachu, Mewtwo, Mew radiant cards. 36 packs of 10 cards. Still actively traded — collector chase set.',
   null, '#facc15', '#16a34a', false,
   '2022-pokemon-tcg-pokemon-go', 'booster-box'),
  ('2022-pokemon-tcg-pokemon-go-elite-trainer-box', 2022, 'Pokemon', 'Pokemon', 'Pokemon GO',
   'Elite Trainer Box', '2022-07-01',
   'Pokemon TCG Pokemon GO Elite Trainer Box. Mobile-app crossover ETB with 10 packs + Pokemon GO-themed accessories.',
   null, '#facc15', '#16a34a', false,
   '2022-pokemon-tcg-pokemon-go', 'elite-trainer-box'),

  -- 2023 Crown Zenith
  ('2023-pokemon-tcg-crown-zenith-booster-box', 2023, 'Pokemon', 'Pokemon', 'Crown Zenith',
   'Booster Box', '2023-01-20',
   'Pokemon TCG Crown Zenith Booster Box. Last major SwSh-era set with Galarian Gallery secret rares. 230 cards in the set. Actively traded for the GG art cards.',
   null, '#fbbf24', '#7c3aed', false,
   '2023-pokemon-tcg-crown-zenith', 'booster-box'),
  ('2023-pokemon-tcg-crown-zenith-elite-trainer-box', 2023, 'Pokemon', 'Pokemon', 'Crown Zenith',
   'Elite Trainer Box', '2023-01-20',
   'Pokemon TCG Crown Zenith Elite Trainer Box. Special edition ETB with 10 packs + zenith-themed sleeves and accessories.',
   null, '#fbbf24', '#7c3aed', false,
   '2023-pokemon-tcg-crown-zenith', 'elite-trainer-box'),

  -- 2023 Scarlet & Violet base
  ('2023-pokemon-tcg-scarlet-and-violet-booster-box', 2023, 'Pokemon', 'Pokemon', 'Scarlet & Violet',
   'Booster Box', '2023-03-31',
   'Pokemon TCG Scarlet & Violet Base Set Booster Box. Inaugural SV-era set introducing the new card border and ex mechanic. Pikachu/Squawkabilly chase. 36 packs of 10 cards.',
   null, '#dc2626', '#7c3aed', false,
   '2023-pokemon-tcg-scarlet-and-violet', 'booster-box'),
  ('2023-pokemon-tcg-scarlet-and-violet-elite-trainer-box', 2023, 'Pokemon', 'Pokemon', 'Scarlet & Violet',
   'Elite Trainer Box', '2023-03-31',
   'Pokemon TCG Scarlet & Violet Base Set ETB. The first SV ETB. Pikachu / Koraidon / Miraidon variants.',
   null, '#dc2626', '#7c3aed', false,
   '2023-pokemon-tcg-scarlet-and-violet', 'elite-trainer-box'),

  -- 2023 Paldea Evolved
  ('2023-pokemon-tcg-paldea-evolved-booster-box', 2023, 'Pokemon', 'Pokemon', 'Paldea Evolved',
   'Booster Box', '2023-06-09',
   'Pokemon TCG Paldea Evolved Booster Box. Second SV set with paradox and ancient Pokemon. 279 cards (193 base + 86 secret rare). 36 packs of 10 cards.',
   null, '#16a34a', '#dc2626', false,
   '2023-pokemon-tcg-paldea-evolved', 'booster-box'),
  ('2023-pokemon-tcg-paldea-evolved-elite-trainer-box', 2023, 'Pokemon', 'Pokemon', 'Paldea Evolved',
   'Elite Trainer Box', '2023-06-09',
   'Pokemon TCG Paldea Evolved ETB. Paradox-themed ETB with Skeledirge / Quaquaval / Meowscarada artwork.',
   null, '#16a34a', '#dc2626', false,
   '2023-pokemon-tcg-paldea-evolved', 'elite-trainer-box'),

  -- 2023 Obsidian Flames ETB (we already have the Booster Box)
  ('2023-pokemon-tcg-obsidian-flames-elite-trainer-box', 2023, 'Pokemon', 'Pokemon', 'Obsidian Flames',
   'Elite Trainer Box', '2023-08-11',
   'Pokemon TCG Obsidian Flames Elite Trainer Box. Tera Charizard ex chase set ETB. 9 packs + sleeves + energy + accessories.',
   null, '#dc2626', '#0f172a', false,
   '2023-pokemon-tcg-obsidian-flames', 'elite-trainer-box'),

  -- 2024 Temporal Forces ETB (we have the BB)
  ('2024-pokemon-tcg-temporal-forces-elite-trainer-box', 2024, 'Pokemon', 'Pokemon', 'Temporal Forces',
   'Elite Trainer Box', '2024-03-22',
   'Pokemon TCG Temporal Forces Elite Trainer Box. Walking Wake / Iron Leaves chase ETB. 9 packs + accessories + sleeves + energy.',
   null, '#0891b2', '#0f172a', false,
   '2024-pokemon-tcg-temporal-forces', 'elite-trainer-box'),

  -- 2024 Shrouded Fable ETB (we have the BB)
  ('2024-pokemon-tcg-shrouded-fable-elite-trainer-box', 2024, 'Pokemon', 'Pokemon', 'Shrouded Fable',
   'Elite Trainer Box', '2024-08-02',
   'Pokemon TCG Shrouded Fable Elite Trainer Box. Pecharunt-themed mini-set ETB. 8 packs + sleeves + energy + accessories.',
   null, '#7c3aed', '#0f172a', false,
   '2024-pokemon-tcg-shrouded-fable', 'elite-trainer-box')
on conflict (slug) do update set
  description = excluded.description,
  release_date = excluded.release_date,
  is_published = excluded.is_published,
  variant_group = excluded.variant_group,
  variant_type = excluded.variant_type;

-- ---------------------------------------------------------------------
-- Backfill variant_group on existing 2024 + 2023 Pokemon rows so the
-- new ETBs collapse onto the canonical product page for each set
-- ---------------------------------------------------------------------
update skus set
  variant_group = '2023-pokemon-tcg-obsidian-flames',
  variant_type = 'booster-box'
  where slug = '2023-pokemon-tcg-obsidian-flames-booster-box';

update skus set
  variant_group = '2024-pokemon-tcg-temporal-forces',
  variant_type = 'booster-box'
  where slug = '2024-pokemon-tcg-temporal-forces-booster-box';

update skus set
  variant_group = '2024-pokemon-tcg-shrouded-fable',
  variant_type = 'booster-box'
  where slug = '2024-pokemon-tcg-shrouded-fable-booster-box';

-- Also backfill on the other existing 2024 rows so they're ready
-- when more variants get added later.
update skus set variant_group = '2024-pokemon-tcg-paldean-fates', variant_type = 'booster-box'
  where slug = '2024-pokemon-tcg-paldean-fates-booster-box';
update skus set variant_group = '2024-pokemon-tcg-paldean-fates', variant_type = 'elite-trainer-box'
  where slug = '2024-pokemon-tcg-paldean-fates-elite-trainer-box';
update skus set variant_group = '2024-pokemon-tcg-twilight-masquerade', variant_type = 'booster-box'
  where slug = '2024-pokemon-tcg-twilight-masquerade-booster-box';
update skus set variant_group = '2024-pokemon-tcg-twilight-masquerade', variant_type = 'elite-trainer-box'
  where slug = '2024-pokemon-tcg-twilight-masquerade-elite-trainer-box';
update skus set variant_group = '2024-pokemon-tcg-stellar-crown', variant_type = 'booster-box'
  where slug = '2024-pokemon-tcg-stellar-crown-booster-box';
update skus set variant_group = '2024-pokemon-tcg-stellar-crown', variant_type = 'elite-trainer-box'
  where slug = '2024-pokemon-tcg-stellar-crown-elite-trainer-box';
update skus set variant_group = '2024-pokemon-tcg-surging-sparks', variant_type = 'booster-box'
  where slug = '2024-pokemon-tcg-surging-sparks-booster-box';
update skus set variant_group = '2024-pokemon-tcg-surging-sparks', variant_type = 'elite-trainer-box'
  where slug = '2024-pokemon-tcg-surging-sparks-elite-trainer-box';

-- 2023 backfills
update skus set variant_group = '2023-pokemon-tcg-151', variant_type = 'booster-box'
  where slug = '2023-pokemon-tcg-151-booster-box';
update skus set variant_group = '2023-pokemon-tcg-151', variant_type = 'elite-trainer-box'
  where slug = '2023-pokemon-tcg-151-elite-trainer-box';
update skus set variant_group = '2023-pokemon-tcg-paradox-rift', variant_type = 'booster-box'
  where slug = '2023-pokemon-tcg-paradox-rift-booster-box';
update skus set variant_group = '2023-pokemon-tcg-paradox-rift', variant_type = 'elite-trainer-box'
  where slug = '2023-pokemon-tcg-paradox-rift-elite-trainer-box';
