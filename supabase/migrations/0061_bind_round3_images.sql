-- 0061_bind_round3_images.sql
-- Bind 17 verified-real product photos sourced from Diamondcards
-- Online for SKUs added in migration 0056 (calendar buildout) +
-- 0060 (2026 MLB remaining). All visually spot-checked before
-- binding — confirmed correct year, brand, and product.
--
-- 2026 MLB flagships (5):
--   - Topps Series 1 (75 years anniversary cover, S1 hobby box)
--   - Topps Heritage 2026
--   - Bowman flagship
--   - Panini Donruss
--   - Topps Chrome Black
--
-- 2025 MLB premium (3):
--   - Museum Collection
--   - Gilded Collection
--   - Archives
--
-- 2025-26 NBA Topps in-season (3):
--   - Holiday Basketball Mega
--   - Midnight (space-themed minimalist)
--   - Three (basketball-court themed, "4 Cards Per Box")
--
-- 2025 NFL Panini premium (6):
--   - Score (Jordan Love cover, "200 cards / 4 autographs")
--   - Luminance
--   - Origins
--   - Black
--   - Impeccable (gold/purple premium)
--   - Absolute

update skus set image_url = '/products/2026-topps-series-1-baseball-hobby-box.jpg'
  where slug = '2026-topps-series-1-baseball-hobby-box';
update skus set image_url = '/products/2026-topps-heritage-baseball-hobby-box.jpg'
  where slug = '2026-topps-heritage-baseball-hobby-box';
update skus set image_url = '/products/2026-bowman-baseball-hobby-box.jpg'
  where slug = '2026-bowman-baseball-hobby-box';
update skus set image_url = '/products/2026-panini-donruss-baseball-hobby-box.jpg'
  where slug = '2026-panini-donruss-baseball-hobby-box';
update skus set image_url = '/products/2026-topps-chrome-black-baseball-hobby-box.jpg'
  where slug = '2026-topps-chrome-black-baseball-hobby-box';

update skus set image_url = '/products/2025-topps-museum-collection-baseball-hobby-box.jpg'
  where slug = '2025-topps-museum-collection-baseball-hobby-box';
update skus set image_url = '/products/2025-topps-gilded-collection-baseball-hobby-box.jpg'
  where slug = '2025-topps-gilded-collection-baseball-hobby-box';
update skus set image_url = '/products/2025-topps-archives-baseball-hobby-box.jpg'
  where slug = '2025-topps-archives-baseball-hobby-box';

update skus set image_url = '/products/2025-26-topps-holiday-basketball-mega-box.jpg'
  where slug = '2025-26-topps-holiday-basketball-mega-box';
update skus set image_url = '/products/2025-26-topps-midnight-basketball-hobby-box.jpg'
  where slug = '2025-26-topps-midnight-basketball-hobby-box';
update skus set image_url = '/products/2025-26-topps-three-basketball-hobby-box.jpg'
  where slug = '2025-26-topps-three-basketball-hobby-box';

update skus set image_url = '/products/2025-panini-score-football-hobby-box.jpg'
  where slug = '2025-panini-score-football-hobby-box';
update skus set image_url = '/products/2025-panini-luminance-football-hobby-box.jpg'
  where slug = '2025-panini-luminance-football-hobby-box';
update skus set image_url = '/products/2025-panini-origins-football-hobby-box.jpg'
  where slug = '2025-panini-origins-football-hobby-box';
update skus set image_url = '/products/2025-panini-black-football-hobby-box.jpg'
  where slug = '2025-panini-black-football-hobby-box';
update skus set image_url = '/products/2025-panini-impeccable-football-hobby-box.jpg'
  where slug = '2025-panini-impeccable-football-hobby-box';
update skus set image_url = '/products/2025-panini-absolute-football-hobby-box.jpg'
  where slug = '2025-panini-absolute-football-hobby-box';
