'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SpendingRecord {
  id: string;
  amount: number;
  commodity: string;
  timestamp: Date;
  notes?: string;
  opportunityCost?: string;
}

export interface MoodRecord {
  id: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  urge: number; // 1-10 scale
  timestamp: Date;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  totalDaysFree: number;
  joinDate: Date;
  selectedInterests: string[];
}

export interface StreakMilestone {
  days: number;
  unlocked: boolean;
  date?: Date;
  title: string;
  description: string;
}

export interface AppContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  spending: SpendingRecord[];
  addSpending: (record: Omit<SpendingRecord, 'id'>) => void;
  removeSpending: (id: string) => void;
  moods: MoodRecord[];
  addMood: (record: Omit<MoodRecord, 'id'>) => void;
  updateStreak: (increment: boolean) => void;
  milestones: StreakMilestone[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>({
    name: 'Juan',
    email: 'juan@example.com',
    currentStreak: 23,
    longestStreak: 45,
    totalDaysFree: 67,
    joinDate: new Date('2024-01-01'),
    selectedInterests: ['Mindfulness', 'Fitness', 'Health'],
  });

  const [spending, setSpending] = useState<SpendingRecord[]>([
    {
      id: '1',
      amount: 50,
      commodity: 'Coffee',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Daily habit',
    },
    {
      id: '2',
      amount: 120,
      commodity: 'Subscription Services',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Streaming services',
    },
    {
      id: '3',
      amount: 200,
      commodity: 'Entertainment',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: 'Weekend activities',
    },
  ]);

  const [moods, setMoods] = useState<MoodRecord[]>([
    {
      id: '1',
      mood: 'good',
      urge: 3,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Feeling positive',
    },
    {
      id: '2',
      mood: 'okay',
      urge: 5,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Standard day',
    },
  ]);

  const [milestones, setMilestones] = useState<StreakMilestone[]>([
    {
      days: 7,
      unlocked: true,
      date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      title: 'Week Warrior',
      description: '7 days gambling-free',
    },
    {
      days: 30,
      unlocked: true,
      date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      title: 'Month Master',
      description: '30 days gambling-free',
    },
    {
      days: 100,
      unlocked: false,
      title: 'Century Champion',
      description: '100 days gambling-free',
    },
    { days: 365, unlocked: false, title: 'Year of Strength', description: '1 year gambling-free' },
  ]);

  const addSpending = (record: Omit<SpendingRecord, 'id'>) => {
    setSpending([...spending, { ...record, id: Date.now().toString() }]);
  };

  const removeSpending = (id: string) => {
    setSpending(spending.filter((s) => s.id !== id));
  };

  const addMood = (record: Omit<MoodRecord, 'id'>) => {
    setMoods([...moods, { ...record, id: Date.now().toString() }]);
  };

  const updateStreak = (increment: boolean) => {
    if (increment) {
      setUser({
        ...user,
        currentStreak: user.currentStreak + 1,
        longestStreak: Math.max(user.currentStreak + 1, user.longestStreak),
        totalDaysFree: user.totalDaysFree + 1,
      });
    } else {
      setUser({
        ...user,
        currentStreak: 0,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        spending,
        addSpending,
        removeSpending,
        moods,
        addMood,
        updateStreak,
        milestones,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
