-- Watchlist price-drop alerts.
--
-- Adds two columns the daily watchlist cron uses to remember the last price
-- it told the user about, so we only send a notification when a SKU's
-- lowest ask actually drops below where we last alerted (rather than
-- nagging every day about the same price).

alter table watchlist add column if not exists last_alerted_ask_cents int;
alter table watchlist add column if not exists last_alerted_at timestamptz;

create index if not exists watchlist_last_alerted_idx
  on watchlist (last_alerted_at);
