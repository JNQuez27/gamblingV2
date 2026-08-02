-- BettingLog seed + auth wiring. Run AFTER 0001_init.sql.
--
-- 1. A trigger so every new signup automatically gets a profiles row, a
--    streaks row, and default notification preferences (otherwise the app has
--    to create them and RLS makes that fiddly).
-- 2. Reference data with FIXED UUIDs (mirrored in constants/seedIds.ts):
--    the PGSI questionnaire (+ its 9 items) and the PH gambling-app presets.
--
-- Safe to re-run: every insert uses "on conflict do nothing".

-- ─────────────────────────────────────────────
-- 1. AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer               -- runs as owner, so it bypasses RLS
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.streaks (user_id) values (new.id) on conflict do nothing;
  insert into public.notification_preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2a. PGSI INSTRUMENT
-- ─────────────────────────────────────────────
insert into instruments (id, name, version, construct, source, is_active)
values (
  'a0000000-0000-4000-8000-000000000001',
  'PGSI', '1.0', 'Problem gambling severity', 'validated', true
)
on conflict (id) do nothing;

-- PGSI items. Every item shares the same 0–3 answer scale.
insert into instrument_items (id, instrument_id, item_order, prompt, scale) values
  ('a0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 1,
   'Have you bet more than you could really afford to lose?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 2,
   'Have you needed to gamble with larger amounts of money to get the same feeling of excitement?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 3,
   'When you gambled, did you go back another day to try to win back the money you lost?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000001', 4,
   'Have you borrowed money or sold anything to get money to gamble?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000001', 5,
   'Have you felt that you might have a problem with gambling?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000001', 6,
   'Has gambling caused you any health problems, including stress or anxiety?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000001', 7,
   'Have people criticized your betting or told you that you had a gambling problem, whether or not you thought it was true?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000001', 8,
   'Has your gambling caused any financial problems for you or your household?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]'),
  ('a0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000001', 9,
   'Have you felt guilty about the way you gamble or what happens when you gamble?',
   '[{"label":"Never","value":0},{"label":"Sometimes","value":1},{"label":"Most of the time","value":2},{"label":"Almost always","value":3}]')
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- 2b. GAMBLING APP PRESETS (Philippines)
-- ─────────────────────────────────────────────
insert into gambling_apps (id, name, category, is_preset) values
  ('b0000000-0000-4000-8000-000000000001', 'BingoPlus', 'casino', true),
  ('b0000000-0000-4000-8000-000000000002', 'ArenaPlus', 'sports', true),
  ('b0000000-0000-4000-8000-000000000003', 'PhilWin', 'casino', true),
  ('b0000000-0000-4000-8000-000000000004', 'Okada Manila Online', 'casino', true),
  ('b0000000-0000-4000-8000-000000000005', 'MWPlay888', 'casino', true),
  ('b0000000-0000-4000-8000-000000000006', 'PIGO / e-Sabong', 'e-sabong', true),
  ('b0000000-0000-4000-8000-000000000007', 'PCSO / Lotto', 'lottery', true),
  ('b0000000-0000-4000-8000-000000000008', 'Sports Betting', 'sports', true),
  ('b0000000-0000-4000-8000-000000000009', 'Online Poker', 'poker', true)
on conflict (id) do nothing;
