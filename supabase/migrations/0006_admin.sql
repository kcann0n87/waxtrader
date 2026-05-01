-- Admin & moderation columns/tables.
--
-- These were originally rolled out via loose SQL the operator ran directly
-- against production, before getting captured here. Re-running this against
-- an environment that already has them is safe: every statement uses
-- IF NOT EXISTS / OR REPLACE / drop-then-create-policy.

-- ---------------------------------------------------------------------------
-- profiles: admin flag + ban state + seller tier
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists is_admin boolean not null default false;
alter table profiles add column if not exists banned_at timestamptz;
alter table profiles add column if not exists ban_reason text;
alter table profiles
  add column if not exists seller_tier text not null default 'Starter'
  check (seller_tier in ('Starter', 'Pro', 'Elite'));

-- Quick lookups for the /admin/users banned filter.
create index if not exists profiles_banned_idx on profiles (banned_at)
  where banned_at is not null;
create index if not exists profiles_admin_idx on profiles (is_admin)
  where is_admin = true;

-- ---------------------------------------------------------------------------
-- admin_actions: append-only audit log
-- ---------------------------------------------------------------------------
create table if not exists admin_actions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  target_type text not null,   -- 'order' | 'user' | 'listing' | 'dispute' | 'sku'
  target_id text not null,     -- uuid or order id (text-shaped)
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_actions_created_at_idx
  on admin_actions (created_at desc);
create index if not exists admin_actions_admin_idx
  on admin_actions (admin_id);
create index if not exists admin_actions_target_idx
  on admin_actions (target_type, target_id);

-- ---------------------------------------------------------------------------
-- RLS: admin_actions is read-only for admins, writes via service role only.
-- ---------------------------------------------------------------------------
alter table admin_actions enable row level security;

drop policy if exists "admin_actions admin read" on admin_actions;
create policy "admin_actions admin read" on admin_actions
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- No insert/update/delete policies => only the service-role client (which
-- bypasses RLS) can write. Server actions in src/app/actions/admin*.ts use
-- the service role for all admin writes, so this stays simple.
