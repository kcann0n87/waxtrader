-- 0021_tier_expires_at.sql
-- Adds the grace-period column for the tier system.
--
-- Rule: when a seller hits a tier qualification (sales OR GMV threshold),
-- their tier benefits last from that day through the END OF THE NEXT
-- CALENDAR MONTH. Re-qualifying any time during the grace period extends
-- the expiration to the new "end of next month" anchor point.
--
-- The /api/cron/recompute-tiers job runs nightly:
--   - Promotion (qualify higher than current): bump immediately, set
--     tier_expires_at = end of next month
--   - Re-qualification (qualify equal to current): extend tier_expires_at
--     to end of next month
--   - Lower qualification with future expires_at: do nothing (grace period)
--   - Lower qualification with past expires_at: demote to qualifying tier
--
-- Without this column, tiers were a pure function of the rolling 30-day
-- window — sellers would silently lose tier the day they had a slow
-- patch. The grace period keeps them rewarded for past performance.

alter table profiles add column if not exists tier_expires_at timestamptz;

-- Indexed so the recompute cron can find rows where the grace period is
-- close to expiring — small table for now but nice to have once there
-- are thousands of sellers.
create index if not exists profiles_tier_expires_at_idx
  on profiles (tier_expires_at)
  where tier_expires_at is not null;
