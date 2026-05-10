-- 0069_bind_pokemon_top_product_images.sql
-- Bind real product photos for the two top Pokemon products:
--
--   - Ascended Heroes ETB (Mega Dragonite cover, comic-book style)
--   - Ascended Heroes Booster Bundle (Mega Dragonite + Charizard +
--     Mewtwo + Pikachu + Lucario + Ho-Oh hero cast)
--   - Prismatic Evolutions ETB (Eevee + gem theme)
--   - Prismatic Evolutions Booster Bundle (Eevee + Eeveelutions)
--
-- All sourced from Pokemon.com / PokeBeach / Walmart official photos —
-- visually verified before binding.

update skus set image_url = '/products/2026-pokemon-tcg-ascended-heroes-elite-trainer-box.jpg'
  where slug = '2026-pokemon-tcg-ascended-heroes-elite-trainer-box';

update skus set image_url = '/products/2026-pokemon-tcg-ascended-heroes-booster-bundle.jpg'
  where slug = '2026-pokemon-tcg-ascended-heroes-booster-bundle';

update skus set image_url = '/products/2025-pokemon-tcg-prismatic-evolutions-elite-trainer-box.jpg'
  where slug = '2025-pokemon-tcg-prismatic-evolutions-elite-trainer-box';

update skus set image_url = '/products/2025-pokemon-tcg-prismatic-evolutions-booster-bundle.jpg'
  where slug = '2025-pokemon-tcg-prismatic-evolutions-booster-bundle';
