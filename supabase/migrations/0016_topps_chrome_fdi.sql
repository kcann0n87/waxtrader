-- 0016_topps_chrome_fdi.sql
-- Topps uses "First Day Issue" (FDI) for their early-print variant — not
-- "FOTL" (which is Panini-specific). The orphan-import in migration 0014
-- mapped Topps Chrome NBA + NFL slugs to fotl-hobby-box; this migration
-- corrects them to first-day-issue-hobby-box and renames the slugs to
-- match.
--
-- Also extends the variant-derivation trigger from migration 0013 so any
-- future SKU with `-first-day-issue-hobby-box` or
-- `-first-day-issue-hobby-jumbo-box` suffix gets the right variant_type
-- automatically.

-- ---------------------------------------------------------------------------
-- 1. Update the trigger to recognize FDI suffixes
-- ---------------------------------------------------------------------------
create or replace function _skus_derive_variant()
returns trigger as $$
begin
  if new.variant_group is null or new.variant_type is null then
    new.variant_group := case
      when new.slug like '%-first-day-issue-hobby-jumbo-box' then substring(new.slug for length(new.slug) - length('-first-day-issue-hobby-jumbo-box'))
      when new.slug like '%-first-day-issue-hobby-box'      then substring(new.slug for length(new.slug) - length('-first-day-issue-hobby-box'))
      when new.slug like '%-fotl-hobby-box'                 then substring(new.slug for length(new.slug) - length('-fotl-hobby-box'))
      when new.slug like '%-hobby-jumbo-box'                then substring(new.slug for length(new.slug) - length('-hobby-jumbo-box'))
      when new.slug like '%-elite-trainer-box'              then substring(new.slug for length(new.slug) - length('-elite-trainer-box'))
      when new.slug like '%-booster-box'                    then substring(new.slug for length(new.slug) - length('-booster-box'))
      when new.slug like '%-hobby-box'                      then substring(new.slug for length(new.slug) - length('-hobby-box'))
      when new.slug like '%-hobby-case'                     then substring(new.slug for length(new.slug) - length('-hobby-case'))
      when new.slug like '%-jumbo-box'                      then substring(new.slug for length(new.slug) - length('-jumbo-box'))
      when new.slug like '%-mega-box'                       then substring(new.slug for length(new.slug) - length('-mega-box'))
      when new.slug like '%-blaster-box'                    then substring(new.slug for length(new.slug) - length('-blaster-box'))
      when new.slug like '%-hanger-box'                     then substring(new.slug for length(new.slug) - length('-hanger-box'))
      when new.slug like '%-value-box'                      then substring(new.slug for length(new.slug) - length('-value-box'))
      when new.slug like '%-inner-case'                     then substring(new.slug for length(new.slug) - length('-inner-case'))
      else new.slug
    end;
    new.variant_type := case
      when new.slug like '%-first-day-issue-hobby-jumbo-box' then 'first-day-issue-hobby-jumbo-box'
      when new.slug like '%-first-day-issue-hobby-box'      then 'first-day-issue-hobby-box'
      when new.slug like '%-fotl-hobby-box'                 then 'fotl-hobby-box'
      when new.slug like '%-hobby-jumbo-box'                then 'hobby-jumbo-box'
      when new.slug like '%-elite-trainer-box'              then 'elite-trainer-box'
      when new.slug like '%-booster-box'                    then 'booster-box'
      when new.slug like '%-hobby-box'                      then 'hobby-box'
      when new.slug like '%-hobby-case'                     then 'hobby-case'
      when new.slug like '%-jumbo-box'                      then 'jumbo-box'
      when new.slug like '%-mega-box'                       then 'mega-box'
      when new.slug like '%-blaster-box'                    then 'blaster-box'
      when new.slug like '%-hanger-box'                     then 'hanger-box'
      when new.slug like '%-value-box'                      then 'value-box'
      when new.slug like '%-inner-case'                     then 'inner-case'
      else 'box'
    end;
  end if;
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- 2. Rename existing Topps Chrome FOTL SKUs to First Day Issue
--    (Panini Prizm FOTL stays untouched — that one's actually FOTL.)
-- ---------------------------------------------------------------------------

-- Topps Chrome NBA
update skus
set
  slug = '2025-26-topps-chrome-basketball-first-day-issue-hobby-box',
  variant_type = 'first-day-issue-hobby-box',
  image_url = '/products/2025-26-topps-chrome-basketball-first-day-issue-hobby-box.jpg',
  description = '2025-26 Topps Chrome NBA First Day Issue Hobby Box. FDI parallels and exclusive autographs not found in standard Hobby Boxes.'
where slug = '2025-26-topps-chrome-basketball-fotl-hobby-box';

-- Topps Chrome NFL
update skus
set
  slug = '2025-topps-chrome-football-first-day-issue-hobby-box',
  variant_type = 'first-day-issue-hobby-box',
  image_url = '/products/2025-topps-chrome-football-first-day-issue-hobby-box.jpg',
  description = '2025 Topps Chrome NFL First Day Issue Hobby Box. FDI parallels and exclusive autographs not found in standard Hobby Boxes.'
where slug = '2025-topps-chrome-football-fotl-hobby-box';

-- Topps Chrome MLB (in case orphan import included it later)
update skus
set
  slug = replace(slug, '-fotl-hobby-box', '-first-day-issue-hobby-box'),
  variant_type = 'first-day-issue-hobby-box',
  image_url = replace(image_url, '-fotl-hobby-box', '-first-day-issue-hobby-box')
where slug like '%-topps-chrome-baseball-fotl-hobby-box';
