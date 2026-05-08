-- 0045_hide_all_panini_prizm_2025_26_nba.sql
-- Defensive sweep: hide ANY 2025-26 Panini Prizm NBA SKU regardless of
-- variant. Migration 0039 hid the hobby-case row by exact slug, but
-- the user reports still seeing 2025-26 Prizm NBA on the live catalog.
-- Possible causes:
--   - 0039 wasn't actually run on the live DB
--   - There's a hobby-box / mega / blaster / FOTL / monopoly Prizm row
--     in Supabase that wasn't in our migrations (manual insert,
--     orphaned seed data, etc.)
--
-- This update flips is_published to false for every row matching
-- the brand+sport+year+set combination. It's a no-op if 0039 already
-- handled the case. Idempotent, safe to re-run.
--
-- Reminder: Panini lost the NBA license effective Oct 1, 2025. The
-- 2024-25 Prizm Basketball was their final NBA-licensed Prizm release.
-- Any 2025-26 Panini Prizm NBA SKU is fabricated and should not be
-- visible on the public catalog.

update skus
  set is_published = false,
      description = '⚠ Panini lost the NBA license after 2024-25 — 2025-26 Panini Prizm NBA does not exist as a licensed product. Hidden from catalog. (Migration 0045)'
  where brand = 'Panini'
    and sport = 'NBA'
    and year = 2025
    and set_name = 'Prizm';
