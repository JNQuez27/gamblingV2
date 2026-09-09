-- Richer profile: split name + basic demographics used to tailor the app.
-- display_name stays (kept as the full name for anything that still reads it);
-- the app now writes/reads the split fields and derives age from birthdate.

alter table profiles add column if not exists first_name  text;
alter table profiles add column if not exists middle_name text;
alter table profiles add column if not exists last_name   text;
alter table profiles add column if not exists birthdate   date;
alter table profiles add column if not exists gender      text;  -- 'male' | 'female' | 'prefer_not' (free text tolerated)
