-- 0034_upcoming_releases_per_beckett.sql
-- Adds 20 net-new SKUs identified by scraping Beckett's release calendar
-- for upcoming May-October 2026 releases that weren't yet in the
-- catalog. User pointed at the calendar as the canonical source:
-- https://www.beckett.com/news/sports-card-release-calendar-dates/
--
-- Heavy on Panini soccer Road-to-FIFA-World-Cup products (the WC '26 in
-- US/Canada/Mexico drives demand), Panini's NBA Donruss/Noir/Signature
-- Series suite for the new season, and Upper Deck NHL Extended/SPx/CHL/
-- Team USA Juniors variants we didn't have.
--
-- All published — these are confirmed Beckett-listed dates, not estimates.
-- Image URLs null until admin uploads.
-- Idempotent: ON CONFLICT (slug) DO NOTHING.

insert into skus (
  slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published
)
values
  -- =====================================================================
  -- NHL — 5 net-new
  -- =====================================================================

  ('2025-26-upper-deck-spx-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'SPx', 'Hobby Box', '2026-05-06',
    '2025-26 Upper Deck SPx Hockey Hobby Box. Holographic SPx parallels, premium rookie autos.',
    null, '#1e3a8a', '#7c3aed', true),

  ('2025-26-upper-deck-sp-game-used-chl-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'SP Game Used CHL', 'Hobby Box', '2026-06-10',
    '2025-26 Upper Deck SP Game Used CHL Hockey Hobby Box. Junior-league premium autos and game-used memorabilia from the Canadian Hockey League.',
    null, '#1f2937', '#facc15', true),

  ('2025-26-upper-deck-extended-series-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'Extended Series', 'Hobby Box', '2026-06-24',
    '2025-26 Upper Deck Extended Series Hockey Hobby Box. Final Young Guns rookies of the season + Canvas inserts.',
    null, '#0891b2', '#a78bfa', true),

  ('2025-26-upper-deck-chl-hockey-hobby-box', 2025, 'Upper Deck', 'NHL', 'CHL', 'Hobby Box', '2026-06-26',
    '2025-26 Upper Deck CHL Hockey Hobby Box. Canadian Hockey League prospects — pre-NHL look at the next generation.',
    null, '#dc2626', '#facc15', true),

  ('2026-upper-deck-team-usa-juniors-hockey-hobby-box', 2026, 'Upper Deck', 'NHL', 'Team USA Juniors', 'Hobby Box', '2026-09-30',
    '2026 Upper Deck Team USA Juniors Hockey Hobby Box. World Junior Championship roster, US-team focus.',
    null, '#1e40af', '#dc2626', true),

  -- =====================================================================
  -- Soccer — 8 net-new (Road to FIFA WC heavy)
  -- =====================================================================

  ('2025-26-topps-chrome-uefa-club-competitions-2-soccer-hobby-box', 2025, 'Topps', 'Soccer', 'Chrome UEFA Club Competitions', 'Hobby Box', '2026-05-07',
    '2025-26 Topps Chrome UEFA Club Competitions Hobby Box. Champions League / Europa League / Conference League. 18 packs per box, 1 auto + Refractor parallels.',
    null, '#0ea5e9', '#1e3a8a', true),

  ('2025-26-panini-prizm-fifa-soccer-hobby-box', 2025, 'Panini', 'Soccer', 'Prizm FIFA', 'Hobby Box', '2026-05-08',
    '2025-26 Panini Prizm FIFA Soccer Hobby Box. International soccer product covering FIFA-licensed national teams.',
    null, '#1e40af', '#a855f7', true),

  ('2025-26-panini-noir-road-to-fifa-world-cup-soccer-hobby-box', 2025, 'Panini', 'Soccer', 'Noir Road to FIFA World Cup', 'Hobby Box', '2026-05-13',
    '2025-26 Panini Noir Road to FIFA World Cup Hobby Box. Black-and-white photography premium product leading into the Summer 2026 World Cup.',
    null, '#0f172a', '#facc15', true),

  ('2025-26-panini-select-road-to-fifa-world-cup-soccer-hobby-box', 2025, 'Panini', 'Soccer', 'Select Road to FIFA World Cup', 'Hobby Box', '2026-05-22',
    '2025-26 Panini Select Road to FIFA World Cup Hobby Box. Concourse, Premier, Field Level tiers.',
    null, '#dc2626', '#1e3a8a', true),

  ('2026-topps-merlin-premier-league-soccer-hobby-box', 2026, 'Topps', 'Soccer', 'Merlin Premier League', 'Hobby Box', '2026-05-28',
    '2026 Topps Merlin Premier League Hobby Box. Throwback to the iconic 1990s Merlin Premier League sticker albums, modernized with chrome inserts and autos.',
    null, '#7c3aed', '#facc15', true),

  ('2025-26-panini-national-treasures-road-to-fifa-world-cup-soccer-hobby-box', 2025, 'Panini', 'Soccer', 'National Treasures Road to FIFA World Cup', 'Hobby Box', '2026-06-03',
    '2025-26 Panini National Treasures Road to FIFA World Cup Hobby Box. Ultra-premium with patch autos and 1/1s leading into the Summer 2026 World Cup.',
    null, '#171717', '#a16207', true),

  ('2026-panini-prizm-fifa-world-cup-soccer-hobby-box', 2026, 'Panini', 'Soccer', 'Prizm FIFA World Cup', 'Hobby Box', '2026-06-05',
    '2026 Panini Prizm FIFA World Cup Hobby Box. THE World Cup release. USA/Canada/Mexico co-hosted tournament. Will be one of the most-traded soccer products of the decade.',
    null, '#1e40af', '#a855f7', true),

  ('2025-26-panini-obsidian-soccer-hobby-box', 2025, 'Panini', 'Soccer', 'Obsidian', 'Hobby Box', '2026-06-17',
    '2025-26 Panini Obsidian Soccer Hobby Box. Black-acetate base cards, premium rookie autos.',
    null, '#0f172a', '#a855f7', true),

  -- =====================================================================
  -- NBA — 4 net-new
  -- =====================================================================

  ('2025-26-panini-donruss-basketball-hobby-box', 2025, 'Panini', 'NBA', 'Donruss', 'Hobby Box', '2026-05-13',
    '2025-26 Panini Donruss Basketball Hobby Box. Rated Rookies, Press Proof parallels. 24 packs per box.',
    null, '#9a3412', '#fbbf24', true),

  ('2025-26-panini-signature-series-basketball-hobby-box', 2025, 'Panini', 'NBA', 'Signature Series', 'Hobby Box', '2026-05-27',
    '2025-26 Panini Signature Series Basketball Hobby Box. On-card autograph-heavy product, every box is auto-driven.',
    null, '#1c1917', '#facc15', true),

  ('2025-26-topps-signature-class-basketball-hobby-box', 2025, 'Topps', 'NBA', 'Signature Class', 'Hobby Box', '2026-05-28',
    '2025-26 Topps Signature Class Basketball Hobby Box. Topps premier on-card auto product since regaining the NBA license.',
    null, '#0c4a6e', '#facc15', true),

  ('2025-26-panini-noir-basketball-hobby-box', 2025, 'Panini', 'NBA', 'Noir', 'Hobby Box', '2026-06-10',
    '2025-26 Panini Noir Basketball Hobby Box. Black-and-white photography on premium acetate, rookie patch autos.',
    null, '#0f172a', '#facc15', true),

  -- =====================================================================
  -- NFL — 1 net-new (Topps Finest is brand-new for NFL — Topps just got the license)
  -- =====================================================================

  ('2025-topps-finest-football-hobby-box', 2025, 'Topps', 'NFL', 'Finest', 'Hobby Box', '2026-05-15',
    '2025 Topps Finest Football Hobby Box. Topps premium chrome NFL release. Cam Ward, Travis Hunter, Ashton Jeanty rookie chase. 2 mini boxes per master, 2 autos per master.',
    null, '#1e3a8a', '#fbbf24', true),

  -- =====================================================================
  -- MLB — 2 net-new (Panini Donruss baseball — Panini still has unlicensed MLB-player products)
  -- =====================================================================

  ('2026-panini-donruss-baseball-hobby-box', 2026, 'Panini', 'MLB', 'Donruss', 'Hobby Box', '2026-05-27',
    '2026 Panini Donruss Baseball Hobby Box. Rated Rookies, Press Proof parallels. Players appear in airbrushed uniforms (Panini lacks MLB team logo license).',
    null, '#9a3412', '#fbbf24', true),

  ('2026-panini-donruss-elite-baseball-hobby-box', 2026, 'Panini', 'MLB', 'Donruss Elite', 'Hobby Box', '2026-06-17',
    '2026 Panini Donruss Elite Baseball Hobby Box. Premium parallel-heavy version of Donruss baseball.',
    null, '#1e1b4b', '#facc15', true)

on conflict (slug) do nothing;
