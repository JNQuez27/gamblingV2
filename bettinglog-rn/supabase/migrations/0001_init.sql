-- BettingLog initial schema. Source of truth for the database.
-- Apply with:  supabase db push
--
-- Every user-owned table enables Row-Level Security so a user can only ever
-- read or write their own rows (auth.uid() = user_id). Public content tables
-- (articles, quick_practices, instruments, instrument_items) are read-only to
-- authenticated users and written via the Supabase dashboard.

-- ─────────────────────────────────────────────
-- PROFILES  (extends auth.users)
-- ─────────────────────────────────────────────
create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  display_name          text,
  avatar_url            text,
  bio                   text,
  problem_statement     text,
  readiness_stage       text default 'contemplation',
  moral_reasoning_level text default 'pre-conventional',  -- Kohlberg; admin-set in Phase 1
  push_token            text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─────────────────────────────────────────────
-- STREAK
-- ─────────────────────────────────────────────
create table streaks (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  current_count  int default 0,
  marked_today   boolean default false,
  last_marked_at timestamptz,
  updated_at     timestamptz default now()
);

-- ─────────────────────────────────────────────
-- DIARY
-- ─────────────────────────────────────────────
create table diary_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mood       text not null,
  note       text not null,
  entry_date date not null,
  created_at timestamptz default now()
);
create index on diary_entries (user_id, entry_date);

-- ─────────────────────────────────────────────
-- INSTRUMENTS
-- ─────────────────────────────────────────────
create table instruments (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  version    text not null,
  construct  text not null,
  source     text default 'validated',   -- 'validated' | 'custom'
  is_active  boolean default true,
  created_at timestamptz default now()
);

create table instrument_items (
  id            uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references instruments(id) on delete cascade,
  item_order    int not null,
  prompt        text not null,
  scale         jsonb not null
);

create table instrument_validators (
  id             uuid primary key default gen_random_uuid(),
  instrument_id  uuid not null references instruments(id) on delete cascade,
  validator_name text not null,
  credentials    text,
  verdict        text not null,          -- 'approved' | 'revise' | 'rejected'
  remarks        text,
  validated_at   timestamptz default now()
);
-- A custom instrument is usable only with >= 3 'approved' validators.

-- ─────────────────────────────────────────────
-- ASSESSMENT SESSIONS + RESPONSES
-- ─────────────────────────────────────────────
create table assessment_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  instrument_id uuid not null references instruments(id),
  total_score   int not null,
  risk_level    text not null,           -- low | moderate | high | severe
  category      text,
  is_baseline   boolean default false,
  started_at    timestamptz,
  completed_at  timestamptz default now()
);
create index on assessment_sessions (user_id);

create table assessment_responses (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references assessment_sessions(id) on delete cascade,
  item_id       uuid not null references instrument_items(id),
  response      text not null,
  response_time int
);

-- ─────────────────────────────────────────────
-- WEEKLY CHECK-IN
-- ─────────────────────────────────────────────
create table weekly_checkins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  week_start    date not null,
  responses     jsonb not null,
  summary_score int,
  created_at    timestamptz default now()
);
create index on weekly_checkins (user_id, week_start);

-- ─────────────────────────────────────────────
-- APP INFLUENCE
-- ─────────────────────────────────────────────
create table influence_snapshots (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  snapshot_date     date not null,
  pgsi_score        int,
  weekly_spend      numeric(12,2),
  weekly_open_count int,
  created_at        timestamptz default now()
);
create index on influence_snapshots (user_id, snapshot_date);

-- ─────────────────────────────────────────────
-- THEORETICAL BEHAVIOR PLAN
-- ─────────────────────────────────────────────
create table tbp_steps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  step_number  int not null,
  title        text not null,
  description  text not null,
  status       text default 'pending',   -- pending | in-progress | completed
  target_date  date,
  created_at   timestamptz default now(),
  completed_at timestamptz
);
create index on tbp_steps (user_id);

-- ─────────────────────────────────────────────
-- SPENDING
-- ─────────────────────────────────────────────
create table spending_limits (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  limit_amount numeric(12,2) not null,
  period       text default 'monthly',   -- weekly | monthly
  currency     text default 'PHP',
  updated_at   timestamptz default now()
);

create table spending_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  amount    numeric(12,2) not null,
  note      text,
  logged_at timestamptz default now()
);
create index on spending_logs (user_id, logged_at);

-- ─────────────────────────────────────────────
-- GAMBLING USAGE + APP CATALOG
-- ─────────────────────────────────────────────
create table gambling_apps (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  category  text,
  is_preset boolean default false
);

create table gambling_usage_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  app_id      uuid references gambling_apps(id),
  app_name    text not null,
  category    text,
  open_count  int default 1,
  time_spent  int default 0,
  logged_date date not null,
  created_at  timestamptz default now()
);
create index on gambling_usage_logs (user_id, logged_date);

-- ─────────────────────────────────────────────
-- CONSULTATION
-- ─────────────────────────────────────────────
create table consultation_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  topic      text,
  created_at timestamptz default now()
);

create table consultation_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references consultation_sessions(id) on delete cascade,
  sender     text not null,             -- 'user' | 'app'
  content    text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- ACTION HISTORY  ("scripting histories")
-- ─────────────────────────────────────────────
create table action_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null,
  payload    jsonb,
  created_at timestamptz default now()
);
create index on action_history (user_id, created_at);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
create table notification_logs (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind    text not null,                -- 'math' | 'checklist' | 'weekly'
  title   text,
  body    text,
  sent_at timestamptz default now()
);

create table notification_preferences (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  math_engine    boolean default true,
  checklist      boolean default true,
  weekly_checkin boolean default true,
  quiet_start    time,
  quiet_end      time
);

-- ─────────────────────────────────────────────
-- LEARN CONTENT (admin-seeded, public-readable)
-- ─────────────────────────────────────────────
create table articles (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text,
  content      text,
  category     text,
  image_url    text,
  is_featured  boolean default false,
  published_at timestamptz default now()
);

create table quick_practices (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  type         text,
  duration_min int,
  content      text
);

-- ═════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- ═════════════════════════════════════════════

-- Helper: apply the standard "own rows" policy set to a user-owned table.
-- (Written out explicitly per table below — Postgres has no policy macro.)

-- profiles: a user owns the row whose id IS their auth id.
alter table profiles enable row level security;
create policy "profiles - select own" on profiles for select using (auth.uid() = id);
create policy "profiles - insert own" on profiles for insert with check (auth.uid() = id);
create policy "profiles - update own" on profiles for update using (auth.uid() = id);

-- Tables keyed by user_id share the identical policy shape.
do $$
declare t text;
begin
  foreach t in array array[
    'streaks','diary_entries','assessment_sessions','weekly_checkins',
    'influence_snapshots','tbp_steps','spending_limits','spending_logs',
    'gambling_usage_logs','consultation_sessions','action_history',
    'notification_logs','notification_preferences'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy "own - select" on %I for select using (auth.uid() = user_id);', t);
    execute format('create policy "own - insert" on %I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "own - update" on %I for update using (auth.uid() = user_id);', t);
    execute format('create policy "own - delete" on %I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- assessment_responses / consultation_messages are owned indirectly (through
-- their parent session). Guard them by checking the parent belongs to the user.
alter table assessment_responses enable row level security;
create policy "responses - own via session" on assessment_responses
  for all using (
    exists (select 1 from assessment_sessions s
            where s.id = session_id and s.user_id = auth.uid())
  );

alter table consultation_messages enable row level security;
create policy "messages - own via session" on consultation_messages
  for all using (
    exists (select 1 from consultation_sessions s
            where s.id = session_id and s.user_id = auth.uid())
  );

-- Public read-only content.
do $$
declare t text;
begin
  foreach t in array array['articles','quick_practices','instruments','instrument_items','gambling_apps']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy "public read" on %I for select using (auth.role() = ''authenticated'');', t);
  end loop;
end $$;
