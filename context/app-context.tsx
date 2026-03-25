'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Milestone {
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

interface User {
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  gems: number;
  avatarUrl?: string;
}

interface Spending {
  id: number;
  amount: number;
  category: string;
  timestamp: Date;
  notes?: string;
}

interface DiaryEntry {
  mood: string;
  note: string;
  timestamp: string;
}

interface Mood {
  id: number;
  mood: string;
  urge: number;
  timestamp: Date;
  notes?: string;
}

interface AppContextType {
  milestones: Milestone[];
  user: User;
  streak: number;
  spending: Spending[];
  addSpending: (spending: Omit<Spending, 'id'>) => void;
  removeSpending: (id: number) => void;
  moods: Mood[];
  addMood: (mood: Omit<Mood, 'id'>) => void;
  diaryEntries: Record<string, DiaryEntry>;
  setDiaryEntries: React.Dispatch<React.SetStateAction<Record<string, DiaryEntry>>>;
  pausedDays: string[];
  setPausedDays: React.Dispatch<React.SetStateAction<string[]>>;
  setScreen: (screen: string) => void;
  setStreak: (streak: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppWrapper({ children }: { children: ReactNode }) {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      title: '1 Day',
      description: 'You made it through the first day!',
      unlocked: true,
      date: '2024-01-01',
    },
    {
      title: '3 Days',
      description: 'Three days of progress!',
      unlocked: true,
      date: '2024-01-03',
    },
    {
      title: '1 Week',
      description: 'One week of commitment!',
      unlocked: false,
    },
    {
      title: '2 Weeks',
      description: 'Two weeks strong!',
      unlocked: false,
    },
    {
      title: '1 Month',
      description: 'One month of dedication!',
      unlocked: false,
    },
  ]);

  const [user, setUser] = useState<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currentStreak: 5,
    longestStreak: 10,
    gems: 100,
    avatarUrl: 'https://github.com/shadcn.png',
  });

  const [spending, setSpending] = useState<Spending[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<Record<string, DiaryEntry>>({});
  const [pausedDays, setPausedDays] = useState<string[]>([]);
  const [activeScreen, setActiveScreen] = useState('home');

  const addSpending = (newSpending: Omit<Spending, 'id'>) => {
    setSpending([...spending, { ...newSpending, id: Date.now() }]);
  };

  const removeSpending = (id: number) => {
    setSpending(spending.filter((s) => s.id !== id));
  };

  const addMood = (newMood: Omit<Mood, 'id'>) => {
    setMoods([...moods, { ...newMood, id: Date.now() }]);
  };

  const setStreak = (newStreak: number) => {
    setUser((prevUser) => ({ ...prevUser, currentStreak: newStreak }));
  };

  return (
    <AppContext.Provider
      value={{
        milestones,
        user,
        streak: user.currentStreak,
        spending,
        addSpending,
        removeSpending,
        moods,
        addMood,
        diaryEntries,
        setDiaryEntries,
        pausedDays,
        setPausedDays,
        setScreen: setActiveScreen,
        setStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppWrapper');
  }
  return context;
}
