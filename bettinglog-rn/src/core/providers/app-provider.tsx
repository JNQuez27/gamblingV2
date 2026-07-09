import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth-provider';

import type { DiaryEntriesByDate, DiaryEntry } from '../../types/diary';
import type { SpendingSummary } from '../../types/spending';
import type { AssessmentScore, ReadinessStage, MoralReasoningLevel, TBPStep } from '../../types/psychology';
import type { RankedApp } from '../../types/usage';

import * as diaryService from '../../services/diary.service';
import * as spendingService from '../../services/spending.service';
import * as usageService from '../../services/usage.service';
import * as assessmentService from '../../services/assessment.service';
import * as tbpService from '../../services/tbp.service';

import { buildSpendingSummary } from '../../utils/spendingEngine';
import { rankApps } from '../../utils/ranking';
import { todayKey } from '../../utils/date';

// The whole app's feature state and the actions that change it. Screens read
// this through hooks — they never call services or Supabase directly.
interface AppContextValue {
  isLoading: boolean;

  // Theory-driven profile
  readinessStage: ReadinessStage;
  moralReasoningLevel: MoralReasoningLevel;

  // Streak
  streak: number;
  streakMarked: boolean;
  markStreak: () => Promise<void>;

  // Diary
  diaryEntries: DiaryEntriesByDate;
  addDiaryEntry: (mood: string, note: string) => Promise<void>;

  // Spending
  spendingLimit: number;
  currentSpend: number;
  spendingSummary: SpendingSummary | null;
  updateSpendingLimit: (limit: number) => Promise<void>;
  logSpend: (amount: number, note?: string) => Promise<void>;

  // Gambling usage
  topGamblingApps: RankedApp[];
  logGamblingOpen: (appName: string) => Promise<void>;

  // Assessments
  assessmentResults: AssessmentScore[];
  latestAssessment: AssessmentScore | undefined;

  // TBP
  theoreticalBehaviorPlan: TBPStep[];

  refresh: () => Promise<void>;
}

const defaults: AppContextValue = {
  isLoading: true,
  readinessStage: 'contemplation',
  moralReasoningLevel: 'pre-conventional',
  streak: 0,
  streakMarked: false,
  markStreak: async () => {},
  diaryEntries: {},
  addDiaryEntry: async () => {},
  spendingLimit: 0,
  currentSpend: 0,
  spendingSummary: null,
  updateSpendingLimit: async () => {},
  logSpend: async () => {},
  topGamblingApps: [],
  logGamblingOpen: async () => {},
  assessmentResults: [],
  latestAssessment: undefined,
  theoreticalBehaviorPlan: [],
  refresh: async () => {},
};

const AppContext = createContext<AppContextValue>(defaults);

function groupByDate(entries: DiaryEntry[]): DiaryEntriesByDate {
  const grouped: DiaryEntriesByDate = {};
  for (const entry of entries) {
    (grouped[entry.date] ??= []).push(entry);
  }
  return grouped;
}

// Inner provider — assumes AuthProvider is already above it in the tree.
const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntriesByDate>({});
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [spendingSummary, setSpendingSummary] = useState<SpendingSummary | null>(null);
  const [currentSpend, setCurrentSpend] = useState(0);
  const [topGamblingApps, setTopGamblingApps] = useState<RankedApp[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentScore[]>([]);
  const [theoreticalBehaviorPlan, setTheoreticalBehaviorPlan] = useState<TBPStep[]>([]);
  const [streak] = useState(0);
  const [streakMarked, setStreakMarked] = useState(false);

  // Load everything the signed-in user needs. Kept as one call so screens can
  // pull-to-refresh without knowing which services exist.
  const refresh = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [entries, limit, logs, usage, assessments, steps] = await Promise.all([
        diaryService.getDiaryEntries(),
        spendingService.getSpendingLimit(),
        spendingService.getSpendingLogs(),
        usageService.getUsageLogs(),
        assessmentService.getAssessments(),
        tbpService.getTBPSteps(),
      ]);

      const limitAmount = limit?.limitAmount ?? 0;
      const summary = buildSpendingSummary(limitAmount, logs, limit?.currency ?? 'PHP');

      setDiaryEntries(groupByDate(entries));
      setSpendingLimit(limitAmount);
      setSpendingSummary(summary);
      setCurrentSpend(summary.current);
      setTopGamblingApps(rankApps(usage));
      setAssessmentResults(assessments);
      setTheoreticalBehaviorPlan(steps);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) refresh();
    else setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addDiaryEntry = async (mood: string, note: string) => {
    if (!user) return;
    await diaryService.addDiaryEntry(user.id, mood, note, todayKey());
    await refresh();
  };

  const updateSpendingLimit = async (limit: number) => {
    if (!user) return;
    await spendingService.setSpendingLimit(user.id, {
      limitAmount: limit,
      period: 'monthly',
      currency: 'PHP',
    });
    await refresh();
  };

  const logSpend = async (amount: number, note?: string) => {
    if (!user) return;
    await spendingService.logSpend(user.id, amount, note);
    await refresh();
  };

  const logGamblingOpen = async (appName: string) => {
    if (!user) return;
    await usageService.logGamblingOpen(user.id, appName, todayKey());
    await refresh();
  };

  const markStreak = async () => {
    setStreakMarked(true); // full streak persistence lands in Phase 2
  };

  const value: AppContextValue = {
    isLoading,
    readinessStage: 'contemplation',
    moralReasoningLevel: 'pre-conventional',
    streak,
    streakMarked,
    markStreak,
    diaryEntries,
    addDiaryEntry,
    spendingLimit,
    currentSpend,
    spendingSummary,
    updateSpendingLimit,
    logSpend,
    topGamblingApps,
    logGamblingOpen,
    assessmentResults,
    latestAssessment: assessmentResults[0],
    theoreticalBehaviorPlan,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Public provider: wraps auth around app state so both are available app-wide.
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <AppStateProvider>{children}</AppStateProvider>
  </AuthProvider>
);

export const useAppContext = () => useContext(AppContext);
export default AppProvider;
