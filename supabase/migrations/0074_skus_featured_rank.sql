-- 0074_skus_featured_rank.sql
-- Adds a featured_rank column to skus so admins can manually pin
-- products to the top of the homepage rail. Lower numbers sort
-- earlier; null means unranked (sorts last, falls back to existing
-- release-date / heat-score logic).
--
-- Use case: admin wants "Ascended Heroes" at position 1, "Perfect
-- Order" at 2, regardless of release date. Set featured_rank=1 and
-- featured_rank=2 respectively, leave everything else null.

alter table skus
  add column if not exists featured_rank smallint;

comment on column skus.featured_rank is
  'Manual sort priority for homepage rails. Lower = higher up. Null = use default ordering.';

-- Index helps the homepage query when many SKUs are present and only
-- a handful are ranked.
create index if not exists skus_featured_rank_idx
  on skus (featured_rank)
  where featured_rank is not null;
