import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

import type { DiaryEntriesByDate, DiaryEntry } from '@/types/diary';
import type { SpendingSummary } from '@/types/spending';
import type { AssessmentScore, ReadinessStage, MoralReasoningLevel, TBPStep } from '@/types/psychology';
import type { GamblingUsageLog, RankedApp, UsageBand } from '@/types/usage';
import type { InfluenceResult } from '@/types/influence';

import * as diaryService from '@/services/diary.service';
import * as spendingService from '@/services/spending.service';
import * as usageService from '@/services/usage.service';
import * as assessmentService from '@/services/assessment.service';
import * as tbpService from '@/services/tbp.service';
import * as streakService from '@/services/streak.service';
import * as checkinService from '@/services/checkin.service';
import * as influenceService from '@/services/influence.service';
import { getTheoryProfile } from '@/services/auth.service';
import { startMonitoring, stopMonitoring } from '@/services/gamblingDetection.service';

import { buildSpendingSummary, weeklySpendByDay } from '@/utils/spendingEngine';
import { rankApps } from '@/utils/ranking';
import { averageOpensPerDay, classifyUsage } from '@/utils/thresholdEngine';
import { defaultTBPSteps } from '@/utils/tbpTemplates';
import { scorePGSI } from '@/utils/scoring';
import { computeInfluence } from '@/utils/influence';
import { todayKey, daysBetween, weekStartKey } from '@/utils/date';
import { SEED_IDS } from '@/constants/seedIds';

// The whole app's feature state and the actions that change it. Screens read
// this through hooks - they never call services or Supabase directly.
interface AppContextValue {
  isLoading: boolean;

  // Theory-driven profile
  readinessStage: ReadinessStage;
  moralReasoningLevel: MoralReasoningLevel;

  // Streak
  streak: number;
  streakMarked: boolean;
  markStreak: (clean: boolean) => Promise<void>;

  // Diary
  diaryEntries: DiaryEntriesByDate;
  addDiaryEntry: (mood: string, note: string) => Promise<void>;

  // Spending
  spendingLimit: number;
  currentSpend: number;
  spendingSummary: SpendingSummary | null;
  weeklySpendBars: number[];          // ₱ per day, Mon..Sun of the current week
  updateSpendingLimit: (limit: number) => Promise<void>;
  logSpend: (amount: number, note?: string) => Promise<void>;

  // Gambling usage
  topGamblingApps: RankedApp[];
  usageBand: UsageBand;               // Law-of-Exercise band over the last 7 days
  usageLogs: GamblingUsageLog[];      // raw open events (visit history)
  logGamblingOpen: (appName: string) => Promise<void>;

  // App influence (README §10.4) - first tracked week vs now; null until
  // there is at least one full week of history to compare against.
  influence: InfluenceResult | null;

  // Assessments
  assessmentResults: AssessmentScore[];
  latestAssessment: AssessmentScore | undefined;
  submitPGSI: (pointValues: number[], isBaseline?: boolean) => Promise<void>;

  // Weekly check-in
  weeklyCheckinDue: boolean;
  submitWeeklyCheckin: (responses: Record<string, number>, score: number) => Promise<void>;

  // TBP - the plan belongs to the user: they can seed the suggested steps,
  // add their own, change status, or remove steps entirely.
  theoreticalBehaviorPlan: TBPStep[];
  startBehaviorPlan: () => Promise<void>;
  setTBPStepStatus: (id: string, status: TBPStep['status']) => Promise<void>;
  addBehaviorStep: (title: string, description?: string) => Promise<void>;
  removeBehaviorStep: (id: string) => Promise<void>;
  clearBehaviorPlan: () => Promise<void>;

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
  weeklySpendBars: Array(7).fill(0),
  updateSpendingLimit: async () => {},
  logSpend: async () => {},
  topGamblingApps: [],
  usageBand: 'controlled',
  usageLogs: [],
  logGamblingOpen: async () => {},
  influence: null,
  assessmentResults: [],
  latestAssessment: undefined,
  submitPGSI: async () => {},
  weeklyCheckinDue: false,
  submitWeeklyCheckin: async () => {},
  theoreticalBehaviorPlan: [],
  startBehaviorPlan: async () => {},
  setTBPStepStatus: async () => {},
  addBehaviorStep: async () => {},
  removeBehaviorStep: async () => {},
  clearBehaviorPlan: async () => {},
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

// Inner provider - assumes AuthProvider is already above it in the tree.
const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntriesByDate>({});
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [spendingSummary, setSpendingSummary] = useState<SpendingSummary | null>(null);
  const [currentSpend, setCurrentSpend] = useState(0);
  const [weeklySpendBars, setWeeklySpendBars] = useState<number[]>(Array(7).fill(0));
  const [topGamblingApps, setTopGamblingApps] = useState<RankedApp[]>([]);
  const [usageBand, setUsageBand] = useState<UsageBand>('controlled');
  const [usageLogs, setUsageLogs] = useState<GamblingUsageLog[]>([]);
  const [influence, setInfluence] = useState<InfluenceResult | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentScore[]>([]);
  const [theoreticalBehaviorPlan, setTheoreticalBehaviorPlan] = useState<TBPStep[]>([]);
  const [streak, setStreak] = useState(0);
  const [streakMarked, setStreakMarked] = useState(false);
  const [weeklyCheckinDue, setWeeklyCheckinDue] = useState(false);
  const [readinessStage, setReadinessStage] = useState<ReadinessStage>('contemplation');
  const [moralReasoningLevel, setMoralReasoningLevel] =
    useState<MoralReasoningLevel>('pre-conventional');

  // Live accessors for the detection pipeline: startMonitoring captures the
  // context once, so we hand it refs (kept fresh below) rather than stale
  // snapshots, so a nudge always uses the user's current numbers.
  const spendingSummaryRef = useRef<SpendingSummary | null>(null);
  const streakRef = useRef(0);
  useEffect(() => { spendingSummaryRef.current = spendingSummary; }, [spendingSummary]);
  useEffect(() => { streakRef.current = streak; }, [streak]);

  // Load everything the signed-in user needs. Kept as one call so screens can
  // pull-to-refresh without knowing which services exist.
  const refresh = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [entries, limit, logs, usage, assessments, steps, streakState, checkinDue, theory] =
        await Promise.all([
          diaryService.getDiaryEntries(),
          spendingService.getSpendingLimit(),
          spendingService.getSpendingLogs(),
          usageService.getUsageLogs(),
          assessmentService.getAssessments(),
          tbpService.getTBPSteps(),
          streakService.getStreak(),
          checkinService.isCheckinDue(),
          getTheoryProfile(),
        ]);

      const limitAmount = limit?.limitAmount ?? 0;
      const summary = buildSpendingSummary(limitAmount, logs, limit?.currency ?? 'PHP');

      // Law of Exercise: how reinforced is the opening habit right now?
      // Average opens/day over the trailing 7 days (by current date).
      const today = todayKey();
      const last7 = usage.filter(
        (u) => daysBetween(u.loggedDate, today) >= 0 && daysBetween(u.loggedDate, today) < 7,
      );
      const totalOpens = last7.reduce((sum, u) => sum + u.openCount, 0);
      setUsageBand(classifyUsage(averageOpensPerDay(totalOpens, 7)));

      const weekBars = weeklySpendByDay(logs);

      // §10.4 - stock this week's metrics in influence_snapshots, then compare
      // the first tracked week against now. A failure here (offline, migration
      // not applied) must never break the refresh - the card just shows its
      // "building your baseline" state.
      let influenceResult: InfluenceResult | null = null;
      try {
        const weekStart = weekStartKey();
        const currentWeekOpens = usage
          .filter((u) => {
            const offset = daysBetween(weekStart, u.loggedDate);
            return offset >= 0 && offset < 7;
          })
          .reduce((sum, u) => sum + u.openCount, 0);
        const currentWeekSpend = weekBars.reduce((sum, v) => sum + v, 0);
        const latestPgsi = assessments[0]?.totalScore ?? null;

        await influenceService.upsertInfluenceSnapshot(
          user.id, weekStart, latestPgsi, currentWeekSpend, currentWeekOpens,
        );
        const snapshots = await influenceService.getInfluenceSnapshots();
        const firstWeek = snapshots[0];
        if (firstWeek && firstWeek.snapshotDate < weekStart) {
          influenceResult = computeInfluence(firstWeek, {
            pgsiScore: latestPgsi,
            weeklySpend: currentWeekSpend,
            weeklyOpenCount: currentWeekOpens,
          });
        }
      } catch {
        // snapshot unavailable - leave influence null
      }

      setDiaryEntries(groupByDate(entries));
      setSpendingLimit(limitAmount);
      setSpendingSummary(summary);
      setCurrentSpend(summary.current);
      setWeeklySpendBars(weekBars);
      setTopGamblingApps(rankApps(usage));
      setUsageLogs(usage);
      setInfluence(influenceResult);
      setAssessmentResults(assessments);
      setTheoreticalBehaviorPlan(steps);
      setStreak(streakState.currentCount);
      setStreakMarked(streakState.markedToday);
      setWeeklyCheckinDue(checkinDue);
      if (theory) {
        setReadinessStage(theory.readinessStage as ReadinessStage);
        setMoralReasoningLevel(theory.moralReasoningLevel as MoralReasoningLevel);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) refresh();
    else setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Start the gambling-detection pipeline once the user is authenticated, and
  // tear it down on sign-out / unmount. Degrades gracefully with no native
  // module present (Expo Go) - the service logs "foreground-assist mode".
  useEffect(() => {
    if (!user) return;
    startMonitoring({
      userId: user.id,
      getSpendingSummary: () => spendingSummaryRef.current,
      getStreak: () => streakRef.current,
      onDetected: () => { refresh(); },
    });
    return () => stopMonitoring();
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

  // Persist today's outcome: clean extends the streak, a slip resets it.
  const markStreak = async (clean: boolean) => {
    if (!user) return;
    const state = await streakService.markStreakDay(user.id, clean);
    setStreak(state.currentCount);
    setStreakMarked(true);
  };

  const submitWeeklyCheckin = async (responses: Record<string, number>, score: number) => {
    if (!user) return;
    await checkinService.submitWeeklyCheckin(user.id, responses, score);
    setWeeklyCheckinDue(false);
  };

  // Score and persist a full 9-item PGSI run (per-item responses included).
  const submitPGSI = async (pointValues: number[], isBaseline = false) => {
    if (!user) return;
    const result = scorePGSI(pointValues);
    await assessmentService.submitAssessment(
      user.id,
      SEED_IDS.pgsiInstrument,
      result.totalScore,
      result.riskLevel,
      result.category,
      isBaseline,
      pointValues.map((value, i) => ({ itemId: SEED_IDS.pgsiItems[i], value })),
    );
    setAssessmentResults(await assessmentService.getAssessments());
  };

  // Seed the default TPB-based plan (stage-appropriate) when none exists yet.
  const startBehaviorPlan = async () => {
    if (!user) return;
    for (const step of defaultTBPSteps(readinessStage)) {
      await tbpService.addTBPStep(user.id, step);
    }
    setTheoreticalBehaviorPlan(await tbpService.getTBPSteps());
  };

  const setTBPStepStatus = async (id: string, status: TBPStep['status']) => {
    await tbpService.updateTBPStepStatus(id, status);
    setTheoreticalBehaviorPlan(await tbpService.getTBPSteps());
  };

  const addBehaviorStep = async (title: string, description = '') => {
    if (!user) return;
    await tbpService.addTBPStep(user.id, {
      stepNumber: theoreticalBehaviorPlan.length + 1,
      title,
      description,
      status: 'pending',
    });
    setTheoreticalBehaviorPlan(await tbpService.getTBPSteps());
  };

  const removeBehaviorStep = async (id: string) => {
    await tbpService.removeTBPStep(id);
    setTheoreticalBehaviorPlan(await tbpService.getTBPSteps());
  };

  const clearBehaviorPlan = async () => {
    if (!user) return;
    await tbpService.clearTBPSteps(user.id);
    setTheoreticalBehaviorPlan([]);
  };

  const value: AppContextValue = {
    isLoading,
    readinessStage,
    moralReasoningLevel,
    streak,
    streakMarked,
    markStreak,
    diaryEntries,
    addDiaryEntry,
    spendingLimit,
    currentSpend,
    spendingSummary,
    weeklySpendBars,
    updateSpendingLimit,
    logSpend,
    topGamblingApps,
    usageBand,
    usageLogs,
    logGamblingOpen,
    influence,
    assessmentResults,
    latestAssessment: assessmentResults[0],
    submitPGSI,
    weeklyCheckinDue,
    submitWeeklyCheckin,
    theoreticalBehaviorPlan,
    startBehaviorPlan,
    setTBPStepStatus,
    addBehaviorStep,
    removeBehaviorStep,
    clearBehaviorPlan,
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
