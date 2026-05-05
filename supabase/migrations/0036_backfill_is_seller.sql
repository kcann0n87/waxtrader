-- 0036_backfill_is_seller.sql
-- The is_seller column has been read all over (admin filter, /account
-- welcome state, exports) but never WRITTEN to true anywhere — sellers
-- who completed Stripe Connect would still show up with is_seller=false
-- in the admin and get the "Become a seller" CTA on /account.
--
-- The webhook + refreshSellerStripeStatus action now flip is_seller=true
-- whenever stripe_charges_enabled flips true. This backfills the existing
-- catch — anyone already past Stripe onboarding gets the flag set today.

update profiles
set is_seller = true
where stripe_charges_enabled = true
  and is_seller = false;
