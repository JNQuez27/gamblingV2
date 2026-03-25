'use client';

import { useState } from 'react';
import { Onboarding } from '@/components/onboarding';
import { AuthScreen } from '@/components/auth-screen';
import { InterestSelection } from '@/components/interest-selection';
import { MainApp } from '@/components/main-app';
import { AppProvider } from '@/context/app-context';

type AppState = 'onboarding' | 'auth' | 'interests' | 'home';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('onboarding');

  if (appState === 'onboarding') {
    return <Onboarding onComplete={() => setAppState('auth')} />;
  }

  if (appState === 'auth') {
    return <AuthScreen onComplete={() => setAppState('interests')} />;
  }

  if (appState === 'interests') {
    return <InterestSelection onComplete={() => setAppState('home')} />;
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
