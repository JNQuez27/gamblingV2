'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DiaryEntry {
  mood: string;
  note: string;
  timestamp: string;
}

export type DiaryEntriesMap = Record<string, DiaryEntry>;

interface AppContextValue {
  streak: number;
  streakMarked: boolean;
  diaryEntries: DiaryEntriesMap;
  addDiaryEntry: (dateStr: string, entry: DiaryEntry) => void;
  markStreak: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [streak, setStreak] = useState(3);
  const [streakMarked, setStreakMarked] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntriesMap>({});

  const addDiaryEntry = useCallback((dateStr: string, entry: DiaryEntry) => {
    setDiaryEntries((prev) => ({ ...prev, [dateStr]: entry }));
  }, []);

  const markStreak = useCallback(() => {
    setStreakMarked(true);
    setStreak((prev) => prev + 1);
  }, []);

  return (
    <AppContext.Provider value={{ streak, streakMarked, diaryEntries, addDiaryEntry, markStreak }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}