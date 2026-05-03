-- 0022_skus_is_published.sql
-- Adds a publish toggle on the skus table so admins can stage SKUs in
-- the catalog (e.g. 5 years of historical product) without exposing them
-- to public buyers / search until they're ready.
--
-- Default true so existing 87 SKUs stay visible. Bulk-loaded historical
-- SKUs from scripts/bulk-add-historical.mjs explicitly set is_published
-- = false so they need an admin to flip the switch before going live.

alter table skus add column if not exists is_published boolean not null default true;

-- Indexed because every public-facing query will filter on it.
create index if not exists skus_is_published_idx on skus (is_published)
  where is_published = true;
