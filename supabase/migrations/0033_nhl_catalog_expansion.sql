-- 0033_nhl_catalog_expansion.sql
-- NHL catalog expansion. Pre-migration we had ~5 NHL hobby boxes — way
-- behind NBA/NFL/MLB/Soccer. Adds the most-traded Upper Deck releases
-- across 2023-24 (Connor Bedard rookie class — one of the most
-- valuable NHL cohorts ever), 2024-25 (current season), and 2025-26
-- (upcoming).
--
-- Upper Deck owns the NHL exclusive license. Their product calendar
-- includes the flagship Series 1/2 plus a deep premium ladder:
-- SP Authentic, SP, The Cup (the crown jewel), Black Diamond, Synergy,
-- Trilogy, Artifacts, Ice, Premier, Ultimate Collection. Plus the
-- O-Pee-Chee / OPC Platinum sub-brand for vintage-style chrome.
--
-- All published. image_url null until admin uploads.
-- Idempotent: ON CONFLICT (slug) DO NOTHING.

insert into skus (
  slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published
)
values
  -- =====================================================================
  -- 2023-24 NHL — CONNOR BEDARD ROOKIE CLASS
  -- The most-traded modern NHL cohort. Bedard, Carlsson, Fantilli,
  -- Cooley, Michkov rookies. Released through 2023-2024.
  -- =====================================================================

  ('2023-24-upper-deck-series-1-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Series 1', 'Hobby Box', '2023-11-15',
    '2023-24 Upper Deck Series 1 Hockey Hobby Box. Connor Bedard, Adam Fantilli, Leo Carlsson Young Guns rookies. 24 packs per box. The flagship NHL hobby release.',
    null, '#0891b2', '#1e3a8a', true),

  ('2023-24-upper-deck-series-2-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Series 2', 'Hobby Box', '2024-02-21',
    '2023-24 Upper Deck Series 2 Hockey Hobby Box. More Young Guns rookies including Brock Faber, Logan Cooley. 24 packs per box.',
    null, '#1e40af', '#0ea5e9', true),

  ('2023-24-upper-deck-sp-authentic-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'SP Authentic', 'Hobby Box', '2024-04-10',
    '2023-24 Upper Deck SP Authentic Hockey Hobby Box. Future Watch rookie autos. The hobby premier rookie chase.',
    null, '#7c2d12', '#f5d0fe', true),

  ('2023-24-upper-deck-sp-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'SP', 'Hobby Box', '2024-06-12',
    '2023-24 Upper Deck SP Hockey Hobby Box. Premium rookie autos and patches. 16 packs per box.',
    null, '#0c4a6e', '#fef08a', true),

  ('2023-24-upper-deck-sp-game-used-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'SP Game Used', 'Hobby Box', '2024-07-17',
    '2023-24 Upper Deck SP Game Used Hockey Hobby Box. Game-used memorabilia + premium autos. 4 hits per box.',
    null, '#1f2937', '#fbbf24', true),

  ('2023-24-upper-deck-the-cup-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'The Cup', 'Hobby Box', '2024-09-25',
    '2023-24 Upper Deck The Cup Hockey Hobby Box. The crown jewel — 1 pack of 6 cards, all hits. Bedard rookie chase.',
    null, '#000000', '#fbbf24', true),

  ('2023-24-upper-deck-ultimate-collection-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Ultimate Collection', 'Hobby Box', '2024-08-21',
    '2023-24 Upper Deck Ultimate Collection Hockey Hobby Box. High-end rookie autos and patches. 5 hits per box.',
    null, '#1e1b4b', '#fbbf24', true),

  ('2023-24-upper-deck-black-diamond-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Black Diamond', 'Hobby Box', '2024-05-22',
    '2023-24 Upper Deck Black Diamond Hockey Hobby Box. Diamond-cut design, premium autos and quad-diamond rookies.',
    null, '#0f172a', '#06b6d4', true),

  ('2023-24-upper-deck-synergy-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Synergy', 'Hobby Box', '2024-08-07',
    '2023-24 Upper Deck Synergy Hockey Hobby Box. Acetate inserts, on-card autos.',
    null, '#0e7490', '#1e3a8a', true),

  ('2023-24-upper-deck-trilogy-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Trilogy', 'Hobby Box', '2024-10-09',
    '2023-24 Upper Deck Trilogy Hockey Hobby Box. Three-tiered base set, Rookie Premieres autos.',
    null, '#5b21b6', '#fbbf24', true),

  ('2023-24-upper-deck-artifacts-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Artifacts', 'Hobby Box', '2024-04-24',
    '2023-24 Upper Deck Artifacts Hockey Hobby Box. Aurum, Treasured Swatches relics, on-card rookie autos.',
    null, '#7c2d12', '#a78bfa', true),

  ('2023-24-upper-deck-premier-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Premier', 'Hobby Box', '2024-12-04',
    '2023-24 Upper Deck Premier Hockey Hobby Box. 5 cards per pack, ultra-premium rookie patch autos.',
    null, '#0c4a6e', '#fbbf24', true),

  ('2023-24-upper-deck-ice-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'Ice', 'Hobby Box', '2024-07-31',
    '2023-24 Upper Deck Ice Hockey Hobby Box. Acetate base cards, Premium and Glacial rookie autos.',
    null, '#0ea5e9', '#e0f2fe', true),

  ('2023-24-o-pee-chee-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'O-Pee-Chee', 'Hobby Box', '2023-12-13',
    '2023-24 O-Pee-Chee Hockey Hobby Box. Vintage-style base set, 600 cards including 100 Marquee Rookies.',
    null, '#dc2626', '#facc15', true),

  ('2023-24-o-pee-chee-platinum-hockey-hobby-box', 2023, 'Upper Deck', 'NHL', 'O-Pee-Chee Platinum', 'Hobby Box', '2024-03-13',
    '2023-24 O-Pee-Chee Platinum Hockey Hobby Box. Chrome version of OPC, Marquee Rookie refractors. The accessible Bedard rookie chase.',
    null, '#0c4a6e', '#06b6d4', true),

  -- =====================================================================
  -- 2024-25 NHL — current season
  -- Existing rows: Series 1, Series 2 (hidden in 0023), SP Authentic,
  --                SP, The Cup. Filling the gaps.
  -- =====================================================================

  ('2024-25-upper-deck-sp-game-used-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'SP Game Used', 'Hobby Box', '2025-08-13',
    '2024-25 Upper Deck SP Game Used Hockey Hobby Box. Game-used memorabilia + premium autos.',
    null, '#1f2937', '#fbbf24', true),

  ('2024-25-upper-deck-ultimate-collection-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'Ultimate Collection', 'Hobby Box', '2025-09-17',
    '2024-25 Upper Deck Ultimate Collection Hockey Hobby Box. High-end rookie autos.',
    null, '#1e1b4b', '#fbbf24', true),

  ('2024-25-upper-deck-black-diamond-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'Black Diamond', 'Hobby Box', '2025-06-04',
    '2024-25 Upper Deck Black Diamond Hockey Hobby Box. Diamond-cut design, premium autos.',
    null, '#0f172a', '#06b6d4', true),

  ('2024-25-upper-deck-trilogy-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'Trilogy', 'Hobby Box', '2025-10-22',
    '2024-25 Upper Deck Trilogy Hockey Hobby Box. Three-tiered base set, Rookie Premieres autos.',
    null, '#5b21b6', '#fbbf24', true),

  ('2024-25-upper-deck-artifacts-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'Artifacts', 'Hobby Box', '2025-05-07',
    '2024-25 Upper Deck Artifacts Hockey Hobby Box. Aurum and Treasured Swatches relics, on-card rookie autos.',
    null, '#7c2d12', '#a78bfa', true),

  ('2024-25-upper-deck-premier-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'Premier', 'Hobby Box', '2025-12-10',
    '2024-25 Upper Deck Premier Hockey Hobby Box. 5 cards per pack, ultra-premium rookie patch autos.',
    null, '#0c4a6e', '#fbbf24', true),

  ('2024-25-upper-deck-ice-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'Ice', 'Hobby Box', '2025-07-30',
    '2024-25 Upper Deck Ice Hockey Hobby Box. Acetate base cards, Premium and Glacial rookie autos.',
    null, '#0ea5e9', '#e0f2fe', true),

  ('2024-25-o-pee-chee-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'O-Pee-Chee', 'Hobby Box', '2024-12-18',
    '2024-25 O-Pee-Chee Hockey Hobby Box. Vintage-style base set with 100 Marquee Rookies.',
    null, '#dc2626', '#facc15', true),

  ('2024-25-o-pee-chee-platinum-hockey-hobby-box', 2024, 'Upper Deck', 'NHL', 'O-Pee-Chee Platinum', 'Hobby Box', '2025-03-12',
    '2024-25 O-Pee-Chee Platinum Hockey Hobby Box. Chrome version of OPC, Marquee Rookie refractors.',
    null, '#0c4a6e', '#06b6d4', true),

  -- =====================================================================
  -- 2025-26 NHL — upcoming season (Misa Schaefer rookie class)
  -- =====================================================================

  ('2025-26-upper-deck-series-1-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'Series 1', 'Hobby Box', '2025-11-19',
    '2025-26 Upper Deck Series 1 Hockey Hobby Box. Misa Schaefer Young Guns rookie chase. 24 packs per box.',
    null, '#0891b2', '#1e3a8a', true),

  ('2025-26-upper-deck-sp-authentic-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'SP Authentic', 'Hobby Box', '2026-04-15',
    '2025-26 Upper Deck SP Authentic Hockey Hobby Box. Future Watch rookie autos. Hobby premier rookie chase.',
    null, '#7c2d12', '#f5d0fe', true),

  ('2025-26-upper-deck-the-cup-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'The Cup', 'Hobby Box', '2026-09-30',
    '2025-26 Upper Deck The Cup Hockey Hobby Box. The crown jewel — 1 pack of 6 cards, all hits.',
    null, '#000000', '#fbbf24', true)

on conflict (slug) do nothing;
