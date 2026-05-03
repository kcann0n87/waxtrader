-- 0025_feedback.sql
-- Stores user-submitted feedback: feature requests + set-add requests.
-- Both flows live on /feedback. Admin reviews at /admin/feedback (next).
--
-- type:        'feature' | 'set' (kept open for future types)
-- payload:     freeform JSON of the form fields. Schemas differ per type
--              so JSON is friendlier than wide columns.
-- status:      pending | reviewed | accepted | declined | shipped
--              Workflow: new submissions land in 'pending'; admin reviews
--              and either accepts (which can trigger SKU creation), declines,
--              or marks as 'shipped' once the requested feature is live.
-- submitted_by: optional FK to profiles. nullable so anonymous visitors
--              can still submit (we capture email separately if so).
-- email:        contact email — required for anonymous submissions, optional
--              for signed-in users (we already have their auth email).

create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('feature', 'set')),
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'accepted', 'declined', 'shipped')),
  submitted_by uuid references profiles(id) on delete set null,
  email text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_status_created_idx
  on feedback (status, created_at desc);
create index if not exists feedback_type_idx on feedback (type);
create index if not exists feedback_submitted_by_idx on feedback (submitted_by)
  where submitted_by is not null;

-- RLS: anyone (auth or anon) can INSERT; only admins SELECT/UPDATE/DELETE.
alter table feedback enable row level security;

-- Open insert: rate-limiting is handled in the server action, not RLS.
create policy "feedback public insert"
  on feedback for insert
  with check (true);

-- Read + manage = admin only.
create policy "feedback admin read"
  on feedback for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "feedback admin update"
  on feedback for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
