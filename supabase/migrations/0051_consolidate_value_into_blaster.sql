-- 0051_consolidate_value_into_blaster.sql
-- Consolidate Value Box and Blaster Box into one variant. They're
-- functionally the same retail tier from a buyer's perspective —
-- separate Topps/Panini SKUs exist with slightly different exclusive
-- parallels, but for marketplace purposes they should appear as a
-- single "Blaster" listing.
--
-- Two operations:
--   A. For variant_groups that already have a published blaster-box
--      AND a value-box, hide the value-box (keep the blaster).
--   B. For variant_groups that only have a value-box (no blaster
--      sibling), rename the row in place: slug, product, and
--      variant_type all switch to blaster-box.
--
-- Both are slug-keyed and idempotent. After running, every retail
-- "Value" SKU on the catalog is either gone (hidden) or renamed
-- to its Blaster counterpart.

-- ---------------------------------------------------------------------
-- A. Hide value-box where a blaster-box sibling already exists
-- ---------------------------------------------------------------------
update skus
  set is_published = false,
      description = 'Consolidated — Value Box and Blaster Box are the same retail tier on this marketplace. This row is hidden in favor of the Blaster Box variant.'
  where variant_type = 'value-box'
    and variant_group is not null
    and exists (
      select 1 from skus s2
      where s2.variant_group = skus.variant_group
        and s2.variant_type = 'blaster-box'
    );

-- ---------------------------------------------------------------------
-- B. Rename remaining value-box rows to blaster-box (no sibling)
--    Updates slug, product label, and variant_type in one shot.
--    NOT EXISTS guard prevents rename collision if a hidden blaster
--    row happens to share the target slug (shouldn't happen given (A)
--    above, but defensive).
-- ---------------------------------------------------------------------
update skus
  set slug = regexp_replace(slug, '-value-box$', '-blaster-box'),
      product = 'Blaster Box',
      variant_type = 'blaster-box',
      updated_at = now()
  where variant_type = 'value-box'
    and is_published = true
    and not exists (
      select 1 from skus s2
      where s2.slug = regexp_replace(skus.slug, '-value-box$', '-blaster-box')
    );
