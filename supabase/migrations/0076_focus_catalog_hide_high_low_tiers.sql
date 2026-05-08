-- 0076_focus_catalog_hide_high_low_tiers.sql
--
-- Narrows the live catalog to flagship mid-tier product lines so cold-
-- start liquidity concentrates on the SKUs that actually trade. Cuts
-- the ultra-premium "hits" boxes (National Treasures, Flawless,
-- Immaculate, Definitive, etc. — buyers are too few, variance per box
-- too high to anchor a market) AND the retail-only / blaster-tier
-- products (Score, Phoenix, Heritage, Hoops, Tim Hortons, etc. — no
-- real secondary market, just retail markup noise).
--
-- For 2025 NFL specifically: only Topps Chrome and Donruss Optic stay
-- live. Topps takes over the NFL license in 2026, so 2025 is a
-- transition year — concentrate on the two products buyers will
-- actually search for.
--
-- All cuts are is_published=false (reversible) — NOT deletes. Any SKU
-- can be flipped back live with a single update. The catalog rows
-- stay around so admin can still find them, listings referencing them
-- continue to resolve, and SEO/old-URL handlers don't 404.
--
-- Re-runnable: only touches rows that match the patterns. Idempotent.

begin;

-- ---------------------------------------------------------------------
-- HIGH-END (premium hits-driven products — cut)
-- ---------------------------------------------------------------------
update skus set is_published = false
where is_published = true
  and (
       -- Panini ultra-premium
       slug like '%-national-treasures-%'
    or slug like '%-flawless-%'
    or slug like '%-immaculate-%'
    or slug like '%-spectra-%'
    or slug like '%-panini-one-football-%'
    or slug like '%-honors-football-%'
    or slug like '%-impeccable-%'
    or slug like '%-origins-football-%'
    or slug like '%-panini-black-football-%'
    or slug like '%-photogenic-%'
    or slug like '%-luminance-%'
    or slug like '%-panini-obsidian-%'
    or slug like '%-panini-noir-%'
    or slug like '%-court-kings-%'
    or slug like '%-panini-absolute-football-%'
    or slug like '%-signature-series-basketball-%'
       -- Topps ultra-premium
    or slug like '%-topps-definitive-%'
    or slug like '%-five-star-%'
    or slug like '%-topps-pristine-%'
    or slug like '%-topps-sterling-%'
    or slug like '%-bowman-sterling-%'
    or slug like '%-topps-tribute-%'
    or slug like '%-topps-tier-one-%'
    or slug like '%-museum-collection-%'
    or slug like '%-gilded-collection-%'
    or slug like '%-topps-transcendent-%'
    or slug like '%-topps-inception-%'
    or slug like '%-signature-class-%'
    or slug like '%-bowman-best-%'
    or slug like '%-midnight-basketball-%'
    or slug like '%-topps-three-basketball-%'
    or slug like '%-cosmic-chrome-%'
    or slug like '%-chrome-sapphire-edition-%'
       -- Upper Deck ultra-premium
    or slug like '%-the-cup-%'
    or slug like '%-sp-authentic-%'
    or slug like '%-sp-game-used-%'
    or slug like '%-ultimate-collection-%'
    or slug like '%-upper-deck-premier-%'
    or slug like '%-upper-deck-trilogy-%'
    or slug like '%-black-diamond-%'
    or slug like '%-upper-deck-allure-%'
    or slug like '%-upper-deck-credentials-%'
    or slug like '%-upper-deck-spx-%'
  );

-- ---------------------------------------------------------------------
-- LOW-END (retail / cheap-tier — cut)
-- ---------------------------------------------------------------------
update skus set is_published = false
where is_published = true
  and (
       slug like '%-score-football-%'
    or slug like '%-panini-phoenix-%'
    or slug like '%-panini-certified-%'
    or slug like '%-topps-holiday-%'
    or slug like '%-topps-heritage-%'
    or slug like '%-topps-archives-baseball-%'
    or slug like '%-allen-and-ginter-%'
    or slug like '%-topps-stadium-club-baseball-%'
    or slug like '%-stadium-club-chrome-%'
    or slug like '%-panini-hoops-%'
    or slug like '%-tim-hortons-%'
    or slug like '%-upper-deck-mvp-%'
    or slug like '%-upper-deck-chl-%'
    or slug like '%-o-pee-chee-platinum-%'
    or slug like '%-upper-deck-artifacts-%'
    or slug like '%-upper-deck-synergy-%'
    or slug like '%-upper-deck-ice-hockey-%'
    or slug like '%-upper-deck-extended-series-%'
    or slug like '%-mcdonalds-all-american-%'
  );

-- ---------------------------------------------------------------------
-- 2025 NFL FOCUS: keep ONLY Topps Chrome Football and Donruss Optic
-- Football. Hide every other 2025 NFL SKU regardless of tier.
-- ---------------------------------------------------------------------
update skus set is_published = false
where is_published = true
  and slug like '2025-%-football-%'
  and slug not like '2025-topps-chrome-football-%'
  and slug not like '2025-panini-donruss-optic-football-%';

commit;

-- ---------------------------------------------------------------------
-- Sanity check (run manually, not part of the migration):
--
--   select count(*) filter (where is_published) as live,
--          count(*) filter (where not is_published) as hidden
--   from skus;
--
--   -- 2025 NFL audit
--   select slug, is_published from skus
--   where slug like '2025-%-football-%'
--   order by slug;
-- ---------------------------------------------------------------------
