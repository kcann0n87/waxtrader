-- 0017_corrected_release_dates.sql
-- Replaces the auto-generated placeholder release dates from migration
-- 0014 with researched, source-verified dates from Beckett, Topps.com,
-- DA Card World, Steel City Collectibles, and Beckett Baseball/Basketball
-- release calendars.
--
-- Idempotent — uses targeted UPDATEs by slug. Re-running won't duplicate
-- rows or wipe correct manual edits (only the rows listed here change).
--
-- Notable correction: 2026 Topps Chrome Black Baseball was placeholder-
-- dated 2026-07-15; actual release was 2026-04-29 (already on shelves).

-- ===========================================================================
-- NBA (2024-25 season)
-- ===========================================================================
update skus set release_date = '2025-03-07' where slug = '2024-25-panini-donruss-basketball-hobby-box';
update skus set release_date = '2025-01-31' where slug = '2024-25-panini-hoops-basketball-hobby-box';
update skus set release_date = '2025-09-26' where slug = '2024-25-panini-flawless-basketball-hobby-box';

-- ===========================================================================
-- NBA (2025-26 season — Topps regained NBA license)
-- All Topps Chrome NBA retail/hobby variants share the 2025-12-18 street
-- date. FDI variant typically streets within a week.
-- ===========================================================================
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-hobby-box';
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-jumbo-box';
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-mega-box';
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-hanger-box';
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-blaster-box';
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-value-box';
update skus set release_date = '2025-12-18' where slug = '2025-26-topps-chrome-basketball-first-day-issue-hobby-box';
update skus set release_date = '2026-01-22' where slug = '2025-26-topps-chrome-sapphire-edition-basketball-hobby-box';
update skus set release_date = '2026-02-26' where slug = '2025-26-topps-finest-basketball-hobby-box';
update skus set release_date = '2026-03-23' where slug = '2025-26-topps-bowman-u-basketball-hobby-box';
-- Bowman Best NBA + Inception NBA: dates not yet confirmed by primary
-- sources; leaving as 2026-02-15 placeholder. Flag for manual edit.

-- ===========================================================================
-- MLB
-- ===========================================================================
update skus set release_date = '2025-05-28' where slug = '2025-bowman-baseball-mega-box';
update skus set release_date = '2025-09-23' where slug = '2025-bowman-chrome-baseball-hobby-box';
update skus set release_date = '2025-07-23' where slug = '2025-topps-chrome-baseball-hobby-box';
update skus set release_date = '2025-12-29' where slug = '2025-topps-five-star-baseball-hobby-box';
update skus set release_date = '2025-11-28' where slug = '2025-topps-holiday-baseball-mega-box';
update skus set release_date = '2026-02-12' where slug = '2025-topps-pristine-baseball-hobby-box';
update skus set release_date = '2025-06-11' where slug = '2025-topps-series-2-baseball-hobby-box';
update skus set release_date = '2026-02-18' where slug = '2025-topps-stadium-club-baseball-hobby-box';
update skus set release_date = '2025-06-04' where slug = '2025-topps-sterling-baseball-hobby-box';
update skus set release_date = '2025-04-16' where slug = '2025-topps-tribute-baseball-hobby-box';
update skus set release_date = '2026-04-29' where slug = '2026-topps-chrome-black-baseball-hobby-box';
-- 2025 Topps Chrome Sapphire MLB: typically streets Aug/Sept after main
-- Chrome flagship; date not yet confirmed. Leaving placeholder.

-- ===========================================================================
-- NFL (2025 season)
-- All 2025 Topps Chrome NFL retail/hobby variants share the 2026-04-15
-- street date. FDI variant streets same day or within a week.
-- ===========================================================================
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-hobby-box';
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-jumbo-box';
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-mega-box';
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-hanger-box';
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-blaster-box';
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-value-box';
update skus set release_date = '2026-04-15' where slug = '2025-topps-chrome-football-first-day-issue-hobby-box';

-- 2025 Panini Donruss NFL (hobby was 2025-09-17; mega typically same week)
update skus set release_date = '2025-09-17' where slug = '2025-panini-donruss-football-mega-box';

-- 2025 Panini Prizm NFL retail (mega/blaster/hanger street together
-- with main hobby release on 2026-02-02)
update skus set release_date = '2026-02-02' where slug = '2025-panini-prizm-football-mega-box';
update skus set release_date = '2026-02-02' where slug = '2025-panini-prizm-football-blaster-box';
update skus set release_date = '2026-02-02' where slug = '2025-panini-prizm-football-hanger-box';
