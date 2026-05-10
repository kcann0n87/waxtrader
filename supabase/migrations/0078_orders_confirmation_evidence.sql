-- 0078_orders_confirmation_evidence.sql
-- Capture buyer-side metadata when they click "Yes, release funds" on
-- a delivered order. Used as evidence in chargeback disputes — Stripe
-- weighs identity + IP geolocation + user-agent when adjudicating
-- "I never received this item" claims, since they prove the buyer was
-- actively logged in to the platform AND took an explicit action
-- acknowledging receipt at a known time and location.
--
-- These columns are nullable since older orders pre-dated the capture
-- and the cron-driven auto-release path (no buyer interaction) won't
-- populate them.

alter table orders add column if not exists confirmed_ip text;
alter table orders add column if not exists confirmed_user_agent text;
alter table orders add column if not exists confirmed_at timestamptz;
