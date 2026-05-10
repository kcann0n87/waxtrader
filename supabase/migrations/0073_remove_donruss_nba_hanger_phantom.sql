-- 0073_remove_donruss_nba_hanger_phantom.sql
-- 2025-26 Panini Donruss NBA Hanger Box doesn't exist as a real
-- product — Panini's 2025-26 Donruss NBA retail line is just Hobby
-- + Mega + Blaster (no Hanger). Hanger Box was added speculatively
-- in migration 0047 alongside the legitimate retail variants;
-- removing it now.

delete from skus
  where slug = '2025-26-panini-donruss-basketball-hanger-box';
