# BettingLog — Behavioral Gambling-Awareness App: Unified System Reference

> **Version**: 4.0 (Unified · Mobile · Android-First)
> **Last Updated**: August 2, 2026 (structure reconciled with the current codebase)
> **Status**: Active Architecture & Build Reference
> **Platform**: Android-first (React Native + Expo)
> **Backend**: Supabase only — no separate API server

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Theoretical Foundation](#2-theoretical-foundation)
3. [Conceptual Framework](#3-conceptual-framework)
4. [Core Features](#4-core-features)
5. [System Architecture at a Glance](#5-system-architecture-at-a-glance)
6. [Technology Stack](#6-technology-stack)
7. [Application Structure](#7-application-structure)
8. [Database Schema (Supabase / PostgreSQL)](#8-database-schema-supabase--postgresql)
9. [Service Layer](#9-service-layer)
10. [Assessment & Instrument System](#10-assessment--instrument-system)
11. [Theoretical Behavior Plan (TBP)](#11-theoretical-behavior-plan-tbp)
12. [Spending Limitation Engine](#12-spending-limitation-engine)
13. [Gambling Usage Tracking & Ranking](#13-gambling-usage-tracking--ranking)
14. [Notification System (Math Engine)](#14-notification-system-math-engine)
15. [Trends & Visualization](#15-trends--visualization)
16. [Consultation](#16-consultation)
17. [State Management](#17-state-management)
18. [Type System](#18-type-system)
19. [Color & Design System](#19-color--design-system)
20. [Environment & Configuration](#20-environment--configuration)
21. [Development Commands](#21-development-commands)
22. [Deployment (Android / EAS)](#22-deployment-android--eas)
23. [Build Order & Roadmap](#23-build-order--roadmap)
24. [Extension Guidelines](#24-extension-guidelines)

---

## 1. Project Overview

**BettingLog** is an Android-only mobile application that helps users in the Philippines **recognize, reflect on, and control their gambling habits**. It is not a betting app and not a general wellness app — it is a single-purpose **behavioral intervention tool** grounded in established theories of human learning, moral reasoning, and decision-making.

The app connects a user's day-to-day gambling behavior to their **mental health** by making the invisible visible: how often gambling apps are opened, how much money is spent, what the money could otherwise buy (opportunity cost), and where the user stands on a validated risk scale. It then guides the user through a structured, theory-driven **behavior-change process**.

### Guiding principles

- **Single app, single platform.** Android-only. One React Native + Expo codebase. All backend concerns handled directly by Supabase. There is no separate API server, no iOS build, no Apple/APNS code paths.
- **Theory-first.** Every feature maps to a named psychological or economic theory (see §2). Nothing is added "because it's a nice feature."
- **Non-judgmental framing.** The app informs and reflects; it never shames. Awareness, not punishment, drives change.
- **Measurable.** The app must be able to **measure its own influence** on the user over time (§10.4).
- **Self-reported data.** Passive detection of gambling-app usage is not possible inside Expo's sandbox (Android privacy restrictions). All usage/spend data is user-initiated or AI-assisted on self-reported entries.

### What is intentionally excluded (removed in v4.0)

| Removed | Reason |
|---|---|
| Separate Express/Node backend (`bettinglog-api`) | Supabase handles auth, DB, storage, functions, and cron directly |
| Prisma ORM, Redis, monorepo, shared-types package | Unnecessary layers; single app is simpler to maintain |
| iOS / Apple Sign In / APNS / App Store | Android-only project |
| Axios API client + REST endpoint layer | Replaced by Supabase JS SDK behind a service layer |
| **MAUQ** usability survey | Removed per scope; app influence is measured differently (§10.4) |
| Motivational **quote** notifications | Replaced by a **math-engine** notification system (§14) |

---

## 2. Theoretical Foundation

BettingLog rests on four theoretical pillars. Each pillar is not decorative — it dictates concrete app behavior.

### 2.1 Kohlberg's Theory of Moral Development — *Consciousness & Moral Reasoning*

Lawrence Kohlberg described moral reasoning as progressing through levels: **Pre-conventional** (self-interest, avoiding punishment), **Conventional** (social approval, rules), and **Post-conventional** (internal principles, self-chosen values).

**Application in BettingLog:** gambling control is treated as a rise in *consciousness* — moving the user from reacting to consequences (losing money, hiding behavior) toward reasoning from self-chosen principles ("I choose not to gamble because it conflicts with who I want to be"). The app:

- Stores a `moral_reasoning_level` per user. **In Phase 1 this is manually/admin-set**, not inferred from behavior.
- Adapts reflective prompts and TBP framing to the user's current level (e.g., pre-conventional users see consequence-focused prompts; post-conventional users see values-focused prompts).
- Uses diary and consultation surfaces to nudge reasoning upward over time (raising consciousness).

### 2.2 Thorndike's Laws of Learning — *Readiness, Exercise, Effect*

Edward Thorndike's laws explain how habits form and dissolve.

- **Law of Readiness** — behavior change only "takes" when the person is *ready*. The app tracks a `readiness_stage` (see below) and never pushes action steps on a user who is not ready; forcing action when unready produces resistance.
- **Law of Exercise** — connections strengthen with repetition and weaken with disuse. This cuts **both ways**:
  - *Negative:* constantly opening gambling apps strengthens the gambling habit. This is why frequency of opening is a first-class metric (§13) — repetition is the mechanism of harm.
  - *Positive:* repeated reflection, logging, and check-ins strengthen the *awareness* habit. The streak system and daily/weekly rhythm are deliberate applications of the Law of Exercise in the healthy direction.
- **Law of Effect** — behaviors followed by satisfying outcomes are repeated. The app surfaces the *satisfying outcome of restraint* (money saved, streak grown, opportunity cost avoided) so control becomes self-reinforcing.

**Readiness operationalized (Stages of Change):** `readiness_stage` uses a simple, well-known ladder the app can adapt to:
`pre-contemplation → contemplation → preparation → action → maintenance`.

### 2.3 Theory of Opportunity Cost — *Economic Reasoning*

Every peso and every hour spent gambling is a peso/hour *not* spent on something else. Opportunity cost is the economic engine behind the **math-engine notifications** (§14) and the spending analytics (§12). Instead of abstract warnings, the app translates gambling spend into concrete alternatives (e.g., "₱6,000 this month ≈ one month of groceries").

### 2.4 Connection to Mental Health

The three learning/economic theories above are wrapped in a mental-health lens. The app frames gambling patterns as connected to stress, mood, and wellbeing (captured in the diary's mood tracking), and treats rising consciousness and readiness as steps toward better mental health — not just financial control. Assessment risk levels (§10) are the bridge between behavior and wellbeing.

### 2.5 Theory → Feature Map

| Theory | Drives these features |
|---|---|
| Kohlberg (moral reasoning / consciousness) | `moral_reasoning_level`, adaptive reflective prompts, TBP framing, consultation tone |
| Law of Readiness | `readiness_stage`, gating of action steps, adaptive notifications |
| Law of Exercise | Gambling-open frequency tracking (§13), streaks, daily/weekly cadence |
| Law of Effect | Money-saved / streak / avoided-cost reinforcement surfaces |
| Opportunity Cost | Math-engine notifications (§14), spending analytics (§12) |
| Mental-health lens | Mood diary, assessment risk levels, weekly check-in, consultation |

---

## 3. Conceptual Framework

BettingLog follows an **Input → Process → Output (IPO)** model. This is the framework a system evaluation can be built against.

```
┌──────────────────────────┐   ┌───────────────────────────────┐   ┌──────────────────────────┐
│          INPUT           │   │            PROCESS            │   │          OUTPUT          │
│                          │   │                               │   │                          │
│ • User's gambling problem│   │ THEORY-DRIVEN ENGINE          │   │ • Raised consciousness   │
│ • Self-reported app usage│   │                               │   │   (Kohlberg level ↑)     │
│ • Self-reported spending │──▶│ • Assessment scoring          │──▶│ • Controlled spending    │
│ • Assessment responses   │   │   (validated instrument)      │   │   (within set limit)     │
│ • Readiness stage        │   │ • Kohlberg consciousness      │   │ • Reduced gambling-app   │
│ • Moral reasoning level  │   │   prompts                     │   │   opening frequency      │
│ • Mood / diary entries   │   │ • Law-of-Exercise reinforce   │   │ • TBP progress           │
│                          │   │ • Opportunity-cost math       │   │ • Measured APP INFLUENCE │
│                          │   │ • TBP planning                │   │   (baseline vs. current) │
│                          │   │ • Weekly check-in + threshold │   │                          │
│                          │   │   detection ("too much?")     │   │                          │
│                          │   │ • Math-engine notifications   │   │                          │
└──────────────────────────┘   └───────────────────────────────┘   └──────────────────────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │      FEEDBACK LOOP    │
                                   │  Trends & visualization  │
                                   │  feed back into INPUT │
                                   │  (weekly re-measure)  │
                                   └──────────────────────┘
```

**Narrative.** The user brings a *problem* and raw behavior (input). The app *processes* that behavior through the theoretical engine — scoring it with a validated instrument, applying opportunity-cost math, reinforcing healthy repetition, and detecting when usage crosses a "too much" threshold. The result (output) is measurable behavior change and, crucially, a measure of **how much the app itself influenced the user**. Weekly re-measurement closes the loop.

### Theoretical framework (one-line summary)

> *Gambling control is a learnable behavior. By repeatedly exercising awareness (Thorndike), reasoning about it at progressively higher moral levels (Kohlberg), and confronting its opportunity cost (economics) — but only when the user is ready (Readiness) — the user moves from compulsive gambling toward self-directed control, and the app quantifies its own contribution to that change.*

---

## 4. Core Features

| # | Feature | Theory link | Section |
|---|---|---|---|
| 1 | **Behavioral Diary** — mood + written reflection | Kohlberg, mental health | §7, §17 |
| 2 | **Assessment (validated instrument)** — checklist questionnaire w/ scoring | Mental health, measurement | §10 |
| 3 | **Weekly Check-in Questionnaire** — recurring alarm/notification | Law of Exercise, Readiness | §10.3 |
| 4 | **App Influence Measure** — baseline vs. current, "is the app working?" | Measurement | §10.4 |
| 5 | **Theoretical Behavior Plan (TBP)** — structured, readiness-gated steps | All four pillars | §11 |
| 6 | **Spending Limitation Engine** — set limit, log spend, threshold alerts | Opportunity cost | §12 |
| 7 | **Gambling Usage Tracking + Ranking** — top-3 apps, open-frequency, "too much?" threshold | Law of Exercise | §13 |
| 8 | **Math-Engine Notifications** — opportunity-cost math, not quotes | Opportunity cost, Law of Effect | §14 |
| 9 | **Checklist Notifications** — actionable daily/weekly checklists | Law of Exercise | §14.3 |
| 10 | **Trends & Visualization** — charts of ups and downs over time | Feedback loop | §15 |
| 11 | **Consultation** — guided app-user dialogue | Kohlberg, mental health | §16 |
| 12 | **Streak System** — daily engagement reinforcement | Law of Exercise/Effect | §17 |
| 13 | **Scripting Histories** — audit log of user actions over time | Measurement, evaluation | §8, note in §13 |

---

## 5. System Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                     ANDROID DEVICE (single app)                  │
│                                                                 │
│   React Native (Expo SDK 52) · TypeScript · Expo Router          │
│   React Context (global state) · Expo Notifications (FCM)         │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │   Screens (app/)                                        │    │
│   │      home · diary · learn · profile · settings          │    │
│   └───────────────────────────┬───────────────────────────┘    │
│                               │                                 │
│   ┌───────────────────────────▼───────────────────────────┐    │
│   │   Service Layer (src/services/)                         │    │
│   │   ALL Supabase calls live here — never in components    │    │
│   └───────────────────────────┬───────────────────────────┘    │
│                               │                                 │
│   ┌───────────────────────────▼───────────────────────────┐    │
│   │   Utilities (src/utils/)                                │    │
│   │   spendingEngine · mathEngine · scoring · thresholds    │    │
│   └───────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Supabase JS SDK (HTTPS)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SUPABASE                               │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Auth    │  │  PostgreSQL  │  │ Storage  │  │ Edge Funcs  │  │
│  │          │  │  + RLS       │  │ (avatars)│  │ + pg_cron   │  │
│  │ email /  │  │              │  │          │  │             │  │
│  │ Google   │  │ all user data│  │          │  │ scoring,    │  │
│  │          │  │              │  │          │  │ weekly push │  │
│  └──────────┘  └──────────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key architectural rules**

1. **Screens never call Supabase directly.** They call hooks; hooks call the service layer; the service layer calls Supabase.
2. **Utilities are pure functions** built and unit-tested **before** any UI that consumes them (strict sequencing).
3. **Scheduled work** (weekly questionnaire push, assessment scoring, streak reset) runs in **Supabase Edge Functions triggered by `pg_cron`**, not on the device.
4. **Row-Level Security** guarantees a user can only read/write their own rows.

---

## 6. Technology Stack

| Concern | Technology | Notes |
|---|---|---|
| Framework | React Native | 0.76, via Expo |
| Runtime | Expo SDK | 52 |
| Language | TypeScript | strict mode |
| Routing | Expo Router | file-based |
| Path alias | `@/*` → `src/*` | `tsconfig.json` paths + Jest `moduleNameMapper` |
| State | React Context (`AppProvider` / `useAppContext`) | |
| Backend | Supabase | Auth, Postgres, Row-Level Security |
| DB access | `@supabase/supabase-js` | called only from `src/services/` |
| Local storage | Expo SecureStore / AsyncStorage | tokens in SecureStore |
| Push | Expo Notifications | **FCM only** (Android) |
| Icons / UI | `react-native-svg` (hand-rolled icons), `expo-linear-gradient` | |
| Native modules | Custom Expo modules in Kotlin | `app-detector`, `gambling-monitor` |
| Charts | _not currently installed_ | trends visualization (§15) is planned — add a chart lib when built |
| AI (optional) | Claude API | gambling app/URL classifier on self-reported data |
| Currency | PHP (₱) | app-wide default |

> **Removed vs v3.0:** Node/Express, Prisma, Redis, Axios, EAS iOS, shared-types workspace.
> **Removed in cleanup:** `lucide-react-native` and `react-native-gifted-charts` (both unused); icons are now hand-rolled with `react-native-svg`.

---

## 7. Application Structure

The app lives in `bettinglog-rn/`. All importable code sits under `src/` and is imported via the `@/` alias (`@/services/...`, `@/hooks/...`); `app/` contains **routes only**.

```
bettinglog-rn/                            # single Expo app (Android-first)
├── app/                                  # Expo Router — routes ONLY
│   ├── _layout.tsx                       # Root layout (AppProvider, auth guard)
│   ├── index.tsx                         # Entry redirect
│   ├── splash.tsx                        # Onboarding slides (non-judgmental framing)
│   ├── login.tsx                         # Email/password
│   ├── assessment.tsx                    # Assessment flow
│   ├── consultation.tsx                  # Consultation dialogue
│   ├── visit-logs.tsx                    # Gambling visit logs
│   ├── weekly-checkin.tsx                # Weekly check-in questionnaire
│   ├── onboarding/
│   │   ├── problem.tsx                   # "What brings you here?" (user's problem)
│   │   ├── gambling-apps.tsx             # Multi-select chips, PH app presets
│   │   └── baseline.tsx                  # Baseline assessment (for influence measure)
│   ├── settings/
│   │   ├── index.tsx
│   │   ├── edit-profile.tsx
│   │   ├── notifications.tsx
│   │   ├── spending-limit.tsx            # Update spending limitation
│   │   └── privacy.tsx
│   └── (tabs)/
│       ├── _layout.tsx                   # Bottom tab bar
│       ├── home.tsx                      # Dashboard, streak, math-engine card
│       ├── diary.tsx                     # Mood diary & reflections
│       ├── learn.tsx                     # Psychoeducation content
│       └── profile.tsx                   # Analytics, trends, TBP, assessments, consultation
│
├── src/
│   ├── services/                         # ALL Supabase + native calls (single source of truth)
│   │   ├── supabase.ts                   # Client singleton
│   │   ├── auth.service.ts
│   │   ├── diary.service.ts
│   │   ├── assessment.service.ts         # sessions, responses, scoring calls
│   │   ├── checkin.service.ts            # weekly check-in
│   │   ├── influence.service.ts          # app-influence snapshots
│   │   ├── tbp.service.ts
│   │   ├── spending.service.ts
│   │   ├── usage.service.ts              # gambling usage + ranking
│   │   ├── consultation.service.ts
│   │   ├── streak.service.ts
│   │   ├── notification.service.ts
│   │   ├── appDetection.service.ts       # bridges the app-detector native module
│   │   └── gamblingDetection.service.ts  # bridges the gambling-monitor native module
│   │
│   ├── hooks/                            # useAppContext · useAuth · useSpending
│   ├── providers/                        # app-provider (root AppContext) · auth-provider
│   │
│   ├── utils/                            # PURE functions — build first, test first
│   │   ├── spendingEngine.ts             # spend status, warning states, % of limit
│   │   ├── mathEngine.ts                 # opportunity-cost + projection notifications
│   │   ├── thresholdEngine.ts            # "too much" open-frequency detection (§13)
│   │   ├── scoring.ts                    # instrument scoring (PGSI etc.)
│   │   ├── influence.ts                  # baseline vs. current delta calculations
│   │   ├── ranking.ts                    # top-N gambling apps
│   │   ├── consultationEngine.ts         # consultation flow logic
│   │   ├── nudgeEngine.ts                # nudge selection
│   │   ├── tbpTemplates.ts               # TBP step templates
│   │   ├── date.ts
│   │   └── *.test.ts                     # colocated unit tests (spending/threshold/influence)
│   │
│   ├── components/
│   │   ├── ui/                           # BackHeader, Mascot, icons (react-native-svg)
│   │   ├── diary/                        # JourneyMap
│   │   ├── onboarding/                   # OnboardingScaffold
│   │   └── visit-logs/                   # GamblingVisitLogs
│   │
│   ├── constants/                        # colors, gamblingApps (PH presets), pgsi,
│   │                                     #   phPrices, seedIds, weeklyCheckin, mentalHealthTerms
│   │
│   └── types/                            # auth, diary, psychology, spending, usage,
│                                         #   notification, influence
│
├── modules/                              # custom native modules (Kotlin, Android)
│   ├── app-detector/                     # detects installed/foreground gambling apps
│   └── gambling-monitor/                 # background + VPN monitoring service
│
├── plugins/
│   └── withGamblingAppQueries.js         # Expo config plugin (Android app queries)
├── scripts/
│   └── gen-onboarding-art.js             # generates onboarding art data
│
├── supabase/
│   └── migrations/                       # SQL schema + RLS (source of truth)
│       ├── 0001_init.sql                 # tables + Row-Level Security
│       ├── 0002_seed.sql                 # PGSI, PH app presets, profile trigger
│       └── 0003_influence_upsert.sql     # weekly influence snapshot index
│
├── assets/
├── app.json                              # Expo config (Android-first)
├── eas.json                              # EAS build config
├── package.json
├── tsconfig.json                         # @/* -> ./src/*
└── .env.local                            # git-ignored
```

> **Note:** the native `android/` project is generated by `expo prebuild` and is git-ignored; regenerate it locally as needed. Supabase Edge Functions referenced elsewhere in this document (e.g. §9, §14) are part of the design but are not yet in the repo — only `supabase/migrations/` is committed.

---

## 8. Database Schema (Supabase / PostgreSQL)

All user data lives in Supabase Postgres. Every user-owned table enforces **Row-Level Security** so `auth.uid()` can only touch its own rows. Below is the schema as SQL DDL (the source of truth lives in `supabase/migrations/`).

```sql
-- ─────────────────────────────────────────────
-- PROFILES  (extends auth.users)
-- ─────────────────────────────────────────────
create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  display_name          text,
  avatar_url            text,
  bio                   text,
  problem_statement     text,                         -- the user's stated problem
  readiness_stage       text default 'contemplation', -- pre-contemplation|contemplation|preparation|action|maintenance
  moral_reasoning_level text default 'pre-conventional', -- Kohlberg; ADMIN-SET in Phase 1
  push_token            text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─────────────────────────────────────────────
-- STREAK  (Law of Exercise — healthy repetition)
-- ─────────────────────────────────────────────
create table streaks (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  current_count  int default 0,
  marked_today   boolean default false,
  last_marked_at timestamptz,
  updated_at     timestamptz default now()
);

-- ─────────────────────────────────────────────
-- DIARY  (mood + reflection; mental-health bridge)
-- ─────────────────────────────────────────────
create table diary_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mood       text not null,       -- mood key/emoji
  note       text not null,
  entry_date date not null,       -- for grouping
  created_at timestamptz default now()
);
create index on diary_entries (user_id, entry_date);

-- ─────────────────────────────────────────────
-- INSTRUMENTS  (validated questionnaires)
-- If no existing validated instrument fits a construct,
-- a custom one is created and validated by 3 validators.
-- ─────────────────────────────────────────────
create table instruments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,           -- e.g. "PGSI"
  version       text not null,
  construct     text not null,           -- what it measures
  source        text default 'validated',-- 'validated' | 'custom'
  is_active     boolean default true,
  created_at    timestamptz default now()
);

create table instrument_items (
  id            uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references instruments(id) on delete cascade,
  item_order    int not null,
  prompt        text not null,
  scale         jsonb not null           -- e.g. options + point values
);

-- 3-validator expert validation record for custom instruments
create table instrument_validators (
  id            uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references instruments(id) on delete cascade,
  validator_name text not null,
  credentials    text,
  verdict        text not null,          -- 'approved' | 'revise' | 'rejected'
  remarks        text,
  validated_at   timestamptz default now()
);
-- A custom instrument is "applicable" only when it has >= 3 'approved' validators.

-- ─────────────────────────────────────────────
-- ASSESSMENT SESSIONS + RESPONSES
-- ─────────────────────────────────────────────
create table assessment_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  instrument_id  uuid not null references instruments(id),
  total_score    int not null,
  risk_level     text not null,          -- low | moderate | high | severe
  category       text,
  is_baseline    boolean default false,  -- first run, used for influence measure
  started_at     timestamptz,
  completed_at   timestamptz default now()
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
-- WEEKLY CHECK-IN  (recurring questionnaire / alarm)
-- ─────────────────────────────────────────────
create table weekly_checkins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  week_start    date not null,
  responses     jsonb not null,          -- short recurring questionnaire
  summary_score int,
  created_at    timestamptz default now()
);
create index on weekly_checkins (user_id, week_start);

-- ─────────────────────────────────────────────
-- APP INFLUENCE  (is the app working? baseline vs current)
-- ─────────────────────────────────────────────
create table influence_snapshots (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  snapshot_date      date not null,
  pgsi_score         int,               -- current risk score
  weekly_spend       numeric(12,2),
  weekly_open_count  int,               -- gambling-app opens that week
  created_at         timestamptz default now()
);
create index on influence_snapshots (user_id, snapshot_date);

-- ─────────────────────────────────────────────
-- THEORETICAL BEHAVIOR PLAN (TBP)
-- ─────────────────────────────────────────────
create table tbp_steps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  step_number  int not null,
  title        text not null,
  description  text not null,
  status       text default 'pending',  -- pending | in-progress | completed
  target_date  date,
  created_at   timestamptz default now(),
  completed_at timestamptz
);
create index on tbp_steps (user_id);

-- ─────────────────────────────────────────────
-- SPENDING  (limitation engine — opportunity cost)
-- ─────────────────────────────────────────────
create table spending_limits (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  limit_amount numeric(12,2) not null,
  period       text default 'monthly',  -- weekly | monthly
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
-- GAMBLING USAGE + APP CATALOG (ranking, open-frequency)
-- ─────────────────────────────────────────────
create table gambling_apps (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  category  text,                       -- casino | sports | e-sabong | lottery ...
  is_preset boolean default false       -- PH preset apps
);

create table gambling_usage_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  app_id      uuid references gambling_apps(id),
  app_name    text not null,            -- kept for free-text / AI-classified entries
  open_count  int default 1,            -- times opened (Law of Exercise metric)
  time_spent  int default 0,            -- minutes (optional)
  logged_date date not null,
  created_at  timestamptz default now()
);
create index on gambling_usage_logs (user_id, logged_date);

-- ─────────────────────────────────────────────
-- CONSULTATION  (guided app-user dialogue)
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
-- ACTION HISTORY  ("scripting histories" — audit log)
-- ─────────────────────────────────────────────
create table action_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null,             -- e.g. 'logged_spend', 'opened_gambling_app'
  payload    jsonb,
  created_at timestamptz default now()
);
create index on action_history (user_id, created_at);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS  (math-engine + checklist logs, preferences)
-- ─────────────────────────────────────────────
create table notification_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,             -- 'math' | 'checklist' | 'weekly'
  title      text,
  body       text,
  sent_at    timestamptz default now()
);

create table notification_preferences (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  math_engine   boolean default true,
  checklist     boolean default true,
  weekly_checkin boolean default true,
  quiet_start   time,
  quiet_end     time
);

-- ─────────────────────────────────────────────
-- LEARN CONTENT (admin-seeded, public-readable)
-- ─────────────────────────────────────────────
create table articles (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text,
  content      text,                     -- markdown
  category     text,                     -- risk | recovery | psychology
  image_url    text,
  is_featured  boolean default false,
  published_at timestamptz default now()
);

create table quick_practices (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  type         text,                     -- breathing | journaling | mindfulness
  duration_min int,
  content      text
);
```

### Row-Level Security pattern

Every user-owned table uses the same policy shape. Example for `diary_entries` (repeat for all tables with a `user_id`):

```sql
alter table diary_entries enable row level security;

create policy "own rows - select" on diary_entries
  for select using (auth.uid() = user_id);

create policy "own rows - insert" on diary_entries
  for insert with check (auth.uid() = user_id);

create policy "own rows - update" on diary_entries
  for update using (auth.uid() = user_id);

create policy "own rows - delete" on diary_entries
  for delete using (auth.uid() = user_id);
```

`articles`, `quick_practices`, `instruments`, and `instrument_items` are **read-only public** (select for `authenticated`), written only via the Supabase dashboard / admin.

---

## 9. Service Layer

The service layer is the **only** place `@supabase/supabase-js` is imported. Screens and components never touch Supabase directly. This keeps the app easy to maintain and easy to test.

```typescript
// src/services/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: SecureStoreAdapter, autoRefreshToken: true, persistSession: true } }
);
```

```typescript
// src/services/diary.service.ts  — example shape
import { supabase } from './supabase';
import type { DiaryEntry } from '@/types/diary';

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('diary_entries').insert(entry).select().single();
  if (error) throw error;
  return data;
}
```

**Rule:** one service file per domain, mirroring the tables. Hooks import services; components import hooks.

---

## 10. Assessment & Instrument System

### 10.1 Validated instrument first (PGSI)

The primary assessment is the **PGSI (Problem Gambling Severity Index)** — a validated 9-item instrument. Custom quiz designs are avoided when a validated instrument exists. PGSI scoring bands:

| Score | Risk level |
|---|---|
| 0 | Non-problem |
| 1–2 | Low risk |
| 3–7 | Moderate risk |
| 8+ | Problem gambling (severe) |

Scoring runs in `src/utils/scoring.ts` (pure function) and/or the `score-assessment` Edge Function for authoritative server-side scoring.

### 10.2 Custom instruments with 3-validator rule

For any construct that has **no existing validated instrument** (for example, a measure specific to this app's influence, or a Kohlberg-consciousness gauge), a **custom instrument may be created — from scratch or by adapting an existing one**. It becomes usable in-app **only after it is validated by at least 3 expert validators** (recorded in `instrument_validators` with `verdict = 'approved'`).

```
No validated instrument exists
        ↓
Draft custom instrument (scratch or adapt)
        ↓
Submit to 3 validators (expert content validation)
        ↓
>= 3 'approved' verdicts?  ──No──▶ revise
        │Yes
        ▼
Mark instrument.is_active = true  →  usable in app
```

> "Instrument" in this app always means **a questionnaire applicable to the app's purpose**. Nothing self-authored is used on real users until the 3-validator bar is met.

### 10.3 Weekly check-in questionnaire (recurring alarm)

A short recurring questionnaire fires **weekly** to keep awareness "exercised" (Law of Exercise) and to detect drift early. It:

- Is delivered as a scheduled notification (`weekly-checkin-push` Edge Function via `pg_cron`).
- Stores results in `weekly_checkins`.
- Feeds an `influence_snapshot` so change over time is captured.
- Can escalate: if the summary score worsens, the app surfaces a consultation prompt.

### 10.4 App influence measure (removing MAUQ)

Instead of a usability survey (MAUQ, removed), the app measures **its own behavioral influence** on the user by comparing a **baseline** (captured at onboarding) against **current** values:

| Metric | Baseline | Current | Interpretation |
|---|---|---|---|
| PGSI score | onboarding | latest session | ↓ = risk reduced |
| Weekly spend (₱) | first week | this week | ↓ = spending controlled |
| Weekly gambling-app opens | first week | this week | ↓ = habit weakening (Law of Exercise) |

`src/utils/influence.ts` computes deltas and a simple **influence index** (e.g., % improvement across the three metrics). This is the answer to *"is the app influencing the user, and by how much?"* — and it doubles as the app's evaluation data.

---

## 11. Theoretical Behavior Plan (TBP)

The TBP is a **structured, step-by-step behavior-change plan** that operationalizes all four theories:

- **Readiness-gated:** steps unlock according to `readiness_stage`. A pre-contemplation user is not handed action steps; they get awareness steps first (Law of Readiness).
- **Consciousness-framed:** step language adapts to `moral_reasoning_level` (Kohlberg).
- **Repetition-based:** steps encourage repeated healthy actions (Law of Exercise) and celebrate satisfying outcomes (Law of Effect).
- **Opportunity-cost-aware:** steps reference money/time saved.

Each step has a status (`pending → in-progress → completed`) and an optional target date, stored in `tbp_steps`.

---

## 12. Spending Limitation Engine

`src/utils/spendingEngine.ts` (pure) derives spend status from a limit and logged spend.

- User sets a limit (`spending_limits`, weekly or monthly, PHP).
- Each `spending_logs` entry updates the running total.
- The engine returns a **summary**: `{ limit, current, remaining, percentUsed, isCritical (>=80%), isOverLimit }`.
- Crossing thresholds triggers a **math-engine notification** (§14), not a generic alert.

Limits are updatable any time in `settings/spending-limit.tsx`.

```typescript
// utils/spendingEngine.ts — return shape
export interface SpendingSummary {
  limit: number;
  current: number;
  remaining: number;
  percentUsed: number;   // 0–100+
  isCritical: boolean;   // >= 80%
  isOverLimit: boolean;  // > 100%
  currency: string;      // 'PHP'
}
```

---

## 13. Gambling Usage Tracking & Ranking

Because passive detection is impossible in Expo's sandbox, usage is **self-reported** (optionally AI-classified from a free-text app/URL the user reports, via the Claude API classifier).

### 13.1 Open-frequency as the core metric (Law of Exercise)

The number of times a user **opens** a gambling app is the primary harm signal — repetition is what strengthens the habit. `gambling_usage_logs.open_count` captures this per app per day.

### 13.2 "When is it too much?" — threshold engine

`src/utils/thresholdEngine.ts` answers *kanus-a makaingon nga sobra na* ("when can we say it's too much?"). It classifies the user's opening frequency into bands using a configurable model:

| Band | Example rule (configurable) | Meaning |
|---|---|---|
| Controlled | ≤ 1 open/day avg | Habit not being reinforced |
| Elevated | 2–4 opens/day avg | Repetition building |
| High | 5–9 opens/day avg | Strong reinforcement |
| Severe | 10+ opens/day avg | Compulsive pattern |

Thresholds are surfaced to the user with plain-language explanation ("opening 8×/day strengthens the habit loop") and can be **cross-referenced with PGSI risk level** so the number is grounded, not arbitrary. Exact cut-offs should be finalized with a validator (§10.2).

### 13.3 Ranking (top-3)

`src/utils/ranking.ts` aggregates opens/time per app and surfaces the user's **top 3 most-used gambling apps**, so intervention focuses where the habit is strongest. Rendered via `UsageRankingChart`.

### 13.4 Scripting histories

Every meaningful user action (log spend, report an open, complete a check-in, finish a TBP step) is appended to `action_history`. This "scripting history" is the raw timeline used for trends (§15), the influence measure (§10.4), and app evaluation.

---

## 14. Notification System (Math Engine)

Motivational quotes are **replaced** by a **math engine** that computes personal, numeric, opportunity-cost-based messages.

### 14.1 What the math engine computes

`src/utils/mathEngine.ts` (pure) generates notifications from the user's own data:

- **Opportunity cost:** "₱6,000 this month ≈ 1 month of groceries" / "≈ 40 days of jeepney fare."
- **Projection:** "At ₱1,500/week you're on track for ₱78,000 this year."
- **Limit proximity:** "You're at 85% of your ₱5,000 limit — ₱750 left."
- **Frequency math:** "You opened gambling apps 34× this week, up 21% from last week."
- **Savings reinforcement (Law of Effect):** "3 days without gambling = ₱1,200 kept."

### 14.2 Delivery

Math notifications can fire on triggers (limit thresholds crossed, weekly rollup) via Edge Functions + `pg_cron`, and log to `notification_logs (kind='math')`.

### 14.3 Checklist notifications

A separate **checklist** notification presents a short, actionable daily/weekly list (e.g., "☐ Log today's spend ☐ 2-min reflection ☐ Weekly check-in"). This exercises the healthy-habit loop and logs to `notification_logs (kind='checklist')`.

---

## 15. Trends & Visualization

A dedicated analytics surface in `profile.tsx` renders **charts of the ups and downs over time** so the user can see their trajectory:

| Chart | Source | Shows |
|---|---|---|
| Spend trend (line) | `spending_logs` | Weekly/monthly ₱ over time vs. limit |
| Open-frequency trend (line/bar) | `gambling_usage_logs` | Opens per week (Law of Exercise curve) |
| Risk trend (line) | `assessment_sessions` | PGSI score over time |
| Top-3 apps (bar) | `ranking.ts` | Where the habit concentrates |
| Influence delta (gauge/paired bar) | `influence_snapshots` | Baseline vs. current |

`src/utils/trends.ts` aggregates the raw series; charts are built with `react-native-gifted-charts` (or `victory-native`). Charts are the visible half of the IPO feedback loop (§3).

---

## 16. Consultation

A guided **consultation** surface lets the user "talk" with the app about their situation. It:

- Opens a `consultation_sessions` record; messages stored in `consultation_messages`.
- Frames questions along Kohlberg lines to gently raise consciousness.
- Can be scripted (decision-tree) in Phase 1 and optionally AI-assisted (Claude API) later.
- Escalates to real-world help resources when risk is high (severe PGSI band).

> Consultation is **support, not therapy**. Where risk is severe, the app should direct users to professional/local help resources rather than attempt to handle it alone.

---

## 17. State Management

Two contexts keep concerns separate.

| Context | Responsibility |
|---|---|
| `AuthContext` | Identity, session, login/logout |
| `AppContext` | Feature state: streak, diary, spending, usage, assessments, TBP, readiness, moral level |

```typescript
interface AppContextValue {
  // Profile / theory
  readinessStage: ReadinessStage;
  moralReasoningLevel: MoralReasoningLevel;   // admin-set in Phase 1

  // Streak (Law of Exercise)
  streak: number;
  streakMarked: boolean;
  markStreak: () => Promise<void>;

  // Diary
  diaryEntries: DiaryEntriesByDate;
  addDiaryEntry: (dateStr: string, entry: DiaryEntry) => Promise<void>;

  // Spending (opportunity cost)
  spendingLimit: number;
  currentSpend: number;
  spendingSummary: SpendingSummary | null;
  updateSpendingLimit: (limit: number) => Promise<void>;
  logSpend: (amount: number, note?: string) => Promise<void>;

  // Gambling usage + ranking
  gamblingAppUsage: Record<string, number>;   // appName -> open count
  topGamblingApps: RankedApp[];               // top 3
  logGamblingOpen: (appName: string) => Promise<void>;

  // Assessments + influence
  assessmentResults: AssessmentScore[];
  getLatestAssessmentScore: () => AssessmentScore | undefined;
  influenceIndex: number | null;              // % improvement vs baseline

  // TBP
  theoreticalBehaviorPlan: TBPStep[];
  addTBPStep: (step: TBPStep) => Promise<void>;
  updateTBPStepStatus: (id: string, status: TBPStep['status']) => Promise<void>;
}
```

**Defaults while fetching:** `streak: 0`, `streakMarked: false`, `diaryEntries: {}`, `gamblingAppUsage: {}`, `topGamblingApps: []`, `spendingLimit: 0`, `currentSpend: 0`, `spendingSummary: null`, `assessmentResults: []`, `influenceIndex: null`, `theoreticalBehaviorPlan: []`, `readinessStage: 'contemplation'`, `moralReasoningLevel: 'pre-conventional'`.

---

## 18. Type System

All types live in `src/types/`. Supabase table shapes are the source of truth.

```typescript
// src/types/psychology.ts
export type ReadinessStage =
  | 'pre-contemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance';

export type MoralReasoningLevel =
  | 'pre-conventional' | 'conventional' | 'post-conventional';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface AssessmentScore {
  id: string;
  instrumentName: string;
  instrumentVersion: string;
  totalScore: number;
  riskLevel: RiskLevel;
  category: string;
  isBaseline: boolean;
  completedAt: string;
}

export interface TBPStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  targetDate?: string;
  createdAt: string;
  completedAt?: string;
}

// src/types/usage.ts
export interface RankedApp {
  appName: string;
  totalOpens: number;
  totalMinutes: number;
  rank: number;         // 1..3
}

export type UsageBand = 'controlled' | 'elevated' | 'high' | 'severe';
```

---

## 19. Color & Design System

Unchanged from prior versions — calm, non-judgmental palette.

```typescript
// src/constants/colors.ts
export const Colors = {
  primary: '#5b9bd5', primaryDark: '#3a7dbf', primaryLight: '#bfdbfe',
  secondary: '#7ab89a', secondaryDark: '#4f9a74', secondaryLight: '#bbf7d0',
  accent: '#e8b86d',
  warningBg: '#fffbeb', warningBorder: '#fde68a', warningCritical: '#fca5a5',
  bg: '#f0f4f8', bgCard: '#ffffff',
  text: '#2d3748', textMuted: '#718096', textLight: '#a0aec0',
  border: '#e2e8f0', white: '#ffffff', black: '#111111',
};
```

| Layout property | Value |
|---|---|
| Max width | 430px |
| Card padding | 16–24px |
| Section spacing | 28px |
| Min tap target | 48px |
| Orientation | Portrait only |

---

## 20. Environment & Configuration

```env
# .env.local  (git-ignored)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional — AI classifier for self-reported app/URL entries
EXPO_PUBLIC_ANTHROPIC_PROXY_URL=...      # never ship a raw API key in the app
```

**Secrets** (service role key, any Claude API key) live **only** in Supabase Edge Function secrets, never in the app bundle.

`app.json` is configured for **Android only** (package name, adaptive icon, FCM). No iOS block.

---

## 21. Development Commands

```bash
npm install            # install dependencies
npm start              # Expo dev server
npm run android        # launch on Android emulator/device
npm run typecheck      # tsc --noEmit
npm run test           # jest — utils first (spendingEngine, mathEngine, thresholdEngine, scoring)

# Supabase (via CLI)
supabase start                 # local stack
supabase db push               # apply migrations from supabase/migrations
supabase functions deploy      # deploy Edge Functions
```

---

## 22. Deployment (Android / EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure

# Android build only
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

- Supabase is managed and always running.
- Migrations applied via `supabase db push` (or CI).
- `pg_cron` schedules: weekly check-in push, streak reset, influence snapshot.

---

## 23. Build Order & Roadmap

Strict sequencing — **utilities before UI**.

**Phase 1 — Foundations**
1. Supabase schema + RLS (§8).
2. Service layer skeletons (§9).
3. Pure utilities with unit tests: `spendingEngine`, `mathEngine`, `thresholdEngine`, `scoring`, `influence`, `ranking`, `trends`.
4. `AppContext` wired to services (§17).
5. Auth + onboarding (problem, gambling-app multi-select, baseline assessment).
6. `moral_reasoning_level` admin-set; `readiness_stage` captured.

**Phase 2 — Core behavior loop**
7. Diary (mood + reflection).
8. Spending limitation engine + logging UI.
9. Gambling usage logging + top-3 ranking + threshold banding.
10. PGSI assessment + scoring Edge Function.
11. Math-engine + checklist notifications.

**Phase 3 — Behavior change + measurement**
12. TBP (readiness-gated, Kohlberg-framed).
13. Weekly check-in questionnaire + push.
14. Influence measure (baseline vs current) + trends charts.
15. Consultation surface.
16. Custom instrument workflow + 3-validator records (only if a needed construct lacks a validated instrument).

---

## 24. Extension Guidelines

**Adding a feature**

1. **Type first** — add interfaces to `src/types/`.
2. **Schema** — add table + RLS in `supabase/migrations/`.
3. **Service** — add/extend a file in `src/services/` (only place Supabase is called).
4. **Utility** — if there's logic, write a pure function in `src/utils/` and unit-test it **before** UI.
5. **Hook** — expose via `src/hooks/`.
6. **Screen/Component** — build UI last; components consume hooks, never Supabase.
7. **Theory check** — confirm the feature maps to a pillar in §2. If it doesn't, reconsider it.

**Naming conventions**

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `spending.service.ts` |
| Components | PascalCase | `MoodSelector.tsx` |
| Hooks | camelCase `use` prefix | `useSpending.ts` |
| Utilities | camelCase | `mathEngine.ts` |
| DB tables | snake_case | `gambling_usage_logs` |
| Env vars | SCREAMING_SNAKE_CASE | `EXPO_PUBLIC_SUPABASE_URL` |

**Do-not-revisit decisions**

- Single mobile app, **no separate backend server** — Supabase handles all backend logic.
- **Android only** — no iOS/Apple code paths.
- **Validated instrument first** (PGSI); custom instruments require **3 approved validators**.
- **All Supabase calls in the service layer.**
- **Utilities before UI.**

---

**Last Updated**: July 9, 2026 · **Version**: 4.0 (Unified · Mobile · Android-Only) · **Status**: Active Build Reference
