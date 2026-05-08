-- 0053_hide_prizm_nba_aggressive.sql
-- More aggressive sweep to hide every 2025-26 Panini Prizm NBA row.
-- Migration 0039 + 0045 should have caught this, but the user reports
-- /product/2025-26-panini-prizm-basketball still resolves on production.
-- Possible causes:
--   - 0045 didn't run on the live DB
--   - A row was added directly via the admin catalog UI after 0045
--   - A variant we didn't anticipate (mega, fotl, monopoly, blaster…)
--     slipped through the brand+sport+year+set match
--
-- Belt-and-suspenders: hide by slug prefix AND by field combination.
-- A row that matches either condition gets is_published=false.
--
-- Reminder: Panini lost the NBA license effective Oct 1, 2025. The
-- 2024-25 Prizm Basketball was their final NBA-licensed Prizm release.
-- Any 2025-26 Panini Prizm NBA SKU is fabricated and should not be
-- visible on the public catalog.

update skus
  set is_published = false,
      description = '⚠ Panini lost the NBA license after 2024-25 — 2025-26 Panini Prizm NBA does not exist as a licensed product. Hidden from catalog.'
  where slug like '2025-26-panini-prizm-basketball%'
     or (
       brand = 'Panini'
       and sport = 'NBA'
       and year = 2025
       and set_name ilike '%prizm%'
     );
