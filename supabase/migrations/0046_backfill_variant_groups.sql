-- 0046_backfill_variant_groups.sql
-- Backfill variant_group + variant_type for SKUs whose slug ends in a
-- recognizable variant suffix but escaped migration 0013's original
-- backfill. The product page redirects /product/<sku-slug> → the
-- canonical /product/<variant-group>?variant=<variant-type>, but only
-- when both columns are populated. A null variant_group leaves the
-- raw "…-hobby-case" URL exposed, which surfaces "Hobby Case" in the
-- URL even though the H1 already uses the group title.
--
-- Specific known-stranded rows (manually verified):
--   - 2025-26-topps-bowman-best-basketball-hobby-case
--   - 2025-26-topps-bowman-u-basketball-hobby-case
--
-- Plus a defensive sweep across every row whose slug matches a known
-- variant suffix and has variant_group still null. Idempotent: rows
-- with non-null variant_group are left alone.

-- Defensive sweep — covers any historical row with a variant suffix
-- but null variant_group. Uses regex to peel the suffix off the slug
-- to derive the canonical group, and to label the variant type.
update skus
set
  variant_group = regexp_replace(
    slug,
    '-(hobby-case|hobby-mega-box|hobby-jumbo-box|hobby-blaster-box|fotl-hobby-box|fotl-mega-box|hobby-box|mega-box|blaster-box|hanger-box|jumbo-box|value-box)$',
    ''
  ),
  variant_type = case
    when slug ~ '-hobby-case$' then 'hobby-case'
    when slug ~ '-hobby-mega-box$' then 'hobby-mega-box'
    when slug ~ '-hobby-jumbo-box$' then 'hobby-jumbo-box'
    when slug ~ '-hobby-blaster-box$' then 'hobby-blaster-box'
    when slug ~ '-fotl-hobby-box$' then 'fotl-hobby-box'
    when slug ~ '-fotl-mega-box$' then 'fotl-mega-box'
    when slug ~ '-hobby-box$' then 'hobby-box'
    when slug ~ '-mega-box$' then 'mega-box'
    when slug ~ '-blaster-box$' then 'blaster-box'
    when slug ~ '-hanger-box$' then 'hanger-box'
    when slug ~ '-jumbo-box$' then 'jumbo-box'
    when slug ~ '-value-box$' then 'value-box'
  end
where variant_group is null
  and slug ~ '-(hobby-case|hobby-mega-box|hobby-jumbo-box|hobby-blaster-box|fotl-hobby-box|fotl-mega-box|hobby-box|mega-box|blaster-box|hanger-box|jumbo-box|value-box)$';

-- Belt-and-suspenders: explicitly fix the two slugs the user surfaced.
-- These updates are no-ops after the sweep above, but written
-- idempotently so the migration is self-documenting about which rows
-- triggered it.
update skus
  set variant_group = '2025-26-topps-bowman-best-basketball',
      variant_type = 'hobby-case'
  where slug = '2025-26-topps-bowman-best-basketball-hobby-case';

update skus
  set variant_group = '2025-26-topps-bowman-best-basketball',
      variant_type = 'hobby-box'
  where slug = '2025-26-topps-bowman-best-basketball-hobby-box';

update skus
  set variant_group = '2025-26-topps-bowman-u-basketball',
      variant_type = 'hobby-case'
  where slug = '2025-26-topps-bowman-u-basketball-hobby-case';

update skus
  set variant_group = '2025-26-topps-bowman-u-basketball',
      variant_type = 'hobby-box'
  where slug = '2025-26-topps-bowman-u-basketball-hobby-box';
