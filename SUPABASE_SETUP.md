# Supabase Setup — get login working

> Why login fails right now: `.env.local` points at the placeholder
> `your-project.supabase.co`, which doesn't exist, so every auth request dies at
> DNS (`ERR_NAME_NOT_RESOLVED`). This guide gives the app a real backend.
>
> You have neither the Supabase CLI nor Docker installed, so this uses the
> **web dashboard only** — copy, paste, done. ~10 minutes.

---

## Step 1 — Create a project (2 min)

1. Go to <https://supabase.com> → sign in → **New project**.
2. Name it `bettinglog`, pick a **strong database password** (save it), choose the
   region closest to you (e.g. Southeast Asia — Singapore).
3. Wait for it to finish provisioning (~1–2 min).

## Step 2 — Create the tables (2 min)

The tables are **not created by hand** — you run the SQL I already wrote.

1. In the dashboard: left sidebar → **SQL Editor** → **New query**.
2. Open [`bettinglog-rn/supabase/migrations/0001_init.sql`](bettinglog-rn/supabase/migrations/0001_init.sql),
   copy the whole file, paste it in, click **Run**.
   - This creates every table **and** turns on Row-Level Security.
   - Expect "Success. No rows returned."

## Step 3 — Seed the reference data + auth trigger (1 min)

1. SQL Editor → **New query** again.
2. Open [`bettinglog-rn/supabase/migrations/0002_seed.sql`](bettinglog-rn/supabase/migrations/0002_seed.sql),
   copy, paste, **Run**.
   - Adds the PGSI questionnaire, the PH gambling-app presets (with the fixed IDs
     below), and a trigger that auto-creates a profile whenever someone signs up.

## Step 3b — Influence-snapshot upsert key (30 sec)

1. SQL Editor → **New query** again.
2. Open [`bettinglog-rn/supabase/migrations/0003_influence_upsert.sql`](bettinglog-rn/supabase/migrations/0003_influence_upsert.sql),
   copy, paste, **Run**.
   - Adds the unique index the app needs to keep **one influence snapshot per
     user per week** (powers the "% better since your first week" card).

## Step 4 — Turn on email login (1 min)

By default Supabase makes new users confirm their email before they can log in.
For development, turn that off so you can log in immediately:

1. Sidebar → **Authentication** → **Providers** → **Email** → make sure it's
   **enabled**.
2. **Authentication → Sign In / Providers → Email** (or **Settings**) → find
   **"Confirm email"** and **turn it OFF** for now.
   - (Leave it on for production; for dev it just gets in the way.)

> Google login is optional and needs extra OAuth setup — skip it for now and use
> email + password.

## Step 5 — Point the app at your project (1 min)

1. Dashboard → **Project Settings** (gear) → **API**.
2. Copy two values:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon public** key (the long one under "Project API keys")
3. Open [`bettinglog-rn/.env.local`](bettinglog-rn/.env.local) and replace the
   placeholders:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-long-anon-key...
   ```

   > The anon key is safe to keep in the app — RLS is what protects the data.
   > Never put the **service_role** key here.

## Step 6 — Restart the dev server (env vars load at startup)

```bash
cd bettinglog-rn
npm run dev
```

(Stop the old one first if it's still running — env changes only take effect on a
fresh start.)

## Step 7 — Test it

1. In the browser, go to the **Sign Up** tab, enter any email + a password (min 6
   chars), tap **Create Account**.
2. You should land on the onboarding flow. If you signed up, a `profiles` row was
   created automatically (check **Table Editor → profiles**).
3. Log out / back in with the same credentials to confirm **Log In** works.

If it still fails, open the browser dev tools **Network** tab and look at the
`/auth/v1/token` request — the response body says exactly why (wrong key, email
not confirmed, etc.).

---

## The unified IDs (for reference)

These are hard-coded in both `0002_seed.sql` and
[`bettinglog-rn/constants/seedIds.ts`](bettinglog-rn/constants/seedIds.ts), so
the same IDs exist everywhere.

**PGSI instrument:** `a0000000-0000-4000-8000-000000000001`

| PGSI item | ID |
|---|---|
| Q1 | `a0000000-0000-4000-8000-000000000011` |
| Q2 | `a0000000-0000-4000-8000-000000000012` |
| … | … up to … |
| Q9 | `a0000000-0000-4000-8000-000000000019` |

**Gambling-app presets:** `b0000000-0000-4000-8000-00000000000X` (01 = BingoPlus …
09 = Online Poker), matching `constants/gamblingApps.ts`.

---

## What NOT to do

- Don't create tables manually in the Table Editor — run the SQL so RLS and
  indexes come with them.
- Don't change the seed IDs once you have data — they're how rows are matched.
- Don't put the `service_role` key in the app. Only the `anon` key.
- Don't commit `.env.local` — it's git-ignored on purpose.

---

## Step 5 — Google sign-in + password reset (dashboard only)

The app code for Google OAuth and password reset is already wired. Two things
must be turned on server-side or they can't complete.

### 5a — Allow the app's deep links (30 sec)

Dashboard → **Authentication → URL Configuration → Redirect URLs** → add:

```
bettinglog://auth
bettinglog://reset-password
```

(These are where the browser/email hands control back to the app. Without them
Supabase refuses the redirect.)

### 5b — Enable Google (5 min)

1. **Google Cloud Console** → APIs & Services → Credentials → **Create OAuth
   client ID** → type **Web application**.
2. Under **Authorized redirect URIs** add exactly:
   ```
   https://aujrkuagobrmdmqhnmfj.supabase.co/auth/v1/callback
   ```
3. Copy the **Client ID** and **Client secret**.
4. Supabase dashboard → **Authentication → Providers → Google** → toggle **on**,
   paste the Client ID + secret, **Save**.

Until this is done, "Continue with Google" opens the browser and Supabase
returns `provider is not enabled` — that's expected, not an app bug.

### 5c — Password reset email

Works out of the box with the default **Reset Password** template (it uses
`{{ .ConfirmationURL }}`). The app passes the deep link as the redirect, so the
link in the email opens `bettinglog://reset-password?code=…` on the device.
Open the email **on the same device** that requested it (PKCE ties the reset to
that device).

---

## Step 6 — Enable account deletion (run the SQL, 30 sec)

The "Delete Account" button calls a `delete_user()` function that must exist in
the database (the app can't delete auth users directly — that needs the secret
service_role key, which never ships in the app).

1. SQL Editor → **New query**.
2. Open [`bettinglog-rn/supabase/migrations/0004_delete_user.sql`](bettinglog-rn/supabase/migrations/0004_delete_user.sql),
   copy, paste, **Run**. Expect "Success. No rows returned."

Until this runs, tapping "Delete forever" shows *"Could not delete account"*
(function not found) — that's expected, not an app bug.

---

## Step 7 — Profile fields: name + demographics (run the SQL, 30 sec)

Adds the split-name and demographic columns the signup/onboarding/edit-profile
screens write to.

1. SQL Editor → **New query**.
2. Open [`bettinglog-rn/supabase/migrations/0005_profile_fields.sql`](bettinglog-rn/supabase/migrations/0005_profile_fields.sql),
   copy, paste, **Run**. Expect "Success. No rows returned."

Safe to re-run (uses `add column if not exists`). Until it runs, saving a
profile fails because the columns don't exist yet.
