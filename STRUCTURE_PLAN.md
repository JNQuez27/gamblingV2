# BettingLog — Structure Plan

> A plain-language companion to the [README](README.md).
> The README is the technical spec; this file explains **who uses the app, what
> they see, where the data lives, and how it all fits together** — in the
> simplest terms possible.

---

## 1. Who is this for?

BettingLog is for **everyday people in the Philippines who feel their gambling
is getting away from them** and want to understand and control it. It is not for
casinos, not for "responsible gaming" compliance, and not a general wellness
app. One user, one phone, one goal: awareness that leads to control.

Three people we keep in mind while building:

| Persona | What they need | What they fear |
|---|---|---|
| **Marco, 28 — "just checking"** | A private, non-judgmental way to see how much he really spends | Being lectured or labeled an "addict" |
| **Rina, 35 — "already worried"** | Concrete numbers and a plan she can follow | That it's too late, or too complicated |
| **A concerned family member** | Something they can hand to a loved one that won't scare them off | Pushing them further away |

**Design consequence:** every screen informs, never shames. We show numbers and
choices, not warnings and guilt.

---

## 2. The big picture (how it works in one paragraph)

The user reports what they do — money spent, gambling apps opened, how they feel
— and answers a short validated questionnaire. The app turns that raw behavior
into **meaning**: a risk score, the real-world cost of the money ("that's a
month of groceries"), how strong the habit is getting, and a step-by-step plan.
Every week it re-measures and shows whether things are getting better. Because
we capture a **baseline** the first day, the app can always answer the key
question: *"is this actually helping, and by how much?"*

```
 you report   →   app makes sense of it   →   you see progress   →   repeat weekly
 (spend,          (score, cost, habit         (charts, streak,
  opens,           strength, plan)             influence index)
  mood, quiz)
```

---

## 3. What the user sees (UI/UX)

### 3.1 The journey, first launch to daily use

```
Splash (3 calm slides)
   → Login / Sign up  (email + password, or Google)
        → Onboarding (new users only)
             1. "What brings you here?"   → your problem, in your words
             2. "Which apps do you use?"  → pick from PH presets
             3. "A quick baseline"        → short questionnaire → BASELINE saved
        → Home  (returning users land here directly)
```

The baseline is the most important moment: whatever the user's scores are on
day one become the line every future week is compared against.

### 3.2 The four tabs (the everyday app)

The app lives in a bottom tab bar. Four places, each with one job:

| Tab | One-line job | Key things on it |
|---|---|---|
| **Home** | "How am I doing today?" | Streak, a math-engine insight card, quick actions |
| **Diary** | "How do I feel?" | Mood + a short written reflection, past entries |
| **Learn** | "Help me understand" | Short psychoeducation articles and quick practices |
| **Profile** | "Show me the proof" | Trends charts, risk history, the plan (TBP), consultation |

Settings is reached from Profile and holds: edit profile, spending limit,
notifications, and privacy.

### 3.3 Design rules (so it always feels the same)

- **Calm palette.** Soft blues and greens, never alarm-red as decoration. Red is
  reserved for a real over-limit moment.
- **One phone, portrait, ≤ 430px wide.** Big tap targets (48px), generous
  spacing.
- **Never a blank screen.** Data loads behind skeletons.
- **Plain language.** "You opened betting apps 8× this week" beats "usage
  frequency: 8." Numbers always come with what they *mean*.

---

## 4. Where the data lives (database)

Everything is stored in **Supabase (PostgreSQL)**. There is no separate backend
server — the app talks to Supabase directly through a thin service layer.

### 4.1 The tables, grouped by what they're for

```
WHO YOU ARE            profiles · streaks
WHAT YOU FEEL          diary_entries
WHAT WE MEASURE        instruments · instrument_items · instrument_validators
                       assessment_sessions · assessment_responses
                       weekly_checkins · influence_snapshots
YOUR PLAN              tbp_steps
YOUR MONEY             spending_limits · spending_logs
YOUR HABIT             gambling_apps · gambling_usage_logs
TALKING IT OUT         consultation_sessions · consultation_messages
THE PAPER TRAIL        action_history        (every meaningful action, logged)
NUDGES                 notification_logs · notification_preferences
READING MATERIAL       articles · quick_practices   (admin-written, read-only)
```

### 4.2 How the tables relate (the important links)

```
auth.users (Supabase Auth)
    │  one-to-one
    ├── profiles          (readiness stage, moral level, the "why")
    ├── streaks
    └── spending_limits

auth.users
    │  one-to-many
    ├── diary_entries
    ├── spending_logs
    ├── gambling_usage_logs ── (optional link) ─→ gambling_apps
    ├── assessment_sessions ── has many ─→ assessment_responses ─→ instrument_items
    ├── weekly_checkins
    ├── influence_snapshots
    ├── tbp_steps
    └── consultation_sessions ── has many ─→ consultation_messages
```

### 4.3 The one security rule that matters

Every table that belongs to a user has **Row-Level Security** turned on with the
same rule:

> You can only read or write a row if **its `user_id` equals your logged-in id.**

That single rule means one user can never see another's data, even though
everyone shares the same database. Reading material (`articles`,
`quick_practices`, `instruments`) is the exception — it's public read-only,
written only by an admin in the Supabase dashboard.

---

## 5. How a single action flows through the app

Example: **the user logs ₱500 spent.**

```
1. UI            Spending screen calls logSpend(500)
2. Hook          useSpending() forwards it to the app state
3. Service       spending.service.ts inserts a row into spending_logs
4. Supabase      RLS checks user_id == you, saves the row
5. Refresh       app state re-reads logs
6. Utility       spendingEngine.ts recomputes the summary
                 (current, % of limit, isCritical, isOverLimit)
7. Utility       mathEngine.ts turns the number into meaning
                 ("₱6,000 this month ≈ 1 month of groceries")
8. UI            Home + Spending screens re-render with the new numbers
```

The important idea: **screens never touch the database.** They call hooks →
hooks read app state → app state calls services → services are the only code
that talks to Supabase. And all the *thinking* (is this too much? what does it
mean?) happens in small **pure utility functions** that are easy to test on
their own.

---

## 6. The three "engines" (where the smarts live)

These are plain functions in `src/utils/`. No database, no UI — just input in,
answer out. They are built and tested **before** the screens that use them.

| Engine | Question it answers | Example output |
|---|---|---|
| **spendingEngine** | Am I within my limit? | "85% used, ₱750 left, critical" |
| **thresholdEngine** | Is my app-opening *too much*? | "6 opens/day → High — strong reinforcement" |
| **mathEngine** | What does this money/number mean? | "₱6,000 ≈ 1 month of groceries" |
| **scoring** | How risky is my gambling? | "PGSI 9 → Problem gambling" |
| **influence** | Is the app actually helping? | "37% improvement vs. your first week" |
| **ranking** | Which apps pull me most? | "Top 3: BingoPlus, ArenaPlus, Lotto" |
| **trends** | What's my trajectory? | series of points the charts draw |

---

## 7. How we know it's working (the feedback loop)

This is what makes BettingLog more than a tracker. Every week:

```
first week   →   BASELINE snapshot   (PGSI score, weekly spend, weekly opens)
                        │
   ... user uses the app for a while ...
                        │
this week    →   CURRENT snapshot
                        │
                influence engine compares the two
                        │
                "Your risk is down 30%, spending down 45%,
                 opens down 20% → influence index 32%"
```

Those numbers are shown to the user as encouragement — and they double as the
app's own evaluation data. If the app isn't moving the numbers, we know, and we
fix it.

---

## 8. Folder map (where to find things)

```
bettinglog-rn/
├── app/            the screens the user sees (Expo Router = file-based)
│   ├── onboarding/   problem · gambling-apps · baseline
│   ├── (tabs)/       home · diary · learn · profile
│   └── settings/     edit-profile · spending-limit · notifications · privacy
├── src/
│   ├── services/     the ONLY place Supabase is called
│   ├── utils/        the pure engines (built + tested first)
│   ├── core/         app state (providers) + hooks screens use
│   └── types/        the shapes of the data
├── constants/        colors · PH gambling-app presets
└── supabase/
    └── migrations/   the database itself, as SQL
```

**Rule of thumb when adding a feature:** type → table (with RLS) → service →
utility (if there's logic) → hook → screen. Build the screen last. If a feature
doesn't map to one of the app's theories (see README §2), reconsider it.

---

## 9. What's intentionally simple (and why)

We removed a lot from earlier drafts to keep this maintainable by a small team:

- **No separate backend server.** Supabase is the backend. One less thing to run,
  deploy, and secure.
- **Android only.** No iOS/Apple code paths to double-maintain.
- **No Prisma, Redis, or monorepo.** A single app with a service layer is enough.
- **Self-reported data only.** A phone app cannot legally watch which other apps
  you open, so we don't pretend to — the user tells us, optionally with AI help
  classifying a name or URL they paste in.

Simple on purpose. Every removed layer is a layer that can't break.
