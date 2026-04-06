# Gambling Application

## Overview

Gambling Application is a mobile-first awareness platform that helps users reflect on habits, track diary entries, and explore learning content. It provides a web app built with Next.js for browser access and a React Native (Expo) mobile app for on-the-go use.

## Project Structure

```
.
├── reflect-rn/                 # React Native (Expo) mobile app
│   ├── app/
│   ├── constants/
│   └── ...
├── src/                        # Next.js web app
│   ├── app/
│   │   ├── context/
│   │   ├── diary/
│   │   ├── home/
│   │   ├── learn/
│   │   ├── login/
│   │   ├── preferences/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── splash/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── ui/
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
└── tsconfig.json
```

## Workflow

1. Authentication and onboarding (splash, login, preferences).
2. Main navigation across Home, Diary, Learn, Profile, and Settings.
3. Content and insights tailored to the user selections and activity.

## Recently Completed

- [x] Global CSS variables for the full design palette (soft blue, muted green, peach accent, dark gray text)
- [x] Updated root layout with app title "Reflect — Behavior Awareness App"
- [x] Root page redirects to `/splash`
- [x] Splash screen (3 animated slides: Awareness, Reflection, Better Choices) with SVG illustrations
- [x] Login/Sign-Up screen with OAuth (Google, Apple) + email/password toggle
- [x] Home dashboard with greeting, Reality Check insight card, weekly streak tracker (circular indicators), streak CTA button, reflection prompt, quick actions, recent insights
- [x] Profile screen with avatar, stat cards, weekly activity bar chart, achievements grid
- [x] Settings screen with account management, notification toggles, privacy toggles, general options, logout/delete
- [x] Diary screen with mood selector (emoji), compose panel, past entries list with tags
- [x] Learn screen with category filters, quick practices, featured articles
- [x] Bottom navigation component (Home, Diary, Learn, Profile) with active state highlighting
- [x] All lint errors resolved (moved inner components to module scope, fixed Math.random in useState initializer)
- [x] Reorganized Diary feature folders (layout/map/notes/legacy) with constants/types/utils split
- [x] Moved BottomNav to ui/navigation with a re-export shim
- [x] Added .env.example files for Next.js and Expo with safe placeholders
- [x] Clarified .env ignore note in .gitignore
- [x] Refined Diary map current-day node fill color to better match the system palette
- [x] Replaced Apple OAuth with Facebook on web + React Native login screens
- [x] Fixed Home folder build errors and centered the notifications panel to avoid overflow
- [x] Synced Diary streak counter logic with Home weekly streak calculations
- [x] Refactored Profile into data/styles/utils + tab components
- [x] Refactored Settings into data/styles + shared components and cleaned subpages

## Getting Started

### Web Application (Next.js)

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

### Mobile Application (React Native / Expo)

```bash
cd reflect-rn
npm install
npx expo start
```

Use Expo Go on a device or an emulator/simulator to run the app.
