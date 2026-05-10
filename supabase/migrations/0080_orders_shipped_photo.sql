-- 0080_orders_shipped_photo.sql
-- Capture an optional packing photo when seller marks an order
-- shipped. Strongest single chargeback-defense addition we have:
-- Stripe disputes flow weighs photo evidence heavily for "item not
-- as described" or "item not received" claims, since it proves what
-- physically left the seller's hands.
--
-- Nullable since the upload is optional (low-value orders, sellers
-- in a hurry, etc.) but heavily encouraged in the form copy.

alter table orders add column if not exists shipped_photo_url text;
