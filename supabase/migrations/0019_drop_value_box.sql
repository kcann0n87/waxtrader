-- 0019_drop_value_box.sql
-- Removes the Value Box variant entirely. In this market they're
-- functionally identical to Blaster Box (same retail tier, similar pack
-- counts, often the same packaging with a different sticker) — having
-- both was just noise in the variant selector.
--
-- Also removes the matching value-case slot from the trigger function so
-- nobody can accidentally seed one in the future.
--
-- Idempotent: deletes by exact slug list, then drops value-* clauses
-- from the trigger via a full function rewrite.

-- ---------------------------------------------------------------------------
-- 1. Drop the existing value-box SKUs (orphan-imported in migration 0014)
-- ---------------------------------------------------------------------------
delete from skus
where variant_type in ('value-box', 'value-case');

-- ---------------------------------------------------------------------------
-- 2. Rewrite the trigger without value-* patterns. Same shape as 0018
--    minus the value-box and value-case CASE branches.
-- ---------------------------------------------------------------------------
create or replace function _skus_derive_variant()
returns trigger as $$
begin
  if new.variant_group is null or new.variant_type is null then
    new.variant_group := case
      -- Cases (longest suffixes first)
      when new.slug like '%-first-day-issue-hobby-jumbo-case' then substring(new.slug for length(new.slug) - length('-first-day-issue-hobby-jumbo-case'))
      when new.slug like '%-first-day-issue-hobby-case'      then substring(new.slug for length(new.slug) - length('-first-day-issue-hobby-case'))
      when new.slug like '%-fotl-hobby-case'                 then substring(new.slug for length(new.slug) - length('-fotl-hobby-case'))
      when new.slug like '%-elite-trainer-box-case'          then substring(new.slug for length(new.slug) - length('-elite-trainer-box-case'))
      when new.slug like '%-booster-box-case'                then substring(new.slug for length(new.slug) - length('-booster-box-case'))
      when new.slug like '%-hobby-jumbo-case'                then substring(new.slug for length(new.slug) - length('-hobby-jumbo-case'))
      when new.slug like '%-hobby-case'                      then substring(new.slug for length(new.slug) - length('-hobby-case'))
      when new.slug like '%-jumbo-case'                      then substring(new.slug for length(new.slug) - length('-jumbo-case'))
      when new.slug like '%-mega-case'                       then substring(new.slug for length(new.slug) - length('-mega-case'))
      when new.slug like '%-blaster-case'                    then substring(new.slug for length(new.slug) - length('-blaster-case'))
      when new.slug like '%-hanger-case'                     then substring(new.slug for length(new.slug) - length('-hanger-case'))
      when new.slug like '%-inner-case'                      then substring(new.slug for length(new.slug) - length('-inner-case'))
      -- Boxes (longest suffixes first)
      when new.slug like '%-first-day-issue-hobby-jumbo-box' then substring(new.slug for length(new.slug) - length('-first-day-issue-hobby-jumbo-box'))
      when new.slug like '%-first-day-issue-hobby-box'       then substring(new.slug for length(new.slug) - length('-first-day-issue-hobby-box'))
      when new.slug like '%-fotl-hobby-box'                  then substring(new.slug for length(new.slug) - length('-fotl-hobby-box'))
      when new.slug like '%-hobby-jumbo-box'                 then substring(new.slug for length(new.slug) - length('-hobby-jumbo-box'))
      when new.slug like '%-elite-trainer-box'               then substring(new.slug for length(new.slug) - length('-elite-trainer-box'))
      when new.slug like '%-booster-box'                     then substring(new.slug for length(new.slug) - length('-booster-box'))
      when new.slug like '%-hobby-box'                       then substring(new.slug for length(new.slug) - length('-hobby-box'))
      when new.slug like '%-jumbo-box'                       then substring(new.slug for length(new.slug) - length('-jumbo-box'))
      when new.slug like '%-mega-box'                        then substring(new.slug for length(new.slug) - length('-mega-box'))
      when new.slug like '%-blaster-box'                     then substring(new.slug for length(new.slug) - length('-blaster-box'))
      when new.slug like '%-hanger-box'                      then substring(new.slug for length(new.slug) - length('-hanger-box'))
      else new.slug
    end;
    new.variant_type := case
      when new.slug like '%-first-day-issue-hobby-jumbo-case' then 'first-day-issue-hobby-jumbo-case'
      when new.slug like '%-first-day-issue-hobby-case'       then 'first-day-issue-hobby-case'
      when new.slug like '%-fotl-hobby-case'                  then 'fotl-hobby-case'
      when new.slug like '%-elite-trainer-box-case'           then 'elite-trainer-box-case'
      when new.slug like '%-booster-box-case'                 then 'booster-box-case'
      when new.slug like '%-hobby-jumbo-case'                 then 'hobby-jumbo-case'
      when new.slug like '%-hobby-case'                       then 'hobby-case'
      when new.slug like '%-jumbo-case'                       then 'jumbo-case'
      when new.slug like '%-mega-case'                        then 'mega-case'
      when new.slug like '%-blaster-case'                     then 'blaster-case'
      when new.slug like '%-hanger-case'                      then 'hanger-case'
      when new.slug like '%-inner-case'                       then 'inner-case'
      when new.slug like '%-first-day-issue-hobby-jumbo-box'  then 'first-day-issue-hobby-jumbo-box'
      when new.slug like '%-first-day-issue-hobby-box'        then 'first-day-issue-hobby-box'
      when new.slug like '%-fotl-hobby-box'                   then 'fotl-hobby-box'
      when new.slug like '%-hobby-jumbo-box'                  then 'hobby-jumbo-box'
      when new.slug like '%-elite-trainer-box'                then 'elite-trainer-box'
      when new.slug like '%-booster-box'                      then 'booster-box'
      when new.slug like '%-hobby-box'                        then 'hobby-box'
      when new.slug like '%-jumbo-box'                        then 'jumbo-box'
      when new.slug like '%-mega-box'                         then 'mega-box'
      when new.slug like '%-blaster-box'                      then 'blaster-box'
      when new.slug like '%-hanger-box'                       then 'hanger-box'
      else 'box'
    end;
  end if;
  return new;
end;
$$ language plpgsql;
