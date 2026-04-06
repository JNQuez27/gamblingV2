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
