-- 0031_soccer_sport_enum.sql
-- Adds 'Soccer' to the sport enum so Soccer SKUs can be inserted.
-- Postgres enums require ALTER TYPE ADD VALUE — can't be inside a
-- transaction block, so run this on its own.

alter type sport add value if not exists 'Soccer';
