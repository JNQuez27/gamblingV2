import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Path,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { useDialog } from '@/components/ui/DialogProvider';
import { peso } from '@/utils/mathEngine';
import { visitRiskLevel } from '@/utils/thresholdEngine';
import { pgsiRisk } from '@/utils/scoring';
import { isSlipNote } from '@/utils/diary';
import { todayKey, daysBetween } from '@/utils/date';
import type { TBPStatus } from '@/types/psychology';
import {
  IconFlame,
  IconBookOpen,
  IconActivity,
  IconPhone,
  IconHeart,
  IconLifeBuoy,
  IconUsers,
  IconPlus,
  IconX,
  IconCheck,
  IconCircle,
  IconCircleDot,
  IconTrophy,
  IconAward,
  IconTarget,
  IconTrendingDown,
  IconChevronRight,
  IconTrash,
} from '@/components/ui/icons';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Light-theme palette for the analytics cards (matches the rest of the app).
const Metric = {
  card: Colors.bgCard,
  cardEdge: Colors.border,
  track: '#e9eef3',
  text: Colors.text,
  muted: Colors.textMuted,
  green: Colors.secondaryDark,
  amber: '#d99a3a',
  blue: Colors.primary,
  red: '#c9433f',
};

// A circular progress ring with a value in the middle. Pure SVG so it needs no
// extra dependency. `fraction` is 0..1; `color` fills the arc.
function RingGauge({
  fraction,
  color,
  big,
  small,
  size = 120,
  stroke = 12,
}: {
  fraction: number;
  color: string;
  big: string;
  small: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(1, fraction)));
  const c = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} stroke={Metric.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <Text style={{ fontSize: 30, fontWeight: '800', color }}>{big}</Text>
      <Text style={{ fontSize: 10, fontWeight: '700', color: Metric.muted, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {small}
      </Text>
    </View>
  );
}

// A smooth weekly line chart with node dots; the peak day gets an amber dot.
// `values` are per-day amounts; the shape scales to the week's biggest day.
function WeekLineChart({ values, peakColor }: { values: number[]; peakColor: string }) {
  const VBW = 300;
  const VBH = 84;
  const pad = 14;
  const n = values.length;
  const maxV = Math.max(...values, 1);
  const x = (i: number) => pad + (i / Math.max(1, n - 1)) * (VBW - 2 * pad);
  const y = (v: number) => VBH - pad - (v / maxV) * (VBH - 2 * pad);
  const pts = values.map((v, i) => ({ cx: x(i), cy: y(v) }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ');
  const peakIdx = maxV > 0 ? values.indexOf(Math.max(...values)) : -1;
  return (
    <Svg width="100%" height={96} viewBox={`0 0 ${VBW} ${VBH}`}>
      <Defs>
        <SvgLinearGradient id="wk" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Metric.blue} />
          <Stop offset="1" stopColor={Metric.green} />
        </SvgLinearGradient>
      </Defs>
      <Path d={d} stroke="url(#wk)" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={i === peakIdx ? 5.5 : 4}
          fill={i === peakIdx ? peakColor : Metric.blue}
        />
      ))}
    </Svg>
  );
}

// Maps a PGSI risk band to a ring/accent color.
function riskColor(level?: string): string {
  if (level === 'severe') return Metric.red;
  if (level === 'moderate') return Metric.amber;
  return Metric.green;
}

const EMERGENCY = [
  { Icon: IconPhone, title: 'Emergency Hotline', sub: 'National · 911', tel: '911', tint: '#fdecec', accent: '#c9433f' },
  { Icon: IconHeart, title: 'Mental Health Crisis', sub: 'NCMH · 1553 (toll-free)', tel: '1553', tint: '#e9f5ef', accent: Colors.secondaryDark },
  { Icon: IconLifeBuoy, title: 'Gambling Support', sub: 'Talk to a counselor', tint: '#fdf4e3', accent: '#c78a2a' },
  { Icon: IconUsers, title: 'Reach a trusted person', sub: "You don't have to do this alone", tint: '#eef4fb', accent: Colors.primaryDark },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const dialog = useDialog();
  const {
    streak,
    diaryEntries,
    spendingSummary,
    weeklySpendBars,
    usageLogs,
    influence,
    latestAssessment,
    theoreticalBehaviorPlan,
    startBehaviorPlan,
    setTBPStepStatus,
    addBehaviorStep,
    removeBehaviorStep,
    clearBehaviorPlan,
  } = useAppContext();

  const [newStep, setNewStep] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [markedIds, setMarkedIds] = useState<string[]>([]);

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const diaryCount = Object.values(diaryEntries).reduce((sum, list) => sum + list.length, 0);

  // Clean rate: of the days you actually checked in, the share that were
  // bet-free (a day counts as a slip if its notes carry the honest-slip wording
  // the check-in writes - same heuristic the home week strip uses). A real ratio
  // from the user's own logs - no estimate - that survives a streak reset.
  const daysLogged = Object.values(diaryEntries);
  const cleanDays = daysLogged.filter(
    (list) => !list.some((e) => isSlipNote(e.note)),
  ).length;
  const cleanRate = daysLogged.length > 0 ? Math.round((cleanDays / daysLogged.length) * 100) : null;

  // Personal counters - computed from live state.
  const statCards = [
    { Icon: IconFlame, label: 'Bet-free streak', value: `${streak} day${streak === 1 ? '' : 's'}`, accent: '#d99a3a' },
    { Icon: IconCheck, label: 'Clean rate', value: cleanRate === null ? '–' : `${cleanRate}%`, accent: Colors.secondaryDark },
    { Icon: IconBookOpen, label: 'Diary entries', value: String(diaryCount), accent: Colors.primaryDark },
    { Icon: IconActivity, label: 'Latest PGSI', value: latestAssessment ? String(latestAssessment.totalScore) : '-', accent: '#9b6bd1' },
  ];

  // Risk gauge from the latest assessment (PGSI 0–27 → 0..1 position).
  const risk = latestAssessment
    ? {
        level: latestAssessment.category,
        score: latestAssessment.totalScore,
        position: Math.min(1, latestAssessment.totalScore / 27),
        band: pgsiRisk(latestAssessment.totalScore).riskLevel, // 'low' | 'moderate' | 'severe'
      }
    : null;

  const spending = {
    spent: spendingSummary?.current ?? 0,
    limit: spendingSummary?.limit ?? 0,
  };
  const spendPct = spending.limit > 0
    ? Math.min(100, Math.round((spending.spent / spending.limit) * 100))
    : 0;
  // Limit gauge stays green well under budget, warns amber, turns red at/over.
  const limitColor = spendPct >= 100 ? Metric.red : spendPct >= 80 ? Metric.amber : Metric.green;

  // Weekly totals from the same per-day spend data that drove the bars.
  const spentWeek = weeklySpendBars.reduce((sum, v) => sum + v, 0);
  const betFreeDays = weeklySpendBars.filter((v) => v === 0).length;

  // Gambling activity over the last 30 days, from real usage logs.
  const today = todayKey();
  const visits30 = usageLogs.filter((l) => {
    const age = daysBetween(l.loggedDate, today);
    return age >= 0 && age < 30;
  });
  const visitsTotal = visits30.reduce((sum, l) => sum + l.openCount, 0);
  const visitsToday = visits30
    .filter((l) => l.loggedDate === today)
    .reduce((sum, l) => sum + l.openCount, 0);
  const visitsHighRisk = visits30.filter(
    (l) => visitRiskLevel(l.createdAt, l.timeSpent) === 'high',
  ).length;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })
    : null;

  // Milestones - grounded, adult goals computed from real progress.
  const milestones = [
    { Icon: IconAward, title: 'One week of control', sub: '7 consecutive bet-free days', current: streak, target: 7 },
    { Icon: IconTrophy, title: 'Two-week streak', sub: '14 consecutive bet-free days', current: streak, target: 14 },
    { Icon: IconBookOpen, title: 'Consistent journaling', sub: 'Write 10 diary entries', current: diaryCount, target: 10 },
    { Icon: IconTarget, title: 'Know your score', sub: 'Complete a PGSI self-assessment', current: latestAssessment ? 1 : 0, target: 1 },
  ];

  const call = (tel?: string) => {
    if (tel) Linking.openURL(`tel:${tel}`).catch(() => {});
  };

  const cycleStep = (id: string, status: TBPStatus) => {
    const next: TBPStatus =
      status === 'pending' ? 'in-progress' : status === 'in-progress' ? 'completed' : 'pending';
    setTBPStepStatus(id, next).catch(() => {});
  };

  const submitNewStep = () => {
    const title = newStep.trim();
    if (!title) return;
    const desc = newStepDesc.trim();
    setNewStep('');
    setNewStepDesc('');
    // Same shape as the suggested steps: a title plus a short meaning.
    addBehaviorStep(title, desc).catch(() => {});
  };

  const confirmClearPlan = () => {
    setPlanMenuOpen(false);
    dialog(
      'Clear your plan?',
      'This removes all steps at once. You can rebuild or use the suggested plan again anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear all', style: 'destructive', onPress: () => clearBehaviorPlan().catch(() => {}) },
      ],
    );
  };

  const enterSelectMode = () => {
    setPlanMenuOpen(false);
    setMarkedIds([]);
    setSelectMode(true);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setMarkedIds([]);
  };

  const toggleMark = (id: string) =>
    setMarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const deleteMarked = async () => {
    for (const id of markedIds) {
      await removeBehaviorStep(id).catch(() => {});
    }
    exitSelectMode();
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.settingsRow}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="3" />
                <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarWrap}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <IconCheck size={10} color={Colors.white} strokeWidth={3.5} />
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          {memberSince && (
            <View style={styles.memberBadge}>
              <Text style={styles.memberText}>Member since {memberSince}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Your Progress (compact) ───────────────────── */}
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.card}>
            {[0, 1].map((row) => (
              <View key={row} style={[styles.statRow, row === 1 && styles.statRowBorder]}>
                {statCards.slice(row * 2, row * 2 + 2).map((stat, col) => (
                  <View key={stat.label} style={[styles.statCell, col === 1 && styles.statCellBorder]}>
                    <View style={[styles.statIcon, { backgroundColor: stat.accent + '16' }]}>
                      <stat.Icon size={17} color={stat.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* ── Recovery Analytics ────────────────────────── */}
          <View>
            <Text style={styles.sectionTitle}>Recovery Analytics</Text>
            <Text style={styles.sectionCaption}>What the app computes from your own logs</Text>
          </View>

          {/* Overall improvement - first tracked week vs now (§10.4) */}
          {influence?.index != null ? (
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.influenceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.influenceValue}>
                  {Math.abs(influence.index)}% {influence.index >= 0 ? 'better' : 'tougher'}
                </Text>
                <Text style={styles.influenceText}>
                  {influence.index >= 0
                    ? `Compared with your first week, across ${influence.metricsUsed} tracked metric${influence.metricsUsed === 1 ? '' : 's'} - risk, spending, and app-opens.`
                    : 'Compared with your first week. That is information, not failure - your diary can help spot what changed.'}
                </Text>
              </View>
              <View style={styles.influenceIcon}>
                {influence.index >= 0
                  ? <IconTrendingDown size={22} color={Colors.white} />
                  : <IconActivity size={22} color={Colors.white} />}
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.card, styles.influenceEmpty]}>
              <View style={styles.influenceEmptyIcon}>
                <IconActivity size={18} color={Colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.influenceEmptyTitle}>Building your baseline</Text>
                <Text style={styles.influenceEmptyText}>
                  After your first week of logging, the app compares your risk,
                  spending, and app-opens against that starting point - measured, not guessed.
                </Text>
              </View>
            </View>
          )}

          {/* Gambling risk - ring colored by PGSI band */}
          <View style={styles.darkCard}>
            <View style={styles.darkRow}>
              <RingGauge
                fraction={risk ? risk.position : 0}
                color={risk ? riskColor(risk.band) : Metric.muted}
                big={risk ? String(risk.score) : '–'}
                small="score"
              />
              <View style={styles.darkInfo}>
                <Text style={styles.darkLabel}>Gambling risk</Text>
                <Text style={[styles.darkLevel, { color: risk ? riskColor(risk.band) : Metric.muted }]}>
                  {risk ? risk.level : 'Not assessed yet'}
                </Text>
                <Text style={styles.darkCaption}>From your latest PGSI self-assessment (0–27).</Text>
                <TouchableOpacity
                  onPress={() => router.push('/assessment')}
                  activeOpacity={0.8}
                  style={styles.darkLink}
                  accessibilityRole="button"
                  accessibilityLabel="Retake the PGSI self-assessment"
                >
                  <Text style={styles.darkLinkText}>{latestAssessment ? 'Retake assessment' : 'Take the assessment'}</Text>
                  <IconChevronRight size={14} color={Metric.blue} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Monthly spending limit - budget ring */}
          <TouchableOpacity
            style={styles.darkCard}
            activeOpacity={0.85}
            onPress={() => router.push('/settings/spending-limit')}
            accessibilityRole="button"
            accessibilityLabel="Adjust your monthly spending limit"
          >
            <View style={styles.darkRow}>
              <RingGauge
                fraction={spending.limit > 0 ? spendPct / 100 : 0}
                color={spending.limit > 0 ? limitColor : Metric.muted}
                big={spending.limit > 0 ? `${spendPct}%` : '–'}
                small={spending.limit > 0 ? 'used' : 'no limit'}
              />
              <View style={styles.darkInfo}>
                <Text style={styles.darkLabel}>Monthly spending limit</Text>
                {spending.limit > 0 ? (
                  <>
                    <Text style={styles.darkLevel}>
                      {peso(spending.spent)} <Text style={styles.darkOf}>of {peso(spending.limit)}</Text>
                    </Text>
                    <Text style={styles.darkCaption}>{peso(Math.max(0, spending.limit - spending.spent))} left this month.</Text>
                  </>
                ) : (
                  <Text style={styles.darkCaption}>Set a monthly limit and we'll warn you before you reach it.</Text>
                )}
                <View style={styles.darkLink}>
                  <Text style={styles.darkLinkText}>{spending.limit > 0 ? 'Adjust limit' : 'Set a limit'}</Text>
                  <IconChevronRight size={14} color={Metric.blue} strokeWidth={2.5} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* This week's spending - line chart + stat footers */}
          <View style={styles.darkCard}>
            <Text style={styles.darkLabel}>This week's spending</Text>
            <View style={styles.chartWrap}>
              <WeekLineChart values={weeklySpendBars} peakColor={Metric.amber} />
              <View style={styles.chartLabels}>
                {WEEK_LABELS.map((l, i) => (
                  <Text key={i} style={styles.chartLabel}>{l}</Text>
                ))}
              </View>
            </View>
            <View style={styles.darkStatsRow}>
              <View style={styles.darkStat}>
                <Text style={[styles.darkStatValue, { color: Metric.green }]}>{betFreeDays}</Text>
                <Text style={styles.darkStatLabel}>Bet-free days</Text>
              </View>
              <View style={[styles.darkStat, { alignItems: 'flex-end' }]}>
                <Text style={[styles.darkStatValue, { color: Metric.amber }]}>{peso(spentWeek)}</Text>
                <Text style={styles.darkStatLabel}>Spent this week</Text>
              </View>
            </View>
          </View>

          {/* ── My Plan (user-owned) ──────────────────────── */}
          <View style={styles.planHeadRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>My Plan</Text>
              <Text style={styles.sectionCaption}>Yours to shape - add steps, check them off, or remove any</Text>
            </View>
            {theoreticalBehaviorPlan.length > 0 && !selectMode && (
              <View>
                <TouchableOpacity
                  onPress={() => setPlanMenuOpen((v) => !v)}
                  style={[styles.trashBtn, planMenuOpen && styles.trashBtnActive]}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Plan options: clear all or select to delete"
                >
                  <IconTrash size={16} color="#c9433f" />
                </TouchableOpacity>
                {planMenuOpen && (
                  <>
                    {/* tap-catcher closes the menu */}
                    <TouchableOpacity
                      style={styles.menuBackdrop}
                      activeOpacity={1}
                      onPress={() => setPlanMenuOpen(false)}
                    />
                    <View style={styles.planMenu}>
                      <TouchableOpacity style={styles.planMenuItem} onPress={confirmClearPlan} activeOpacity={0.7}>
                        <IconTrash size={15} color="#c9433f" />
                        <Text style={[styles.planMenuText, { color: '#c9433f' }]}>Clear all</Text>
                      </TouchableOpacity>
                      <View style={styles.planMenuDivider} />
                      <TouchableOpacity style={styles.planMenuItem} onPress={enterSelectMode} activeOpacity={0.7}>
                        <IconCheck size={15} color={Colors.text} strokeWidth={2.5} />
                        <Text style={styles.planMenuText}>Select to delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}
            {selectMode && (
              <TouchableOpacity onPress={exitSelectMode} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Cancel selection">
                <Text style={styles.selectCancel}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.card}>
            {theoreticalBehaviorPlan.length === 0 && (
              <View style={styles.planEmpty}>
                <Text style={styles.planEmptyText}>
                  Start from a suggested 5-step plan, or build your own from scratch below.
                </Text>
                <TouchableOpacity
                  style={styles.planSeedBtn}
                  onPress={() => startBehaviorPlan().catch(() => {})}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Use the suggested plan"
                >
                  <Text style={styles.planSeedText}>Use suggested plan</Text>
                </TouchableOpacity>
              </View>
            )}

            {theoreticalBehaviorPlan.map((step, i) => {
              const marked = markedIds.includes(step.id);
              return (
                <TouchableOpacity
                  key={step.id}
                  activeOpacity={selectMode ? 0.7 : 1}
                  disabled={!selectMode}
                  onPress={() => selectMode && toggleMark(step.id)}
                  style={[styles.planRow, i > 0 && styles.rowBorder]}
                  accessibilityRole={selectMode ? 'checkbox' : undefined}
                  accessibilityState={selectMode ? { checked: marked } : undefined}
                >
                  {selectMode ? (
                    <View style={[styles.checkbox, marked && styles.checkboxOn]}>
                      {marked && <IconCheck size={12} color={Colors.white} strokeWidth={3} />}
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => cycleStep(step.id, step.status)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`${step.title}. Status: ${step.status}. Tap to change.`}
                    >
                      {step.status === 'completed' ? (
                        <View style={styles.planDone}>
                          <IconCheck size={12} color={Colors.white} strokeWidth={3} />
                        </View>
                      ) : step.status === 'in-progress' ? (
                        <IconCircleDot size={22} color={Colors.primary} />
                      ) : (
                        <IconCircle size={22} color={Colors.textLight} />
                      )}
                    </TouchableOpacity>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planTitle, !selectMode && step.status === 'completed' && styles.planTitleDone]}>
                      {step.title}
                    </Text>
                    {!!step.description && <Text style={styles.planDesc}>{step.description}</Text>}
                  </View>
                  {!selectMode && (
                    <TouchableOpacity
                      onPress={() => removeBehaviorStep(step.id).catch(() => {})}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove step: ${step.title}`}
                    >
                      <IconX size={15} color={Colors.textLight} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Delete bar (select mode) */}
            {selectMode && (
              <TouchableOpacity
                style={[styles.deleteMarkedBtn, markedIds.length === 0 && { opacity: 0.4 }]}
                disabled={markedIds.length === 0}
                onPress={deleteMarked}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${markedIds.length} selected steps`}
              >
                <IconTrash size={15} color={Colors.white} />
                <Text style={styles.deleteMarkedText}>
                  {markedIds.length > 0 ? `Delete ${markedIds.length} selected` : 'Select steps to delete'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Add your own step - title + a short meaning, like the suggested ones */}
            {!selectMode && (
            <View style={[styles.planAddWrap, theoreticalBehaviorPlan.length > 0 && styles.rowBorder]}>
              <View style={styles.planAddRow}>
                <TextInput
                  style={styles.planInput}
                  value={newStep}
                  onChangeText={setNewStep}
                  placeholder="New step title"
                  placeholderTextColor={Colors.textLight}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={submitNewStep}
                  disabled={!newStep.trim()}
                  style={[styles.planAddBtn, !newStep.trim() && { opacity: 0.4 }]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Add step to my plan"
                >
                  <IconPlus size={16} color={Colors.white} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.planDescInput}
                value={newStepDesc}
                onChangeText={setNewStepDesc}
                placeholder="What it means / why it helps (optional)"
                placeholderTextColor={Colors.textLight}
                onSubmitEditing={submitNewStep}
                returnKeyType="done"
              />
            </View>
            )}
          </View>

          {/* ── Gambling Activity → detailed logs ─────────── */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push('/visit-logs')}
            accessibilityRole="button"
            accessibilityLabel="View detailed gambling visit logs"
          >
            <View style={styles.activityHead}>
              <View>
                <Text style={styles.cardTitle}>Gambling Activity</Text>
                <Text style={styles.cardSub}>Last 30 days</Text>
              </View>
              <View style={styles.viewAll}>
                <Text style={styles.viewAllText}>View logs</Text>
                <IconChevronRight size={15} color={Colors.primary} strokeWidth={2.5} />
              </View>
            </View>
            <View style={styles.activityStats}>
              <View style={styles.activityStat}>
                <Text style={styles.activityValue}>{visitsTotal}</Text>
                <Text style={styles.activityLabel}>Total visits</Text>
              </View>
              <View style={styles.activityStat}>
                <Text style={styles.activityValue}>{visitsToday}</Text>
                <Text style={styles.activityLabel}>Today</Text>
              </View>
              <View style={styles.activityStat}>
                <Text style={[styles.activityValue, visitsHighRisk > 0 && { color: '#c9433f' }]}>{visitsHighRisk}</Text>
                <Text style={styles.activityLabel}>High risk</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* ── Emergency & Support ───────────────────────── */}
          <Text style={styles.sectionTitle}>Emergency & Support</Text>
          <View style={styles.card}>
            {EMERGENCY.map((r, i) => (
              <TouchableOpacity
                key={r.title}
                style={[styles.resourceRow, i > 0 && styles.rowBorder]}
                activeOpacity={r.tel ? 0.7 : 1}
                onPress={() => call(r.tel)}
                accessibilityRole="button"
                accessibilityLabel={r.tel ? `Call ${r.title}, ${r.sub}` : `${r.title}, ${r.sub}`}
              >
                <View style={[styles.resourceIcon, { backgroundColor: r.tint }]}>
                  <r.Icon size={18} color={r.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceTitle}>{r.title}</Text>
                  <Text style={styles.resourceSub}>{r.sub}</Text>
                </View>
                {r.tel ? (
                  <View style={[styles.callBtn, { backgroundColor: r.accent }]}>
                    <IconPhone size={14} color={Colors.white} />
                  </View>
                ) : (
                  <IconChevronRight size={16} color={Colors.textLight} />
                )}
              </TouchableOpacity>
            ))}
            <Text style={styles.resourceNote}>If you're in immediate danger, call your local emergency number right away.</Text>
          </View>

          {/* ── Milestones ────────────────────────────────── */}
          <View>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <Text style={styles.sectionCaption}>Tied to your real progress - they fill in as you go</Text>
          </View>
          <View style={styles.card}>
            {milestones.map((m, i) => {
              const pct = Math.min(1, m.current / m.target);
              const achieved = pct >= 1;
              return (
                <View key={m.title} style={[styles.milestoneRow, i > 0 && styles.rowBorder]}>
                  <View style={[styles.milestoneIcon, achieved ? styles.milestoneIconDone : styles.milestoneIconTodo]}>
                    <m.Icon size={18} color={achieved ? Colors.secondaryDark : Colors.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                    <Text style={styles.milestoneSub}>{m.sub}</Text>
                    <View style={styles.milestoneTrack}>
                      <View
                        style={[
                          styles.milestoneFill,
                          { width: `${pct * 100}%`, backgroundColor: achieved ? Colors.secondary : Colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                  {achieved ? (
                    <View style={styles.milestoneDone}>
                      <IconCheck size={12} color={Colors.white} strokeWidth={3} />
                    </View>
                  ) : (
                    <Text style={styles.milestonePct}>{Math.round(pct * 100)}%</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 24 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, alignItems: 'center' },
  settingsRow: { width: '100%', alignItems: 'flex-end', marginBottom: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 32 },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.secondary, borderWidth: 2, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textMuted, marginBottom: 8 },
  memberBadge: { backgroundColor: 'rgba(91,155,213,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  memberText: { fontSize: 12, fontWeight: '600', color: Colors.primaryDark },

  body: { padding: 24, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 2 },
  sectionCaption: { fontSize: 12, color: Colors.textLight, marginTop: 2 },

  // Shared card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#22303e',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },

  // Compact progress grid (2×2 inside one card)
  statRow: { flexDirection: 'row' },
  statRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  statCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingRight: 8 },
  statCellBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border, paddingLeft: 14 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15.5, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 1, fontWeight: '500' },

  // Influence highlight
  influenceCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: Colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  influenceValue: { fontSize: 24, fontWeight: '800', color: Colors.white },
  influenceText: { fontSize: 12.5, color: 'rgba(255,255,255,0.92)', lineHeight: 18, marginTop: 4 },
  influenceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  influenceEmpty: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  influenceEmptyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(91,155,213,0.14)', alignItems: 'center', justifyContent: 'center' },
  influenceEmptyTitle: { fontSize: 14.5, fontWeight: '700', color: Colors.text },
  influenceEmptyText: { fontSize: 12, color: Colors.textMuted, lineHeight: 17, marginTop: 3 },

  // Analytics "spotlight" cards (light theme)
  darkCard: {
    backgroundColor: Metric.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Metric.cardEdge,
    shadowColor: '#22303e',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  darkRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  darkInfo: { flex: 1 },
  darkLabel: { fontSize: 13, fontWeight: '700', color: Metric.text },
  darkLevel: { fontSize: 17, fontWeight: '800', color: Metric.text, marginTop: 3 },
  darkOf: { fontSize: 13, fontWeight: '600', color: Metric.muted },
  darkCaption: { fontSize: 11.5, color: Metric.muted, lineHeight: 16, marginTop: 3 },
  darkLink: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 10 },
  darkLinkText: { fontSize: 13, fontWeight: '700', color: Metric.blue },
  chartWrap: { marginTop: 14 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 2 },
  chartLabel: { fontSize: 10, fontWeight: '600', color: Metric.muted },
  darkStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Metric.cardEdge },
  darkStat: { gap: 3 },
  darkStatValue: { fontSize: 22, fontWeight: '800' },
  darkStatLabel: { fontSize: 11.5, color: Metric.muted, fontWeight: '600' },

  // My Plan
  planEmpty: { alignItems: 'center', gap: 12, paddingVertical: 6, paddingBottom: 16 },
  planEmptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },
  planSeedBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 22 },
  planSeedText: { color: Colors.white, fontSize: 13.5, fontWeight: '700' },
  planRow: { flexDirection: 'row', gap: 12, paddingVertical: 13, alignItems: 'flex-start' },
  planDone: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  planTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  planTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  planDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17, marginTop: 2 },
  planHeadRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2, zIndex: 20 },
  trashBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fdecec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashBtnActive: { backgroundColor: '#f7d5d5' },
  menuBackdrop: { position: 'absolute', top: -1000, left: -1000, right: -1000, bottom: -1000 },
  planMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 184,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingVertical: 4,
    shadowColor: '#22303e',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    zIndex: 30,
  },
  planMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  planMenuText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  planMenuDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  selectCancel: { fontSize: 13, fontWeight: '700', color: Colors.primary, paddingVertical: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#c9433f', borderColor: '#c9433f' },
  deleteMarkedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#c9433f',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 14,
  },
  deleteMarkedText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  planAddWrap: { paddingTop: 13, gap: 8 },
  planAddRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  planInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: Colors.text,
  },
  planDescInput: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 12.5,
    color: Colors.text,
  },
  planAddBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Activity summary
  activityHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  activityStats: { flexDirection: 'row', gap: 10 },
  activityStat: { flex: 1, backgroundColor: Colors.bg, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  activityValue: { fontSize: 20, fontWeight: '800', color: Colors.primaryDark },
  activityLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginTop: 3 },

  // Emergency resources
  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  resourceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resourceTitle: { fontSize: 14.5, fontWeight: '700', color: Colors.text },
  resourceSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  callBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  resourceNote: { fontSize: 11.5, color: Colors.textLight, lineHeight: 17, marginTop: 12, fontStyle: 'italic' },

  // Milestones
  milestoneRow: { flexDirection: 'row', gap: 14, paddingVertical: 14, alignItems: 'center' },
  milestoneIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  milestoneIconDone: { backgroundColor: 'rgba(122,184,154,0.18)' },
  milestoneIconTodo: { backgroundColor: Colors.bg },
  milestoneTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  milestoneSub: { fontSize: 11.5, color: Colors.textMuted, marginTop: 1 },
  milestoneTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.bg, marginTop: 8, overflow: 'hidden' },
  milestoneFill: { height: '100%', borderRadius: 2 },
  milestonePct: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, minWidth: 34, textAlign: 'right' },
  milestoneDone: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
});
