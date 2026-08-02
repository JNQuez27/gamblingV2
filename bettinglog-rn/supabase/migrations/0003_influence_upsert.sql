-- 0003 — one influence snapshot per user per week.
--
-- The app upserts a row into influence_snapshots every refresh, keyed by the
-- Monday of the current week (snapshot_date). 0001 only created a plain index,
-- and `on conflict` needs a unique one to land on.
create unique index if not exists influence_snapshots_user_week
  on influence_snapshots (user_id, snapshot_date);
