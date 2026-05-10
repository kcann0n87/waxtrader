-- 0079_profiles_stripe_customer_id.sql
-- Add stripe_customer_id to profiles so we can attach saved payment
-- methods to a Stripe Customer object. Without a Customer, every
-- transaction creates a one-off PaymentIntent and there's no way to
-- list "your saved cards" — Stripe only persists payment methods on
-- a Customer.
--
-- Created lazily by getOrCreateStripeCustomer() in src/app/actions/
-- payment-methods.ts when the user first hits the "add card" flow.

alter table profiles add column if not exists stripe_customer_id text;
