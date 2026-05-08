-- 0059_variant_specific_images_round3.sql
-- Round 3 of variant-specific image binding. 1 verified-unique
-- variant photo from StockX:
--
--   - 2025 Panini Donruss NFL Blaster Box (Patrick Mahomes Chiefs
--     cover, "90 cards per box / 15 cards per pack / 6 packs",
--     blaster-exclusive Red Hot Rookies callout)
--
-- Diminishing returns continue. Most variant URLs return 404 or 403
-- across StockX, Diamondcards, Blowout, DA Card World, and Steel
-- City — the variants either haven't shipped yet (so no real
-- product photos exist) or retailers haven't created dedicated
-- product pages and reuse the hobby-box photo for variant listings.
--
-- The variant fallback in db.ts continues to inherit the hobby-box
-- photo for unbound variants. Round 3 closes this push out at 9
-- total variant-unique images bound across rounds 1-3.

update skus set image_url = '/products/2025-panini-donruss-football-blaster-box.jpg'
  where slug = '2025-panini-donruss-football-blaster-box';
