-- 0062_opc_image_bind.sql
-- Bind 2025-26 O-Pee-Chee NHL image. Real product photo from
-- DA Card World — Sidney Crosby Penguins cover, retro O-Pee-Chee
-- branding, "Hobby" badge clearly visible.
--
-- Other NHL products from migration 0056 (UD MVP, Tim Hortons,
-- Allure, SP Game-Used, Credentials) returned only marketing
-- infographics from public sources, not actual box photography.
-- Re-attempt those once retailers have product on shelves.

update skus set image_url = '/products/2025-26-o-pee-chee-hockey-hobby-box.jpg'
  where slug = '2025-26-o-pee-chee-hockey-hobby-box';
