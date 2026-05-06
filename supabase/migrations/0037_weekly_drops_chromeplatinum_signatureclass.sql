-- 0037_weekly_drops_chromeplatinum_signatureclass.sql
-- Adds two products that opened presale on 2026-05-05 and ship 2026-06-05:
--   - 2025 Topps Chrome Platinum Baseball (Hobby Box + Hobby Case)
--   - 2025 Topps Signature Class Football (Hobby Box + Hobby Case)
--
-- Both confirmed via Beckett + Topps Store. Hobby configs:
--   Chrome Platinum BB: 20 packs / 4 cards per pack / 1 auto per box.
--                       Reimagines the 1955 Chrome design — 500-card base
--                       with City Variations + 1955 World Series inserts.
--   Signature Class FB: 8 packs / 4 cards per pack / 2 autos per box.
--                       250-card base, 150 rookies in Paper and Chrome
--                       with full color parallel rainbow.
--
-- Cases reuse the box image (admin can swap to a real case render later)
-- and follow the same slug pattern (-box → -case) the auto-case backfill
-- in 0020 used. Idempotent — ON CONFLICT (slug) DO NOTHING.

insert into skus (
  slug, year, brand, sport, set_name, product, release_date,
  description, image_url, gradient_from, gradient_to, is_published
)
values
  -- 2025 Topps Chrome Platinum Baseball — hobby box + case
  ('2025-topps-chrome-platinum-baseball-hobby-box', 2025, 'Topps', 'MLB', 'Chrome Platinum', 'Hobby Box', '2026-06-05',
    '2025 Topps Chrome Platinum Baseball Hobby Box. Reimagines the iconic 1955 Chrome design with a 500-card base set, City Variations, 1955 World Series inserts, and Cards That Never Were. 20 packs per box, 4 cards per pack, 1 autograph per box.',
    null, '#0c4a6e', '#fbbf24', true),

  ('2025-topps-chrome-platinum-baseball-hobby-case', 2025, 'Topps', 'MLB', 'Chrome Platinum', 'Hobby Case', '2026-06-05',
    '2025 Topps Chrome Platinum Baseball Hobby Case. Sealed case of 12 hobby boxes.',
    null, '#0c4a6e', '#fbbf24', true),

  -- 2025 Topps Signature Class Football — hobby box + case
  ('2025-topps-signature-class-football-hobby-box', 2025, 'Topps', 'NFL', 'Signature Class', 'Hobby Box', '2026-06-05',
    '2025 Topps Signature Class Football Hobby Box. Autograph-driven with 2 on-card autos per box. 250-card base + 150 rookies in Paper and Chrome with the full color-parallel rainbow. 8 packs per box, 4 cards per pack.',
    null, '#1c1917', '#facc15', true),

  ('2025-topps-signature-class-football-hobby-case', 2025, 'Topps', 'NFL', 'Signature Class', 'Hobby Case', '2026-06-05',
    '2025 Topps Signature Class Football Hobby Case. Sealed case of 8 hobby boxes.',
    null, '#1c1917', '#facc15', true)

on conflict (slug) do nothing;
