-- 0077_skus_variant_sort.sql
-- Per-SKU manual sort priority WITHIN a variant_group, used by the
-- product page's variant selector. Lower numbers float to the
-- left/top of the chips; null = fall through to the canonical order
-- in src/lib/variants.ts (VARIANT_ORDER).
--
-- Distinct from featured_rank (which is for HOMEPAGE catalog
-- ordering across all SKUs); variant_sort is local to a single
-- variant_group's chip row.

alter table skus add column if not exists variant_sort smallint;

-- No index needed — variant groups are small (typically 4-15 SKUs)
-- and queries already filter by variant_group via the existing
-- skus_variant_group_idx.
