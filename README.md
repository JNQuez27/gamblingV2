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
│   ├── auth-screen.tsx
│   ├── bottom-nav.tsx
│   ├── convert-card.tsx
│   ├── home-dashboard.tsx
│   ├── interest-selection.tsx
│   ├── onboarding.tsx
│   ├── profile-screen.tsx
│   ├── progress-indicators.tsx
│   ├── reality-check.tsx
│   ├── theme-provider.tsx
│   └── ui/
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
- **/hooks**: Custom React hooks for shared logic.
- **/lib**: Utility functions and libraries.
- **/styles**: Global styles.

## Workflow

The application appears to be a mobile-first gambling or gaming application with the following user flow:

1.  **Onboarding**: New users are guided through an `onboarding` process.
2.  **Authentication**: Users log in or sign up via the `auth-screen`.
3.  **Interest Selection**: Users may be prompted to select their interests (`interest-selection`).
4.  **Home Dashboard**: The main screen of the application (`home-dashboard`) where users can access core features.
5.  **Profile**: Users can view and manage their profile on the `profile-screen`.
6.  **Features**:
    - `convert-card`: Likely related to converting points, credits, or currency.
    - `reality-check`: A feature to promote responsible gambling.
    - `progress-indicators`: To show user progress or achievements.
7.  **Navigation**: A `bottom-nav` component is used for primary navigation.

## Components

The application is composed of several key components:

- **Screen Components**: `auth-screen.tsx`, `home-dashboard.tsx`, `onboarding.tsx`, `profile-screen.tsx`, etc. These are top-level components for different screens.
- **UI Components**: Located in `components/ui/`, these are smaller, reusable components like `Button`, `Card`, `Input`, etc.
- **Navigation**: `bottom-nav.tsx` provides the main navigation for the app.
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
