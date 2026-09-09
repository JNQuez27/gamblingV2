# AI_CONTEXT.md — BettingLog

> **Purpose of this file.** This is the single, self-contained brief on this
> project for **any AI assistant** (Claude, ChatGPT, DeepSeek, Gemini, etc.).
> Read this top-to-bottom and you have enough context to help with almost any
> task here without exploring the whole repo.
>
> **⚠️ Keep this file current.** Whenever the app changes in a way described
> below — a new screen/route, a new table or column, a new dependency, an
> auth/flow change, a new setup step, or a fixed/known bug — **update the
> matching section here and bump "Last updated" + add a Changelog line.**
> Treat it as the source of truth that travels with the code.

**Last updated:** 2026-09-04
**App name:** BettingLog (Android package `com.bettinglog.app`; some in-app copy says "Reflect")
**One-line description:** A Philippines-focused, Android-first mobile app that helps people reduce gambling harm through daily check-ins, a reflective diary, self-assessments, spending awareness, and a step-by-step behavior plan.

---

## 1. What the app is (domain & intent)

BettingLog is a **gambling harm-reduction / self-help app**, not a betting app.
Its audience is people in the Philippines who want to notice and reduce their
gambling. It is built on behavior-change theory (readiness-to-change stages,
theory-of-planned-behavior "behavior plan", validated questionnaires PGSI &
K10). Tone is calm, non-judgmental, supportive. Money is shown in **PHP (₱)**
and framed as opportunity cost (what the money kept could buy: jeepney rides,
rice, etc.).

Core loops the app supports:
- **Daily check-in** — log a *bet-free* or *gambled* day; builds a streak and "money kept".
- **Diary** — a mood + free-text journal, visualized as a Duolingo-style "Journey Map".
- **Self-assessment** — PGSI (gambling severity) and K10 (psychological distress).
- **Behavior plan** — a personalized list of steps ("My Plan").
- **Learn** — curated real-world resources + guided practices, tuned to the user's gambling type.
- **Optional monitoring** — with explicit consent, a native module can nudge when a gambling app/site opens.

---

## 2. Tech stack

- **Framework:** React Native via **Expo SDK 52** (`expo` ~52), **Expo Router 4** (file-based routing).
- **Language:** TypeScript (strict). Path alias **`@/*` → `src/*`** (see `tsconfig.json`).
- **Backend:** **Supabase** (Postgres + Auth/GoTrue + Row-Level Security). Client `@supabase/supabase-js` v2.
- **State:** React Context (no Redux). Two providers wrap the app (see §5).
- **Storage:** `expo-secure-store` (auth session, encrypted) + `@react-native-async-storage/async-storage` (small local prefs).
- **UI/graphics:** `react-native-svg`, `expo-linear-gradient`, custom SVG icon set, `@react-native-community/datetimepicker`.
- **Auth extras:** `expo-web-browser` + `expo-linking` (Google OAuth + password-reset deep links, PKCE flow).
- **Platform:** **Android-first** (primary/only shipping target). `expo-router` web + `react-native-web` exist only as a dev-preview convenience; some native features degrade or are stubbed on web.
- **Node scripts:** `npm run typecheck` (`tsc --noEmit`), `npm test` (jest), `npm run android`.

### Building & running (important)
- **Release build (what we test/ship):** `npx expo run:android --variant release`. This **bundles the JS into the APK**, so Metro is *not* needed after install. Build ≈ 1–2 min.
- Set the target device with `ANDROID_SERIAL` (e.g. `emulator-5554`).
- Env vars are read as `process.env.EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` and are **inlined at build time** from `bettinglog-rn/.env.local`. If that file is missing at build, the app builds but every request fails ("Network request failed").
- **Dev/UI iteration only** can use the web preview; real verification is on Android.

---

## 3. Repository layout

The app lives in **`bettinglog-rn/`** (repo root `gamblingV2/` also holds docs like this file, `SUPABASE_SETUP.md`, `ARCHITECTURE.md`).

```
bettinglog-rn/
  app/                      # Expo Router screens (file = route)
    _layout.tsx             # Root stack; wraps AppProvider + DialogProvider
    index.tsx               # Launch gate: waits for session, routes to app or onboarding/login
    splash.tsx              # Animated 3-slide onboarding carousel (logged-out intro)
    login.tsx               # Login + signup (email/password + Google), forgot-password link
    auth.tsx                # Deep-link target for the Google OAuth redirect (code exchange)
    forgot-password.tsx     # Request a password-reset email
    reset-password.tsx      # Deep-link target: set a new password
    onboarding/             # problem → about-you → gambling-apps → protect → baseline
    onboarding/protect.tsx  # detection-consent step (app + website), toggles enable now
    (tabs)/                 # Main app tabs: home, diary, learn, profile (+ _layout tab bar)
    settings/               # index, edit-profile, gambling-apps, spending-limit, notifications, privacy
    assessment.tsx, consultation.tsx, weekly-checkin.tsx, visit-logs.tsx
  src/
    providers/              # app-provider.tsx (app state), auth-provider.tsx (auth)
    hooks/                  # useAuth, useAppContext, useSpending
    services/               # one file per domain; the ONLY layer that talks to Supabase
    components/             # ui/, diary/, onboarding/, visit-logs/
    constants/              # colors, gamblingApps, pgsi, k10, phPrices, seedIds, onboardingArt, ...
    types/                  # TS types (auth, psychology, notification, ...)
    utils/                  # date, mathEngine, thresholdEngine, ...
  supabase/migrations/      # SQL migrations 0001..0005 (run in Supabase SQL editor)
  scripts/                  # gen-onboarding-art.js (splits SVGs into animatable layers)
  modules/                  # native app-detector module (installed gambling apps)
```

**Convention:** UI never imports `supabase` directly — it goes through a
`src/services/*.ts` module. The one client lives in `src/services/supabase.ts`.

---

## 4. Routing & navigation

Expo Router, file-based. Notable flows:
- **Launch:** `index.tsx` shows a spinner while the auth session restores, then
  `Redirect`s: signed-in → `/(tabs)/home`; signed-out → `/splash` (onboarding intro → `/login`).
- **Deep link scheme:** `bettinglog://` (set in `app.json`). Used for:
  - Google OAuth redirect → `bettinglog://auth` (caught in-session by `signInWithGoogle`; if the
    OS delivers it to the router instead, `auth.tsx` completes the exchange as a fallback).
  - Password reset → `bettinglog://reset-password?code=…` (routed by expo-router to `reset-password.tsx`).
  - These URLs **must be allow-listed** in Supabase → Auth → URL Configuration.
- **New-user routing:** email sign-up and *first-time* Google sign-in go to
  `/onboarding/problem`; returning users go to `/(tabs)/home`. First-time Google
  is detected via `created_at ≈ last_sign_in_at`.
- **Onboarding order:** `problem` (1) → `about-you` (2, birthdate+gender) → `gambling-apps` (3) → `baseline` (4, PGSI). Steps are skippable.

---

## 5. State providers

- **`AuthProvider`** (`src/providers/auth-provider.tsx`) → `useAuth()`:
  `{ user, isAuthenticated, isLoading, signIn, signOut, refresh }`.
  `user` is an `AuthUser` (see §7). `refresh()` re-fetches the profile (call it after editing the profile).
- **`AppProvider`** (`src/providers/app-provider.tsx`) → `useAppContext()`:
  app data + actions (streak, diary entries, spending, gambling usage, weekly check-in, behavior plan, assessments, etc.). Wraps `AuthProvider`.

`AppProvider` mounts at the root inside `app/_layout.tsx`, alongside a global
`DialogProvider` (`src/components/ui/DialogProvider.tsx`) that renders **styled
confirm dialogs** via `useDialog()` — a drop-in replacement for RN's `Alert.alert`
(same call signature) with a red destructive button, used by delete/clear flows.

---

## 6. Data model (Supabase / Postgres)

All user tables use **Row-Level Security**: a user can only read/write rows where
`auth.uid()` matches (`profiles.id` or the table's `user_id`). Every user table
is `references auth.users(id) on delete cascade`.

**Tables** (`supabase/migrations/0001_init.sql` + seeds):
`profiles`, `streaks`, `diary_entries`, `spending_limits`, `spending_logs`,
`gambling_usage_logs`, `weekly_checkins`, `assessment_sessions`,
`assessment_responses`, `instruments`, `instrument_items`, `instrument_validators`,
`tbp_steps` (behavior-plan steps), `influence_snapshots`, `notification_preferences`,
`notification_logs`, `consultation_sessions`, `consultation_messages`,
`action_history`, `articles`, `quick_practices`, `gambling_apps`.

**`profiles` columns:** `id`, `display_name`, `avatar_url`, `bio`,
`problem_statement`, `readiness_stage` (default `contemplation`),
`moral_reasoning_level`, `push_token`, `created_at`, `updated_at`,
**+ (migration 0005)** `first_name`, `middle_name`, `last_name`, `birthdate` (date),
`gender` (`male`|`female`|`prefer_not`).

**On sign-up**, a trigger (`handle_new_user`, migration 0002) auto-creates the
user's `profiles`, `streaks`, and `notification_preferences` rows.

### Migrations (run once each in the Supabase SQL editor — see `SUPABASE_SETUP.md`)
| File | What it does | Required for |
|---|---|---|
| `0001_init.sql` | All tables + RLS | Everything |
| `0002_seed.sql` | PGSI instrument, PH app presets, sign-up trigger | Sign-up, assessments |
| `0003_influence_upsert.sql` | Influence-snapshot upsert key | Analytics |
| `0004_delete_user.sql` | `delete_user()` RPC (self-delete) | **Delete Account** |
| `0005_profile_fields.sql` | Adds name + demographic columns | **Edit Profile / onboarding demographics** |

The app is **resilient if 0004/0005 aren't run**: `getCurrentUser` catches the
missing-column error and falls back to auth metadata; delete shows a friendly
error instead of crashing.

---

## 7. Auth (how sign-in works)

- **Client config** (`src/services/supabase.ts`): `persistSession: true`,
  `autoRefreshToken: true`, `flowType: 'pkce'`, custom **chunked SecureStore
  storage adapter** (splits the session into <2048-byte pieces because
  `expo-secure-store` silently drops larger values on Android), and an
  **AppState hook** that calls `startAutoRefresh`/`stopAutoRefresh` so the ~1-hour
  access token refreshes and you don't get "JWT expired".
- **`AuthUser`** shape: `{ id, email, displayName, firstName, middleName, lastName, birthdate, gender, avatarUrl, createdAt }`. `displayName` is the full name; the **Home greeting uses `firstName` only**.
- **Email:** `signUpWithEmail(email, pw, {firstName, middleName?, lastName})` then `signInWithEmail`. First/last required; names stored in auth metadata and mirrored to `profiles`.
- **Google:** `signInWithGoogle()` opens an in-app browser (`expo-web-browser`), then `exchangeCodeForSession`. Requires Google enabled in Supabase + redirect URLs allow-listed. First-word/last-word of the Google full name is used to fill first/last if not set.
- **Forgot/reset:** `sendPasswordReset(email)` → email deep-links to `reset-password.tsx` → `beginPasswordRecovery(params)` → `updatePassword(newPw)`.
- **Delete:** `deleteAccount()` calls the `delete_user()` RPC (auth row → cascade wipes all data), then clears the local session. UI requires a **two-step confirm**.
- **Error copy:** `friendlyAuthError(e)` turns raw fetch errors into
  "Can't reach the server. Check your internet connection and try again." and
  "Wrong email or password." — used in login + forgot-password.

---

## 8. Feature map (screen → what it does → key service)

| Area | Screen(s) | Does | Service(s) |
|---|---|---|---|
| **Home** | `(tabs)/home.tsx` | Greeting (first name + time of day), notifications sheet, swipeable "reality check" tips, **daily check-in** (mood + Bet-free/I gambled → streak & money kept), K10 prompt | `streak.service`, `diary.service`, `usage.service` |
| **Diary** | `(tabs)/diary.tsx`, `components/diary/JourneyMap.tsx` | Journey Map (one node per logged day; scrolls; **jump-rail at 100+ days**), Diary Notes compose (mood + text), past entries | `diary.service` |
| **Learn** | `(tabs)/learn.tsx` | Search, category filter, guided practices, real-world resource links, glossary; content **focused on the user's chosen gambling type** | `gamblingProfile` (local) |
| **Profile** | `(tabs)/profile.tsx` | Name/avatar/member-since, progress stats, recovery analytics, gambling risk (from PGSI), gambling activity, emergency hotlines, milestones, **My Plan** (add/clear/select-delete steps) | `assessment.service`, `tbp.service`, `spending.service`, `usage.service`, `influence.service` |
| **Assessments** | `assessment.tsx`, `weekly-checkin.tsx`, onboarding `baseline.tsx` | PGSI (9-item) & K10 (10-item) questionnaires; scored and stored | `assessment.service`, `checkin.service`; scoring in `constants/pgsi.ts`, `constants/k10.ts` |
| **Settings** | `settings/*` | Edit Profile (name/birthdate/gender/bio), Spending Limit (monthly cap + opportunity cost), Apps You Use (tunes Learn), Notifications toggles, Privacy, Background Monitoring toggle, Log Out, Delete Account | `auth.service`, `spending.service`, `notification.service`, `gamblingDetection.service`, `gamblingProfile` |
| **Consultation** | `consultation.tsx` | Talk-to-a-counselor thread | `consultation.service` |
| **Monitoring** | native `modules/app-detector`, `gamblingDetection.service` | (Opt-in) detect gambling apps installed / foreground app / DNS "website shield" and nudge | `appDetection.service`, `gamblingDetection.service` |

**Chosen gambling apps** are stored **locally** (AsyncStorage, key
`chosen_gambling_apps_v1`, via `gamblingProfile.ts`) and drive the Learn focus.
Note: this is **device-local, not per-user** — it persists across accounts on the
same device (a known minor limitation).

---

## 9. Setup requirements (must be done in dashboards; the app can't do them)

See `SUPABASE_SETUP.md` for full steps. Summary of external one-time config:
1. **Supabase project** with `.env.local` set (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). Only the **anon** key ships; never the service_role key.
2. **Run migrations 0001–0005** in the SQL editor.
3. **Auth → URL Configuration → Redirect URLs:** add `bettinglog://auth` and `bettinglog://reset-password`.
4. **Auth → Providers → Google:** enable + paste a Google Cloud OAuth **Web** client's ID/secret; that client's Authorized redirect URI must be `https://<project>.supabase.co/auth/v1/callback`.

The Supabase project is on a **free plan**, which **auto-pauses after ~1 week of
inactivity** — if sign-in fails for everyone at once, resume it in the dashboard.

---

## 10. Known gotchas / things that bite

- **"Network request failed"** on login is almost always **no/weak internet at
  that moment**, or the env var missing at build, or a paused Supabase project —
  *not* a code bug. The message now guides the user.
- **`react-native-svg` canvas limit:** a single SVG taller than the Android
  texture limit crashes. The Journey Map draws the trail as **one small SVG per
  segment** to avoid this — don't reintroduce a single full-height SVG/gradient.
- **`ScrollView` needs `flex: 1`** inside a bounded parent or it clips instead of
  scrolling (this bit the Journey Map).
- **SecureStore 2048-byte limit** — keep the chunked storage adapter.
- **Auto-refresh needs AppState** wiring (kept in `supabase.ts`), or tokens expire.
- **Release builds strip most JS `console` logs** from logcat; debug via UI/state.
- **Path alias:** import from `@/…` (= `src/…`), not deep relative paths.

---

## 11. Conventions & style

- One Supabase client (`src/services/supabase.ts`); UI → services → Supabase.
- No em dashes in user-facing copy (use hyphens); calm, plain, non-judgmental tone; PHP `₱`.
- Icons are a shared inline-SVG set in `src/components/ui/icons.tsx` (no emoji in UI).
- Colors come from `src/constants/colors.ts` (primary blue `#5b9bd5`/`#3a7dbf`, secondary green `#7ab89a`/`#4f9a74`, accent amber `#e8b86d`).
- Dialogs: use `useDialog()` (styled), not `Alert.alert`.
- Verify changes on **Android release build**; run `npm run typecheck` before building.
- After code changes, if `graphify` is available, run `graphify update .` (see `CLAUDE.md`).

---

## 12. Status (as of Last updated)

- **All core features verified working** on an Android release build: auth
  (Google sign-in, persistence, logout, forgot-password, delete), Home + daily
  check-in write, K10, Diary + Journey Map + notes, Learn, Profile, Settings +
  Edit Profile save, Spending Limit. No crashes.
- Recently fixed: session not restoring on relaunch; logout not clearing session;
  JWT expiry after ~1h; Journey Map scroll clipping; Journey Map crash at ~100
  days (+ added a jump-rail); cryptic login error message.

---

## 13. Changelog (append newest on top; update on every app change)

- **2026-09-04** — Removed the "Money kept" concept entirely (the ₱350/bet-free-day
  estimate). Deleted: Journey Map day-card "Money kept (est.)" row + `saved`
  field; Profile "₱5,000 protected" milestone + `moneyKept`; Home "Money kept"
  bell notification + savings Reality Check card (check-in results now say
  bet-free days, no ₱ kept); Settings→Spending limit "kept from N days" block;
  consultation slip line reworded to streak-based; Learn tip reworded; and the
  now-dead `savingsReinforcement` in mathEngine, with all orphaned imports/styles.

- **2026-09-04** — Extended the warm paper/serif journal treatment to the
  Journey Map day-detail card (`JourneyMap.tsx`): cream `#FFFDF8` background with
  a soft warm shadow, and the day's note now renders in serif (`fontFamily`
  'serif'/Georgia) with a warm tan accent bar - matching the Diary Notes feed.

- **2026-09-04** — Redesigned the Diary "Notes" feed (`diary.tsx`) toward a warm
  Soft-UI journal look (via ui-ux-pro-max guidance): entries grouped under day
  headers ("TODAY" + note count), warm cream "paper" cards with soft shadows,
  circular mood avatars in the mood color, colored mood label/dot + right-aligned
  time, serif note body (`fontFamily: 'serif'`/Georgia) as the hero, a staggered
  fade-in per entry, and a warmer empty state. Removed the old flat entry-card /
  leftover anxiety/tag styles.
- **2026-09-04** — Added onboarding step 4 of 5, `onboarding/protect.tsx`: a
  detection-consent screen shown right after sign-in (after gambling-apps,
  before baseline). Two toggles enable app detection (Usage Access) and website
  detection (local VPN) on the spot via the existing
  enable{BackgroundMonitoring,WebsiteShield} service calls; both optional
  ("Continue" always proceeds) and changeable later in Settings. Bumped
  OnboardingScaffold TOTAL_STEPS 4→5; baseline is now step 5.

- **2026-09-04** — Profile: replaced the estimated "Money kept" stat with
  **Clean rate** (% of checked-in days that were bet-free: cleanDays ÷
  daysLogged from the diary slip heuristic; "–" until there's data), and removed
  the "Money kept is an estimate…" caption under Your Progress. Weekly check-in
  (K10): added a back button in the header, a "Why these questions?" explanation
  card (what the K10 is / why distress is tracked / not a diagnosis), and
  display-capitalized the item prompts (data unchanged - the validated K10 text
  stays lowercase; `capitalize()` only affects rendering).

- **2026-09-04** — Removed the test-only presets Scatter Slots
  (`com.murka.scatterslots`) and Bingo Showdown
  (`air.com.spicerackmedia.bingoshowdown`) from `GAMBLING_APP_PRESETS` and the
  manifest `<queries>`. They were added earlier only to exercise detection on
  the emulator; the real catalog stays PH-focused. Detection/watchlist and the
  onboarding "apps you use" chips are catalog-driven, so they no longer appear.
  The `getAppIcon`/favicon logo feature is unaffected (works for any catalog app).

- **2026-09-04** — Added in-app notifications for gambling detections. The Home
  bell panel (`home.tsx`) now surfaces today's gambling app/site opens from
  `usageLogs` (deduped to the newest per target, top 3), labeled "Gambling app
  opened" vs "Gambling site visited" (domains carry a dot), alongside the system
  push nudge. Notif ids switched number→string so entries key off the log id and
  read-state is stable. `onDetected` already refreshes `usageLogs`, so the bell
  updates on return to the app. Verified: bet365.com + Scatter Slots both shown.

- **2026-09-04** — Fixed "no nudge when visiting a gambling website." Detection
  worked; the nudge throttle in `gamblingDetection.service.ts` was a single
  global 45-min cooldown (max 6/day) SHARED across app + website detection, so a
  site visit shortly after any other nudge was silently dropped. Now per-target:
  `PER_TARGET_COOLDOWN_MS` = 5 min keyed by `source:name`, global cap 12/day - a
  distinct gambling app/site always nudges; the same one repeats at most every
  5 min. Verified: app (Scatter Slots) + site (bet365.com) nudges fire together.

- **2026-09-04** — Cut gambling-app detection delay. The native
  `GamblingMonitorService` poll of `UsageStatsManager` was 1500ms (its only
  latency knob — there's no push API); lowered to 400ms so the nudge fires
  ~immediately when a watched app opens. Added Scatter Slots
  (`com.murka.scatterslots`) and Bingo Showdown
  (`air.com.spicerackmedia.bingoshowdown`) to `GAMBLING_APP_PRESETS` so they're
  watched. Verified on emulator: nudge naming "Scatter Slots" fired ~1.5s after
  launch (mostly the app's own cold-start). Website detection is the DNS-VPN
  shield (event-driven, already instant — no polling).

- **2026-09-04** — Redesigned the Profile "Recovery Analytics" widgets
  (interface only; data/logic unchanged), styled in the app's light theme.
  Gambling risk is now a circular ring whose color follows the PGSI band (green
  low / amber moderate / red severe) via `pgsiRisk()`. Monthly spending limit is
  a matching budget ring (green→amber→red by % used). This-week's-spending is a
  gradient line chart with node dots (amber peak) plus green "Bet-free days" /
  amber "Spent this week" footers. Added local `RingGauge` + `WeekLineChart` SVG
  components in `profile.tsx` (light `Metric` palette); removed the old gauge/
  bar/legend styles.

- **2026-09-04** — PGSI answering UX: added a filling progress bar ("N of 9
  answered") to both the onboarding baseline (`baseline.tsx`) and the retake
  (`assessment.tsx`). On the baseline, the "YOUR BASELINE" score card now
  renders at the top (above the questions) once all 9 are answered. Also forced
  the Google account chooser via `prompt: 'select_account'` in `signInWithGoogle`.

- **2026-09-04** — Fixed Google login "Unmatched Route" error. The OAuth
  redirect (`bettinglog:///auth?code=…`) can be delivered to expo-router
  instead of the in-app auth session; there was no `/auth` route so it 404'd.
  Added `app/auth.tsx` (registered in `_layout.tsx`) + `completeOAuthRedirect()`
  in `auth.service.ts` to finish the code exchange and route onward. Idempotent
  (checks for an existing session first) so it can't double-spend the code.

- **2026-09-03** — Clarified "Money kept": it's an *estimate* = bet-free-day
  streak × `PAGCOR_REFERENCE_BETS.averageSessionSpend` (₱350). Added an
  explanation caption on the Profile "Your Progress" section and marked the
  Journey Map day-detail value as "(est.)".
- **2026-09-03** — Created this file. Added `friendlyAuthError` (clearer network/
  login errors). Full-app functional QA passed. Journey Map: segmented trail +
  100+ day jump-rail. AppState-based token auto-refresh. Migration 0005 (profile
  name/demographics), 0004 (`delete_user`). Split-name signup + `about-you`
  onboarding step + birthdate/gender + first-name Home greeting. Google OAuth,
  forgot/reset password, delete account, styled dialogs, StorySet onboarding art.
