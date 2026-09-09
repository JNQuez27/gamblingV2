-- Account self-deletion.
-- Lets a signed-in user permanently delete their OWN account. Every user-owned
-- table references auth.users(id) ON DELETE CASCADE, so removing the auth row
-- wipes all their data (diary, streaks, plans, assessments, etc.).
--
-- SECURITY DEFINER so it runs as the function owner (postgres), which is allowed
-- to delete from auth.users; the empty search_path + auth.uid() guard mean a
-- user can only ever delete themselves.

create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
