-- 0043_consume_listing_quantity.sql
-- RPC for atomically decrementing listing quantity when an order is paid.
--
-- Why an RPC: Postgres needs a single-statement UPDATE that reads the
-- current quantity AND writes the new value AND flips status to 'Sold'
-- when quantity hits 0. The Supabase JS client can't express
-- "quantity = quantity - n" in an update payload, so we wrap it in a
-- function and call it via supabase.rpc().
--
-- Concurrency safety: the UPDATE filters on `quantity >= p_qty` and
-- `status = 'Active'`, so if two webhooks race for the last unit on a
-- listing, exactly one wins and the other returns null (no row updated).
-- The caller treats null as "out of stock" and proceeds without retrying.
--
-- Returns:
--   remaining_qty  → null when no row updated (not enough stock or not active)
--                    otherwise the new quantity after decrement
--   sold_out       → true when remaining_qty hit 0 (listing was just marked Sold)

create or replace function consume_listing_quantity(
  p_listing_id uuid,
  p_qty integer
) returns table(remaining_qty integer, sold_out boolean)
language plpgsql
security definer
as $$
declare
  v_new_qty integer;
begin
  update listings
  set quantity = quantity - p_qty,
      status = case when quantity - p_qty <= 0 then 'Sold' else status end,
      updated_at = now()
  where id = p_listing_id
    and status = 'Active'
    and quantity >= p_qty
  returning quantity into v_new_qty;

  if v_new_qty is null then
    return query select null::integer, false;
  else
    return query select v_new_qty, v_new_qty <= 0;
  end if;
end;
$$;

-- Allow service role + authenticated to call. (Webhook uses service role,
-- but server actions on behalf of admins might also call this.)
grant execute on function consume_listing_quantity(uuid, integer) to service_role;
grant execute on function consume_listing_quantity(uuid, integer) to authenticated;
