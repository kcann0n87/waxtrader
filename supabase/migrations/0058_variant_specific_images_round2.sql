-- 0058_variant_specific_images_round2.sql
-- Round 2 of variant-specific image binding. 5 more verified-unique
-- variant photos sourced from Diamondcards Online:
--
--   - 2025 Topps Series 1 MLB Hobby Jumbo (Aaron Judge cover, "1 Auto
--     + 2 Relics" — distinct from Series 1 hobby's Aaron Judge cover
--     with different "1 Auto/Relic" callout)
--   - 2025 Topps Series 2 MLB Hobby Jumbo (Shohei Ohtani Dodgers
--     cover, jumbo packs visible)
--   - 2025 Bowman MLB Hobby Jumbo (Charlie Condon + James Wood cover,
--     "3 Autographs Per Box" — vs hobby's 1)
--   - 2025 Topps Chrome MLB Hobby Jumbo (Yoshinobu Yamamoto pitching,
--     chrome jumbo packs visible)
--   - 2025 Topps Stadium Club MLB Blaster (Freddie Freeman cover,
--     "4 Exclusive Base Lime Green Parallels Per Box")
--
-- All verified visually before binding. Each image clearly shows a
-- different size/format than its hobby-box sibling.

update skus set image_url = '/products/2025-topps-series-1-baseball-jumbo-box.jpg'
  where slug = '2025-topps-series-1-baseball-jumbo-box';

update skus set image_url = '/products/2025-topps-series-2-baseball-jumbo-box.jpg'
  where slug = '2025-topps-series-2-baseball-jumbo-box';

update skus set image_url = '/products/2025-bowman-baseball-jumbo-box.jpg'
  where slug = '2025-bowman-baseball-jumbo-box';

update skus set image_url = '/products/2025-topps-chrome-baseball-jumbo-box.jpg'
  where slug = '2025-topps-chrome-baseball-jumbo-box';

update skus set image_url = '/products/2025-topps-stadium-club-baseball-blaster-box.jpg'
  where slug = '2025-topps-stadium-club-baseball-blaster-box';
