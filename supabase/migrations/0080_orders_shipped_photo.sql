-- 0080_orders_shipped_photo.sql
-- Capture an optional packing photo when seller marks an order
-- shipped. Strongest single chargeback-defense addition we have:
-- Stripe disputes flow weighs photo evidence heavily for "item not
-- as described" or "item not received" claims, since it proves what
-- physically left the seller's hands.
--
-- Required for orders > $500 (enforced in src/app/actions/orders.ts);
-- optional but encouraged on smaller orders.

alter table orders add column if not exists shipped_photo_url text;

-- Storage bucket for the photos. Public reads (so the buyer sees
-- the photo on their order page without signed URLs) but writes
-- only via the service-role client used by markShipped — buyers
-- can never upload to other people's orders.
insert into storage.buckets (id, name, public)
values ('shipped-photos', 'shipped-photos', true)
on conflict (id) do nothing;
