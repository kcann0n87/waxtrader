-- 0042_feedback_add_bug_type.sql
-- Adds 'bug' as a third feedback type. The feedback table CHECK
-- constraint locked it to ('feature', 'set'); this swaps the constraint
-- to allow 'bug' too.
--
-- Idempotent: drops the old constraint by name (the auto-generated
-- name from 0025 is feedback_type_check) and adds the new one with
-- IF NOT EXISTS-style safety via DO block.

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_name = 'feedback'
      and constraint_name = 'feedback_type_check'
  ) then
    alter table feedback drop constraint feedback_type_check;
  end if;
end $$;

alter table feedback
  add constraint feedback_type_check
  check (type in ('feature', 'set', 'bug'));
