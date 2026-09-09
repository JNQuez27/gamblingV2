-- ─────────────────────────────────────────────────────────────
-- DEV ONLY — create a known login user with a FIXED id.
-- Run this in the Supabase SQL Editor AFTER 0001_init.sql + 0002_seed.sql.
-- DO NOT run this in production.
--
--   Login:    demo@bettinglog.app
--   Password: Demo123456
--   User ID:  d0000000-0000-4000-8000-000000000001   (matches SEED_IDS.demoUser)
--
-- Notes:
-- * Supabase login users live in the auth.users table, not in `profiles`.
--   The password must be bcrypt-hashed — that's what crypt()/gen_salt('bf') do
--   (pgcrypto is pre-installed on Supabase).
-- * email_confirmed_at = now() means the user is pre-confirmed, so you can log
--   in immediately even if "Confirm email" is still on.
-- * The on_auth_user_created trigger (from 0002_seed.sql) auto-creates the
--   matching profiles / streaks / notification_preferences rows.
-- ─────────────────────────────────────────────────────────────

-- 1. The auth user
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'demo@bettinglog.app',
  crypt('Demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

-- 2. The matching identity row (newer GoTrue requires this for email login)
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  gen_random_uuid(),
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000001',
  '{"sub":"d0000000-0000-4000-8000-000000000001","email":"demo@bettinglog.app","email_verified":true}',
  'email',
  now(),
  now(),
  now()
)
on conflict do nothing;
