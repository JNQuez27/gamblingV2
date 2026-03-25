# Gambling v.2 Mobile Application

This document provides a comprehensive overview of the Gambling v.2 mobile application, including its structure, components, workflow, and how to get started with development.

## Project Structure

The project is a Next.js application built with TypeScript. Here is a breakdown of the main directories:

```
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── analytics-dashboard.tsx
│   ├── auth-screen.tsx
│   ├── bottom-nav.tsx
│   ├── commodity-library.tsx
│   ├── home-dashboard.tsx
│   ├── interest-selection.tsx
│   ├── main-app.tsx
│   ├── modals.tsx
│   ├── mood-check-in.tsx
│   ├── onboarding.tsx
│   ├── profile-screen.tsx
│   ├── resource-hub.tsx
│   ├── spending-timeline.tsx
│   ├── streak-tracker.tsx
│   ├── theme-provider.tsx
│   └── ui/
├── context/
│   └── app-context.tsx
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── styles/
│   └── globals.css
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
└── tsconfig.json
```

### Directory Descriptions

- **/app**: The main application directory for a Next.js app using the App Router.
  - `layout.tsx`: The root layout for the application.
  - `page.tsx`: The main page of the application.
  - `globals.css`: Global CSS styles.
- **/components**: Contains reusable React components.
  - `ui/`: Contains general-purpose UI components, likely from a component library like shadcn/ui.
- **/context**: Contains React context providers for state management.
- **/hooks**: Custom React hooks for shared logic.
- **/lib**: Utility functions and libraries.
- **/styles**: Global styles.

## Workflow

The application is a mobile-first gambling awareness app with the following user flow:

1.  **Onboarding**: New users are guided through an `onboarding` process.
2.  **Authentication**: Users log in or sign up via the `auth-screen`.
3.  **Interest Selection**: Users may be prompted to select their interests (`interest-selection`).
4.  **Main App**: The core of the application is the `main-app`, which includes a bottom navigation bar to switch between different screens.
    - **Home Dashboard**: The main screen of the application (`home-dashboard`) where users can see their streak and other stats.
    - **Diary**: The `spending-timeline` screen where users can track their purchases.
    - **Learn**: The `commodity-library` screen where users can learn about opportunity cost.
    - **Profile**: The `profile-screen` where users can view their analytics, resources, and streaks.

## Components

The application is composed of several key components:

- **Screen Components**: `auth-screen.tsx`, `home-dashboard.tsx`, `onboarding.tsx`, `profile-screen.tsx`, etc. These are top-level components for different screens.
- **Feature Components**: `commodity-library.tsx`, `mood-check-in.tsx`, `spending-timeline.tsx`, `analytics-dashboard.tsx`, `resource-hub.tsx`, and `streak-tracker.tsx`.
- **UI Components**: Located in `components/ui/`, these are smaller, reusable components like `Button`, `Card`, `Input`, etc.
- **Navigation**: `bottom-nav.tsx` provides the main navigation for the app.
- **State Management**: `app-context.tsx` provides global state for the application.
- **Theming**: `theme-provider.tsx` manages the application's theme (e.g., light/dark mode).

## Getting Started

To run this project locally, you will need Node.js and pnpm installed.

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Run the development server:**
    ```bash
    pnpm dev
    ```

This will start the application on `http://localhost:3000`.
