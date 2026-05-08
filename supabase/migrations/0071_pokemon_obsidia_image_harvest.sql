-- 0071_pokemon_obsidia_image_harvest.sql
-- Image harvest from obsidia-tcg.store + walmart + Pokemon.com CDN.
-- 8 verified Pokemon product photos bound for the older
-- 2024 + 2025 sets we had only gradient fallbacks on.
--
-- Bound images:
--   2024 sets:
--     - Stellar Crown ETB (Terapagos cover)
--     - Surging Sparks ETB (Pikachu with crown)
--     - Twilight Masquerade ETB
--   2025 sets:
--     - Journey Together Booster Box (Iono / Zoroark cover)
--     - Journey Together ETB (Lillie + Zoroark)
--     - Black Bolt ETB
--     - White Flare ETB
--     - Phantasmal Flames Booster Box

update skus set image_url = '/products/2024-pokemon-tcg-stellar-crown-elite-trainer-box.jpg'
  where slug = '2024-pokemon-tcg-stellar-crown-elite-trainer-box';

update skus set image_url = '/products/2024-pokemon-tcg-surging-sparks-elite-trainer-box.jpg'
  where slug = '2024-pokemon-tcg-surging-sparks-elite-trainer-box';

update skus set image_url = '/products/2024-pokemon-tcg-twilight-masquerade-elite-trainer-box.jpg'
  where slug = '2024-pokemon-tcg-twilight-masquerade-elite-trainer-box';

update skus set image_url = '/products/2025-pokemon-tcg-journey-together-booster-box.jpg'
  where slug = '2025-pokemon-tcg-journey-together-booster-box';

update skus set image_url = '/products/2025-pokemon-tcg-journey-together-elite-trainer-box.jpg'
  where slug = '2025-pokemon-tcg-journey-together-elite-trainer-box';

update skus set image_url = '/products/2025-pokemon-tcg-black-bolt-elite-trainer-box.jpg'
  where slug = '2025-pokemon-tcg-black-bolt-elite-trainer-box';

update skus set image_url = '/products/2025-pokemon-tcg-white-flare-elite-trainer-box.png'
  where slug = '2025-pokemon-tcg-white-flare-elite-trainer-box';

update skus set image_url = '/products/2025-pokemon-tcg-phantasmal-flames-booster-box.png'
  where slug = '2025-pokemon-tcg-phantasmal-flames-booster-box';
