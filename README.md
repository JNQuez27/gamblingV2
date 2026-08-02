# BettingLog

> A behavioral gambling-awareness app that helps people **recognize, reflect on, and control** their gambling habits — grounded in established theories of learning, moral reasoning, and decision-making.

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3FCF8E?logo=supabase&logoColor=white)

BettingLog is **not** a betting app and not a general wellness app. It is a single-purpose behavioral intervention tool for users in the Philippines. It makes the invisible visible — how often gambling apps are opened, how much money is spent, what that money could otherwise buy (opportunity cost), and where the user stands on a validated risk scale — then guides them through a structured, non-judgmental behavior-change process.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Supabase Backend](#supabase-backend)
  - [Running the App](#running-the-app)
- [Scripts](#scripts)
- [Testing](#testing)
- [Native Modules](#native-modules)
- [The Theory Behind It](#the-theory-behind-it)
- [Further Documentation](#further-documentation)

---

## Features

| Feature | Description |
|---|---|
| **Behavioral Diary** | Mood tracking + written reflection |
| **Risk Assessment** | Validated PGSI questionnaire with scoring and risk levels |
| **Weekly Check-in** | Recurring questionnaire to re-measure over time |
| **App Influence Measure** | Baseline vs. current — answers "is the app actually helping?" |
| **Theoretical Behavior Plan (TBP)** | Structured, readiness-gated action steps |
| **Spending Limitation Engine** | Set a limit, log spend, get threshold warnings |
| **Usage Tracking & Ranking** | Top gambling apps, open-frequency, "when is it too much?" detection |
| **Opportunity-Cost Notifications** | Math-engine insights ("₱6,000 this month ≈ a month of groceries") |
| **Trends & Visualization** | Charts of behavior over time |
| **Consultation** | Guided, non-judgmental app–user dialogue |
| **Streaks** | Daily engagement reinforcement |
| **Gambling Detection** | Native app-detection & monitoring modules (Android) |

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React Native 0.76 via **Expo SDK 52** |
| Language | TypeScript (strict) |
| Routing | Expo Router (file-based) |
| State | React Context (`AppProvider` / `useAppContext`) |
| Backend | **Supabase** — Auth, Postgres, Row-Level Security |
| DB access | `@supabase/supabase-js`, called only from `src/services/` |
| Storage | Expo SecureStore (tokens) + AsyncStorage |
| Notifications | Expo Notifications (FCM, Android) |
| UI | `react-native-svg` (hand-rolled icons), `expo-linear-gradient` |
| Native | Custom Expo modules in Kotlin (`app-detector`, `gambling-monitor`) |
| Currency | PHP (₱) |

Imports use the `@/` path alias, which maps to `bettinglog-rn/src/` (configured in `tsconfig.json` and Jest).

---

## Project Structure

The entire application lives in [`bettinglog-rn/`](bettinglog-rn). The repo root holds only documentation and configuration.

```
bettinglog-rn/
├── app/                    # Expo Router — routes ONLY
│   ├── (tabs)/             # home · diary · learn · profile
│   ├── onboarding/         # problem · gambling-apps · baseline
│   ├── settings/           # profile · notifications · spending-limit · privacy
│   ├── assessment.tsx  consultation.tsx  visit-logs.tsx  weekly-checkin.tsx
│   ├── login.tsx  splash.tsx  index.tsx  _layout.tsx
│
├── src/                    # all importable code (via @/)
│   ├── components/         # ui · diary · onboarding · visit-logs
│   ├── constants/          # colors · gamblingApps · pgsi · phPrices · seedIds …
│   ├── hooks/              # useAppContext · useAuth · useSpending
│   ├── providers/          # app-provider · auth-provider
│   ├── services/           # ALL Supabase + native calls (single source of truth)
│   ├── types/              # shared TypeScript interfaces
│   └── utils/              # pure logic engines (+ colocated *.test.ts)
│
├── modules/                # custom native modules (Kotlin)
│   ├── app-detector/       # detects installed/foreground gambling apps
│   └── gambling-monitor/   # background + VPN-based monitoring service
├── plugins/                # Expo config plugins
├── supabase/migrations/    # database schema + RLS (source of truth)
└── app.json                # Expo config (Android-first)
```

The `utils/` engines (`spendingEngine`, `mathEngine`, `thresholdEngine`, `scoring`, `influence`) are **pure functions** and are unit-tested.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Android Studio** + an Android emulator or a physical Android device
- A **Supabase** account (free tier is fine)
- This app uses **custom native modules**, so it cannot run in Expo Go — you need a **development build** (`npm run android`).

### Installation

```bash
git clone https://github.com/JNQuez27/gamblingV2.git
cd gamblingV2/bettinglog-rn
npm install
```

### Environment Variables

Create `bettinglog-rn/.env.local` (git-ignored):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
```

> The `anon` key is safe in the app — Row-Level Security protects the data. **Never** put the `service_role` key here.

### Supabase Backend

Run the migrations in order via the Supabase **SQL Editor** (or `supabase db push`):

1. `supabase/migrations/0001_init.sql` — tables + Row-Level Security
2. `supabase/migrations/0002_seed.sql` — PGSI questionnaire, PH gambling-app presets, profile auto-create trigger
3. `supabase/migrations/0003_influence_upsert.sql` — unique index for weekly influence snapshots

Then enable **Email** auth (and disable "Confirm email" for development). See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the full step-by-step guide.

### Running the App

```bash
cd bettinglog-rn
npm run android      # build + launch on Android emulator/device (dev build)
```

For quick UI iteration in the browser you can also run `npm run web`, but native modules (gambling detection) only work on Android.

---

## Scripts

Run from `bettinglog-rn/`:

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Build and run on Android (development build) |
| `npm run web` | Run in the browser (no native modules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Jest test suite |

---

## Testing

Unit tests cover the pure logic engines. Run them with:

```bash
cd bettinglog-rn
npm test
```

Tests live next to the code they cover (e.g. `src/utils/spendingEngine.test.ts`) and resolve the `@/` alias via the Jest `moduleNameMapper`.

---

## Native Modules

Two custom Expo modules provide Android-only behavior that the managed runtime cannot:

- **`app-detector`** — detects installed and foreground gambling apps (queried through the `withGamblingAppQueries` config plugin).
- **`gambling-monitor`** — a background/VPN service used to monitor gambling-app activity.

Because of these, the app requires a **development or EAS build**; Expo Go is not supported. The generated `android/` project is not committed — regenerate it with `npx expo prebuild` if needed.

---

## The Theory Behind It

Every feature maps to a named theory — nothing is added "just because."

- **Kohlberg's Moral Development** — treats gambling control as rising *consciousness*, adapting prompts to the user's moral-reasoning level.
- **Thorndike's Laws of Learning** (Readiness, Exercise, Effect) — never pushes action before the user is ready; tracks open-frequency (repetition = harm) and reinforces healthy repetition through streaks.
- **Opportunity Cost** — translates gambling spend into concrete alternatives via the math engine.
- **Mental-Health Lens** — frames gambling patterns in terms of stress, mood, and wellbeing.

The app follows an **Input → Process → Output** model and re-measures weekly to quantify its own influence on the user.

---

## Further Documentation

- **[STRUCTURE_PLAN.md](STRUCTURE_PLAN.md)** — plain-language walkthrough of who uses the app, what they see, and how it fits together.
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** — get the backend and login working in ~10 minutes.
- **[WORKFLOW.md](WORKFLOW.md)** — git branching and development workflow.
