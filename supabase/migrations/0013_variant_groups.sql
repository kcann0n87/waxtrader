-- 0013_variant_groups.sql
-- Groups related SKUs (Hobby Box / Hobby Case / Jumbo Box / Mega Box / etc.)
-- into a single product page. Adds two columns to skus:
--   variant_group - shared prefix used as the canonical product URL key
--                   (e.g. "2024-25-panini-prizm-basketball")
--   variant_type  - which variant a SKU is within its group
--                   (e.g. "hobby-box", "hobby-case", "mega-box")
--
-- The existing per-SKU slug stays unchanged so old URLs keep working —
-- the product page handler redirects them to the canonical variant_group
-- URL with ?variant=<type>.
--
-- Idempotent — backfill is gated on `variant_group is null` so re-running
-- this migration doesn't clobber values an admin has hand-edited.

alter table skus add column if not exists variant_group text;
alter table skus add column if not exists variant_type text;

-- Backfill from existing slug shapes. Order matters: match longest
-- variant suffixes first so "fotl-hobby-box" wins over "hobby-box".
update skus set
  variant_group = case
    when slug like '%-fotl-hobby-box'    then substring(slug for length(slug) - length('-fotl-hobby-box'))
    when slug like '%-hobby-jumbo-box'   then substring(slug for length(slug) - length('-hobby-jumbo-box'))
    when slug like '%-elite-trainer-box' then substring(slug for length(slug) - length('-elite-trainer-box'))
    when slug like '%-booster-box'       then substring(slug for length(slug) - length('-booster-box'))
    when slug like '%-hobby-box'         then substring(slug for length(slug) - length('-hobby-box'))
    when slug like '%-hobby-case'        then substring(slug for length(slug) - length('-hobby-case'))
    when slug like '%-jumbo-box'         then substring(slug for length(slug) - length('-jumbo-box'))
    when slug like '%-mega-box'          then substring(slug for length(slug) - length('-mega-box'))
    when slug like '%-blaster-box'       then substring(slug for length(slug) - length('-blaster-box'))
    when slug like '%-hanger-box'        then substring(slug for length(slug) - length('-hanger-box'))
    when slug like '%-value-box'         then substring(slug for length(slug) - length('-value-box'))
    when slug like '%-inner-case'        then substring(slug for length(slug) - length('-inner-case'))
    else slug
  end,
  variant_type = case
    when slug like '%-fotl-hobby-box'    then 'fotl-hobby-box'
    when slug like '%-hobby-jumbo-box'   then 'hobby-jumbo-box'
    when slug like '%-elite-trainer-box' then 'elite-trainer-box'
    when slug like '%-booster-box'       then 'booster-box'
    when slug like '%-hobby-box'         then 'hobby-box'
    when slug like '%-hobby-case'        then 'hobby-case'
    when slug like '%-jumbo-box'         then 'jumbo-box'
    when slug like '%-mega-box'          then 'mega-box'
    when slug like '%-blaster-box'       then 'blaster-box'
    when slug like '%-hanger-box'        then 'hanger-box'
    when slug like '%-value-box'         then 'value-box'
    when slug like '%-inner-case'        then 'inner-case'
    else 'box'
  end
where variant_group is null or variant_type is null;

create index if not exists skus_variant_group_idx on skus (variant_group);

-- INSERT/UPDATE trigger: any new SKU (or one whose slug changes) gets
-- variant_group + variant_type derived from its slug automatically. This
-- means /admin/catalog/new and any seed scripts don't have to set these
-- columns manually — the trigger keeps them in sync with the slug.
create or replace function _skus_derive_variant()
returns trigger as $$
begin
  if new.variant_group is null or new.variant_type is null then
    new.variant_group := case
      when new.slug like '%-fotl-hobby-box'    then substring(new.slug for length(new.slug) - length('-fotl-hobby-box'))
      when new.slug like '%-hobby-jumbo-box'   then substring(new.slug for length(new.slug) - length('-hobby-jumbo-box'))
      when new.slug like '%-elite-trainer-box' then substring(new.slug for length(new.slug) - length('-elite-trainer-box'))
      when new.slug like '%-booster-box'       then substring(new.slug for length(new.slug) - length('-booster-box'))
      when new.slug like '%-hobby-box'         then substring(new.slug for length(new.slug) - length('-hobby-box'))
      when new.slug like '%-hobby-case'        then substring(new.slug for length(new.slug) - length('-hobby-case'))
      when new.slug like '%-jumbo-box'         then substring(new.slug for length(new.slug) - length('-jumbo-box'))
      when new.slug like '%-mega-box'          then substring(new.slug for length(new.slug) - length('-mega-box'))
      when new.slug like '%-blaster-box'       then substring(new.slug for length(new.slug) - length('-blaster-box'))
      when new.slug like '%-hanger-box'        then substring(new.slug for length(new.slug) - length('-hanger-box'))
      when new.slug like '%-value-box'         then substring(new.slug for length(new.slug) - length('-value-box'))
      when new.slug like '%-inner-case'        then substring(new.slug for length(new.slug) - length('-inner-case'))
      else new.slug
    end;
    new.variant_type := case
      when new.slug like '%-fotl-hobby-box'    then 'fotl-hobby-box'
      when new.slug like '%-hobby-jumbo-box'   then 'hobby-jumbo-box'
      when new.slug like '%-elite-trainer-box' then 'elite-trainer-box'
      when new.slug like '%-booster-box'       then 'booster-box'
      when new.slug like '%-hobby-box'         then 'hobby-box'
      when new.slug like '%-hobby-case'        then 'hobby-case'
      when new.slug like '%-jumbo-box'         then 'jumbo-box'
      when new.slug like '%-mega-box'          then 'mega-box'
      when new.slug like '%-blaster-box'       then 'blaster-box'
      when new.slug like '%-hanger-box'        then 'hanger-box'
      when new.slug like '%-value-box'         then 'value-box'
      when new.slug like '%-inner-case'        then 'inner-case'
      else 'box'
    end;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists skus_derive_variant_trigger on skus;
create trigger skus_derive_variant_trigger
  before insert or update of slug on skus
  for each row execute function _skus_derive_variant();
