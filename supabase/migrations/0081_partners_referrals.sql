-- 0081_partners_referrals.sql
-- Referral / partnership system. A "partner" is a group owner /
-- influencer / community admin who gets a unique code to share. Users
-- who sign up via their code get permanently attributed; partner
-- earns a percentage of platform fees from those users' activity for
-- a configurable window.
--
-- Earnings are computed on-the-fly from the orders table joined to
-- profiles.referred_by_partner_id — no separate denormalized
-- earnings table to keep stale. Manual payouts logged in a sibling
-- table so we can mark "paid out through X date" without losing the
-- audit trail.

create table partners (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  email text,
  notes text,
  -- Commission rate as a decimal: 0.20 = 20% of WaxDepot's platform
  -- fee from each referred user's order. Capped at 0.5 to prevent
  -- typos creating a 100%-of-fees partnership.
  commission_rate numeric(4,3) not null default 0.20
    check (commission_rate >= 0 and commission_rate <= 0.5),
  -- Days from the referred user's signup that we count their orders
  -- toward partner earnings. 180 = 6 months (standard). Use
  -- something like 36500 for "lifetime."
  commission_window_days int not null default 180,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index partners_code_idx on partners (code);

-- Profile-level attribution. referred_by_partner_id is the LINK
-- partners and profiles share; referred_at is the timestamp the
-- attribution happened (= signup time). Both nullable since pre-
-- partnership users won't have a partner.
alter table profiles add column if not exists referred_by_partner_id uuid
  references partners(id) on delete set null;
alter table profiles add column if not exists referred_at timestamptz;

create index if not exists profiles_referred_by_idx
  on profiles (referred_by_partner_id)
  where referred_by_partner_id is not null;

-- Payout log: admin marks "paid through this date" so the next
-- monthly run can subtract already-paid earnings. amount_cents is
-- the partner's cut (NOT the gross platform fees).
create table partner_payouts (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references partners(id) on delete cascade,
  amount_cents int not null check (amount_cents >= 0),
  period_through timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create index partner_payouts_partner_idx on partner_payouts (partner_id);

-- RLS: partners table is admin-only. Payouts same. profile attribution
-- is read-by-owner.
alter table partners enable row level security;
alter table partner_payouts enable row level security;

create policy "partners admin only"
  on partners for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "partner_payouts admin only"
  on partner_payouts for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
