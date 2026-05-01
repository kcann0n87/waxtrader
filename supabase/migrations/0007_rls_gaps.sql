-- Close 4 RLS gaps found during a launch-readiness audit.
--
-- Without these policies, anyone with the public anon key (which is
-- shipped to every browser) could:
--   - sales:           insert fake sales to manipulate the price history
--   - order_events:    insert fake order lifecycle entries
--   - tracking_events: claim a package was delivered
--   - payout_orders:   alter which orders are tied to which payout
--
-- All four should be writable only via the service-role client (which is
-- what the Stripe webhook + cron use). For sales we keep public read since
-- the price tape is meant to be public; for the other three we scope reads
-- to the involved parties.
--
-- NOTE: orders.ts:releaseOrderToSeller is being switched to write the
-- sales row via the service-role client, so the lack of a sales insert
-- policy is intentional.

-- ---------------------------------------------------------------------------
-- sales: public read (tape is meant to be public), service-role-only writes
-- ---------------------------------------------------------------------------
alter table sales enable row level security;

drop policy if exists "sales public read" on sales;
create policy "sales public read" on sales for select using (true);

-- No insert/update/delete policies => only the service-role client can write.

-- ---------------------------------------------------------------------------
-- order_events: visible to the buyer or seller of the order, no public writes
-- ---------------------------------------------------------------------------
alter table order_events enable row level security;

drop policy if exists "order_events party read" on order_events;
create policy "order_events party read" on order_events
  for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_events.order_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- tracking_events: visible to the buyer or seller of the order
-- ---------------------------------------------------------------------------
alter table tracking_events enable row level security;

drop policy if exists "tracking_events party read" on tracking_events;
create policy "tracking_events party read" on tracking_events
  for select
  using (
    exists (
      select 1 from orders o
      where o.id = tracking_events.order_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- payout_orders: visible to the seller whose payout this is
-- ---------------------------------------------------------------------------
alter table payout_orders enable row level security;

drop policy if exists "payout_orders seller read" on payout_orders;
create policy "payout_orders seller read" on payout_orders
  for select
  using (
    exists (
      select 1 from payouts p
      where p.id = payout_orders.payout_id
        and p.seller_id = auth.uid()
    )
  );

-- NOTE: orders update policies (orders buyer update / orders seller update)
-- are intentionally left permissive here. The legitimate write paths
-- (markShipped, markDelivered, confirmDelivery, acceptBid, etc.) live in
-- src/app/actions/orders.ts and run on the regular auth client, so they
-- depend on those policies. A follow-up should either move those writes
-- to the service-role client OR introduce column-level locks so a buyer
-- can't, e.g., flip status to 'Released' without going through the
-- delivery + transfer flow. Tracked separately.
