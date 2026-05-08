-- 0075_variant_trigger_full_coverage.sql
-- Expands the variant_group / variant_type derivation trigger from
-- 0013_variant_groups.sql to cover EVERY variant suffix the app supports
-- in src/lib/variants.ts. The original trigger missed several common
-- ones (mega-case, blaster-case, jumbo-case, fotl-hobby-case, all the
-- first-day-issue-* configs, booster-box-case, elite-trainer-box-case),
-- which meant inserting a SKU with one of those slug suffixes left
-- variant_group = full slug → the SKU appeared as its own standalone
-- product on the homepage instead of joining its sibling group.
--
-- Order matters: longer suffixes must be tested before their shorter
-- substrings. e.g. "elite-trainer-box-case" before "elite-trainer-box",
-- "first-day-issue-hobby-jumbo-box" before "first-day-issue-hobby-box",
-- "fotl-hobby-case" before "hobby-case". The CASE expression evaluates
-- top-down, so this ordering matches the longest suffix first.
--
-- Idempotent: just replaces the function and re-binds the trigger.

create or replace function _skus_derive_variant()
returns trigger as $$
declare
  variant_suffix text;
begin
  if new.variant_group is null or new.variant_type is null then
    variant_suffix := case
      -- Longest / most specific suffixes first
      when new.slug like '%-first-day-issue-hobby-jumbo-box' then 'first-day-issue-hobby-jumbo-box'
      when new.slug like '%-first-day-issue-hobby-box'      then 'first-day-issue-hobby-box'
      when new.slug like '%-first-day-issue-hobby-case'     then 'first-day-issue-hobby-case'
      when new.slug like '%-elite-trainer-box-case'         then 'elite-trainer-box-case'
      when new.slug like '%-booster-box-case'               then 'booster-box-case'
      when new.slug like '%-fotl-hobby-jumbo-box'           then 'fotl-hobby-jumbo-box'
      when new.slug like '%-fotl-hobby-box'                 then 'fotl-hobby-box'
      when new.slug like '%-fotl-hobby-case'                then 'fotl-hobby-case'
      when new.slug like '%-hobby-jumbo-box'                then 'hobby-jumbo-box'
      when new.slug like '%-hobby-jumbo-case'               then 'hobby-jumbo-case'
      when new.slug like '%-elite-trainer-box'              then 'elite-trainer-box'
      when new.slug like '%-booster-box'                    then 'booster-box'
      when new.slug like '%-hobby-box'                      then 'hobby-box'
      when new.slug like '%-hobby-case'                     then 'hobby-case'
      when new.slug like '%-jumbo-box'                      then 'jumbo-box'
      when new.slug like '%-jumbo-case'                     then 'jumbo-case'
      when new.slug like '%-mega-box'                       then 'mega-box'
      when new.slug like '%-mega-case'                      then 'mega-case'
      when new.slug like '%-blaster-box'                    then 'blaster-box'
      when new.slug like '%-blaster-case'                   then 'blaster-case'
      when new.slug like '%-hanger-box'                     then 'hanger-box'
      when new.slug like '%-hanger-case'                    then 'hanger-case'
      when new.slug like '%-value-box'                      then 'value-box'
      when new.slug like '%-inner-case'                     then 'inner-case'
      else null
    end;

    if variant_suffix is not null then
      new.variant_group := substring(new.slug for length(new.slug) - length('-' || variant_suffix));
      new.variant_type := variant_suffix;
    else
      new.variant_group := new.slug;
      new.variant_type := 'box';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists skus_derive_variant_trigger on skus;
create trigger skus_derive_variant_trigger
  before insert or update of slug on skus
  for each row execute function _skus_derive_variant();

-- Backfill: any existing SKU whose variant_group is the full slug
-- (i.e. didn't match any suffix the old trigger knew about) gets
-- reclassified now. We can't rely on the trigger here because it
-- short-circuits when variant_group is non-null — so do it inline.
update skus set
  variant_group = case
    when slug like '%-first-day-issue-hobby-jumbo-box' then substring(slug for length(slug) - length('-first-day-issue-hobby-jumbo-box'))
    when slug like '%-first-day-issue-hobby-box'       then substring(slug for length(slug) - length('-first-day-issue-hobby-box'))
    when slug like '%-first-day-issue-hobby-case'      then substring(slug for length(slug) - length('-first-day-issue-hobby-case'))
    when slug like '%-elite-trainer-box-case'          then substring(slug for length(slug) - length('-elite-trainer-box-case'))
    when slug like '%-booster-box-case'                then substring(slug for length(slug) - length('-booster-box-case'))
    when slug like '%-fotl-hobby-case'                 then substring(slug for length(slug) - length('-fotl-hobby-case'))
    when slug like '%-hobby-jumbo-case'                then substring(slug for length(slug) - length('-hobby-jumbo-case'))
    when slug like '%-mega-case'                       then substring(slug for length(slug) - length('-mega-case'))
    when slug like '%-blaster-case'                    then substring(slug for length(slug) - length('-blaster-case'))
    when slug like '%-jumbo-case'                      then substring(slug for length(slug) - length('-jumbo-case'))
    when slug like '%-hanger-case'                     then substring(slug for length(slug) - length('-hanger-case'))
    else variant_group
  end,
  variant_type = case
    when slug like '%-first-day-issue-hobby-jumbo-box' then 'first-day-issue-hobby-jumbo-box'
    when slug like '%-first-day-issue-hobby-box'       then 'first-day-issue-hobby-box'
    when slug like '%-first-day-issue-hobby-case'      then 'first-day-issue-hobby-case'
    when slug like '%-elite-trainer-box-case'          then 'elite-trainer-box-case'
    when slug like '%-booster-box-case'                then 'booster-box-case'
    when slug like '%-fotl-hobby-case'                 then 'fotl-hobby-case'
    when slug like '%-hobby-jumbo-case'                then 'hobby-jumbo-case'
    when slug like '%-mega-case'                       then 'mega-case'
    when slug like '%-blaster-case'                    then 'blaster-case'
    when slug like '%-jumbo-case'                      then 'jumbo-case'
    when slug like '%-hanger-case'                     then 'hanger-case'
    else variant_type
  end
where variant_group = slug
  and (slug like '%-mega-case'
    or slug like '%-blaster-case'
    or slug like '%-jumbo-case'
    or slug like '%-hanger-case'
    or slug like '%-fotl-hobby-case'
    or slug like '%-hobby-jumbo-case'
    or slug like '%-first-day-issue-hobby-box'
    or slug like '%-first-day-issue-hobby-case'
    or slug like '%-first-day-issue-hobby-jumbo-box'
    or slug like '%-booster-box-case'
    or slug like '%-elite-trainer-box-case');
