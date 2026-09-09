import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import * as outbox from '@/services/outbox';
import { saveSnapshot, loadSnapshot } from '@/services/offlineCache';

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

// A dropped/absent connection surfaces from fetch as these messages. We treat
// them as "offline" (queue the write, show optimistic state) rather than a real
// error (which must still surface, e.g. an RLS rejection).
function isOfflineError(e: unknown): boolean {
  const msg = ((e as { message?: string })?.message ?? '').toString();
  return /network request failed|failed to fetch|network error|timed? ?out|unable to resolve host|connection|Load failed/i.test(msg);
}

// The exact display state the provider shows. Cached per user so the app is
// fully viewable offline, and hydrated verbatim (no network, no re-derivation).
interface Snapshot {
  diaryEntries: DiaryEntriesByDate;
  spendingLimit: number;
  spendingSummary: SpendingSummary | null;
  currentSpend: number;
  weeklySpendBars: number[];
  topGamblingApps: RankedApp[];
  usageBand: UsageBand;
  usageLogs: GamblingUsageLog[];
  influence: InfluenceResult | null;
  assessmentResults: AssessmentScore[];
  theoreticalBehaviorPlan: TBPStep[];
  streak: number;
  streakMarked: boolean;
  weeklyCheckinDue: boolean;
  readinessStage: ReadinessStage;
  moralReasoningLevel: MoralReasoningLevel;
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

  // Pull everything the signed-in user needs from the backend and assemble the
  // display snapshot. Throws if the network is unavailable - the caller then
  // falls back to the cached snapshot so the app stays fully viewable offline.
  const fetchSnapshot = async (userId: string): Promise<Snapshot> => {
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
        userId, weekStart, latestPgsi, currentWeekSpend, currentWeekOpens,
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

    return {
      diaryEntries: groupByDate(entries),
      spendingLimit: limitAmount,
      spendingSummary: summary,
      currentSpend: summary.current,
      weeklySpendBars: weekBars,
      topGamblingApps: rankApps(usage),
      usageBand: classifyUsage(averageOpensPerDay(totalOpens, 7)),
      usageLogs: usage,
      influence: influenceResult,
      assessmentResults: assessments,
      theoreticalBehaviorPlan: steps,
      streak: streakState.currentCount,
      streakMarked: streakState.markedToday,
      weeklyCheckinDue: checkinDue,
      readinessStage: (theory?.readinessStage as ReadinessStage) ?? 'contemplation',
      moralReasoningLevel: (theory?.moralReasoningLevel as MoralReasoningLevel) ?? 'pre-conventional',
    };
  };

  // Push the snapshot into React state (used for both a fresh fetch and an
  // offline cache hydrate).
  const applySnapshot = (s: Snapshot) => {
    setDiaryEntries(s.diaryEntries);
    setSpendingLimit(s.spendingLimit);
    setSpendingSummary(s.spendingSummary);
    setCurrentSpend(s.currentSpend);
    setWeeklySpendBars(s.weeklySpendBars);
    setTopGamblingApps(s.topGamblingApps);
    setUsageBand(s.usageBand);
    setUsageLogs(s.usageLogs);
    setInfluence(s.influence);
    setAssessmentResults(s.assessmentResults);
    setTheoreticalBehaviorPlan(s.theoreticalBehaviorPlan);
    setStreak(s.streak);
    setStreakMarked(s.streakMarked);
    setWeeklyCheckinDue(s.weeklyCheckinDue);
    setReadinessStage(s.readinessStage);
    setMoralReasoningLevel(s.moralReasoningLevel);
  };

  // Replay one queued offline write against the backend. Throws on failure so
  // the outbox stops and retries later (see outbox.flush).
  const replay = async (op: outbox.OutboxOp) => {
    const p = op.payload as Record<string, any>;
    switch (op.type) {
      case 'diary.add':
        await diaryService.addDiaryEntry(p.userId, p.mood, p.note, p.date); break;
      case 'streak.mark':
        await streakService.markStreakDay(p.userId, p.clean); break;
      case 'spend.log':
        await spendingService.logSpend(p.userId, p.amount, p.note); break;
      case 'spend.limit':
        await spendingService.setSpendingLimit(p.userId, { limitAmount: p.limitAmount, period: 'monthly', currency: 'PHP' }); break;
      case 'usage.open':
        await usageService.logGamblingOpen(p.userId, p.appName, p.date); break;
      case 'checkin.submit':
        await checkinService.submitWeeklyCheckin(p.userId, p.responses, p.score); break;
      case 'pgsi.submit':
        await assessmentService.submitAssessment(p.userId, SEED_IDS.pgsiInstrument, p.totalScore, p.riskLevel, p.category, p.isBaseline, p.items); break;
      default:
        break; // unknown op type - treat as done so it doesn't wedge the queue
    }
  };

  // Try to sync any queued offline writes. Safe to call anytime: no-op when the
  // queue is empty, and stops quietly if still offline.
  const flushOutbox = () => outbox.flush(replay);

  // Load everything the signed-in user needs. Flushes pending offline writes
  // first, fetches fresh data, and caches it; if the fetch fails (offline), the
  // last cached snapshot is shown instead so the app never comes up empty.
  const refresh = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await flushOutbox();
      const snap = await fetchSnapshot(user.id);
      applySnapshot(snap);
      void saveSnapshot(user.id, snap);
    } catch {
      const cached = await loadSnapshot<Snapshot>(user.id);
      if (cached) applySnapshot(cached);
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

  // Auto-sync: whenever the app returns to the foreground, push any writes that
  // were queued while offline and pull fresh data. refresh() flushes the outbox
  // first, so coming back online (or just reopening the app) syncs everything.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && user) refresh();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addDiaryEntry = async (mood: string, note: string) => {
    if (!user) return;
    const date = todayKey();
    try {
      await diaryService.addDiaryEntry(user.id, mood, note, date);
      await refresh();
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('diary.add', { userId: user.id, mood, note, date });
      // Optimistic: show the entry now; it syncs to the server when back online.
      const entry: DiaryEntry = { id: `local-${Date.now()}`, mood, note, date, createdAt: new Date().toISOString() };
      setDiaryEntries((prev) => ({ ...prev, [date]: [...(prev[date] ?? []), entry] }));
    }
  };

  const updateSpendingLimit = async (limit: number) => {
    if (!user) return;
    try {
      await spendingService.setSpendingLimit(user.id, { limitAmount: limit, period: 'monthly', currency: 'PHP' });
      await refresh();
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('spend.limit', { userId: user.id, limitAmount: limit });
      setSpendingLimit(limit);
      // Keep the recorded spend; just reflect the new limit until the next sync.
      setSpendingSummary((prev) => (prev ? { ...prev, limit } : prev));
    }
  };

  const logSpend = async (amount: number, note?: string) => {
    if (!user) return;
    try {
      await spendingService.logSpend(user.id, amount, note);
      await refresh();
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('spend.log', { userId: user.id, amount, note });
      setCurrentSpend((prev) => prev + amount);
    }
  };

  const logGamblingOpen = async (appName: string) => {
    if (!user) return;
    const date = todayKey();
    try {
      await usageService.logGamblingOpen(user.id, appName, date);
      await refresh();
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('usage.open', { userId: user.id, appName, date });
    }
  };

  // Persist today's outcome: clean extends the streak, a slip resets it.
  const markStreak = async (clean: boolean) => {
    if (!user) return;
    try {
      const state = await streakService.markStreakDay(user.id, clean);
      setStreak(state.currentCount);
      setStreakMarked(true);
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('streak.mark', { userId: user.id, clean });
      setStreak((prev) => (clean ? prev + 1 : 0));
      setStreakMarked(true);
    }
  };

  const submitWeeklyCheckin = async (responses: Record<string, number>, score: number) => {
    if (!user) return;
    try {
      await checkinService.submitWeeklyCheckin(user.id, responses, score);
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('checkin.submit', { userId: user.id, responses, score });
    }
    setWeeklyCheckinDue(false);
  };

  // Score and persist a full 9-item PGSI run (per-item responses included).
  const submitPGSI = async (pointValues: number[], isBaseline = false) => {
    if (!user) return;
    const result = scorePGSI(pointValues);
    const items = pointValues.map((value, i) => ({ itemId: SEED_IDS.pgsiItems[i], value }));
    try {
      await assessmentService.submitAssessment(
        user.id, SEED_IDS.pgsiInstrument, result.totalScore, result.riskLevel, result.category, isBaseline, items,
      );
      setAssessmentResults(await assessmentService.getAssessments());
    } catch (e) {
      if (!isOfflineError(e)) throw e;
      await outbox.enqueue('pgsi.submit', {
        userId: user.id, totalScore: result.totalScore, riskLevel: result.riskLevel,
        category: result.category, isBaseline, items,
      });
      // Optimistic: newest first, so screens read this as the latest score.
      const optimistic: AssessmentScore = {
        id: `local-${Date.now()}`,
        instrumentName: 'PGSI',
        instrumentVersion: '1',
        totalScore: result.totalScore,
        riskLevel: result.riskLevel,
        category: result.category,
        isBaseline,
        completedAt: new Date().toISOString(),
      };
      setAssessmentResults((prev) => [optimistic, ...prev]);
    }
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
