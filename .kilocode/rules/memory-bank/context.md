# Active Context: Reflect — Behavior Awareness App

## Current State

**App Status**: ✅ All screens built and passing typecheck + lint

A full mobile-first reflection & behavior-awareness app built on the Next.js starter template. The UI is calm, minimalist, and emotionally intelligent with a soft blue/green/off-white palette.

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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Redirects to /splash | ✅ Ready |
| `src/app/splash/page.tsx` | 3-slide onboarding | ✅ Ready |
| `src/app/login/page.tsx` | Login + Sign-Up | ✅ Ready |
| `src/app/home/page.tsx` | Main dashboard | ✅ Ready |
| `src/app/diary/page.tsx` | Diary entries | ✅ Ready |
| `src/app/learn/page.tsx` | Articles + practices | ✅ Ready |
| `src/app/profile/page.tsx` | User profile + stats | ✅ Ready |
| `src/app/settings/page.tsx` | App settings | ✅ Ready |
| `src/app/diary/components/*` | Diary layout/map/notes/legacy components | ✅ Ready |
| `src/app/diary/constants/index.ts` | Diary constants | ✅ Ready |
| `src/app/diary/types/index.ts` | Diary types | ✅ Ready |
| `src/app/diary/utils/index.ts` | Diary utilities | ✅ Ready |
| `src/components/ui/navigation/BottomNav.tsx` | Bottom navigation bar | ✅ Ready |
| `src/components/ui/BottomNav.tsx` | BottomNav re-export shim | ✅ Ready |
| `src/app/globals.css` | CSS variables + global styles | ✅ Ready |

## Design System

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | #5b9bd5 | Soft blue — trust, calm |
| `--color-secondary` | #7ab89a | Muted green — growth, recovery |
| `--color-bg` | #f0f4f8 | Light gray-blue background |
| `--color-accent` | #e8b86d | Dusky yellow — positive feedback |
| `--color-text` | #2d3748 | Dark gray text (not pure black) |

## React Native (Expo) Project

A full React Native port lives in `reflect-rn/` — a separate Expo + Expo Router project.

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `reflect-rn/app/_layout.tsx` | Root Stack layout | ✅ Ready |
| `reflect-rn/app/index.tsx` | Redirects to /splash | ✅ Ready |
| `reflect-rn/app/splash.tsx` | 3-slide onboarding | ✅ Ready |
| `reflect-rn/app/login.tsx` | Login + Sign-Up | ✅ Ready |
| `reflect-rn/app/(tabs)/_layout.tsx` | Bottom tab navigator | ✅ Ready |
| `reflect-rn/app/(tabs)/home.tsx` | Home dashboard | ✅ Ready |
| `reflect-rn/app/(tabs)/diary.tsx` | Diary entries | ✅ Ready |
| `reflect-rn/app/(tabs)/learn.tsx` | Articles + practices | ✅ Ready |
| `reflect-rn/app/(tabs)/profile.tsx` | User profile + stats | ✅ Ready |
| `reflect-rn/app/settings.tsx` | App settings | ✅ Ready |
| `reflect-rn/constants/colors.ts` | Design token palette | ✅ Ready |

Tech: Expo ~53, Expo Router ~4, react-native 0.76, react-native-svg, expo-linear-gradient, TypeScript (zero errors).

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| Mar 22 2026 | Full Reflect app built — splash, login, home, profile, settings, diary, learn screens |
| Mar 22 2026 | React Native migration — full Expo + Expo Router project created in `reflect-rn/` |
