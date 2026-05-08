-- 0057_variant_specific_images_round1.sql
-- Bind genuinely different variant-specific stock photos for 3 NBA
-- products. Until now, mega/blaster/case variants inherited the
-- hobby-box image via the fillVariantImageFallback helper in db.ts.
-- That works but every variant tab on the product page showed the
-- same photo. The user wanted real per-variant imagery.
--
-- This round binds 3 verified-unique photos:
--   - 2025-26 Topps Basketball Blaster Box (Cooper Flagg cover,
--     blaster size — distinct from hobby)
--   - 2025-26 Topps Bowman Basketball Blaster Box (smaller blaster
--     format, "Look for Autograph cards" callout)
--   - 2025-26 Topps Bowman Basketball Hobby Jumbo Box (open box
--     showing 12 jumbo packs, "4 Autographs Per Box")
--
-- Why so few in round 1: most retailers only carry the hobby-box
-- stock photo and reuse it across variants. Manufacturers don't
-- always release variant-specific photos. Diamondcards Online had
-- unique imagery for these 3; other variants (Donruss Mega/Blaster,
-- Hoops Mega/Blaster, etc.) returned 404 on retailer pages.
-- Future rounds as more retailer photos surface.

update skus set image_url = '/products/2025-26-topps-basketball-blaster-box.jpg'
  where slug = '2025-26-topps-basketball-blaster-box';

update skus set image_url = '/products/2025-26-topps-bowman-basketball-blaster-box.jpg'
  where slug = '2025-26-topps-bowman-basketball-blaster-box';

update skus set image_url = '/products/2025-26-topps-bowman-basketball-hobby-jumbo-box.jpg'
  where slug = '2025-26-topps-bowman-basketball-hobby-jumbo-box';
