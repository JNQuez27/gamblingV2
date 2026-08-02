import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { peso } from '@/utils/mathEngine';
import { visitRiskLevel } from '@/utils/thresholdEngine';
import { todayKey, daysBetween } from '@/utils/date';
import { PAGCOR_REFERENCE_BETS } from '@/constants/phPrices';
import type { TBPStatus } from '@/types/psychology';
import {
  IconFlame,
  IconWallet,
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
  IconBanknote,
  IconTrendingDown,
  IconChevronRight,
  IconTrash,
} from '@/components/ui/icons';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const EMERGENCY = [
  { Icon: IconPhone, title: 'Emergency Hotline', sub: 'National · 911', tel: '911', tint: '#fdecec', accent: '#c9433f' },
  { Icon: IconHeart, title: 'Mental Health Crisis', sub: 'NCMH · 1553 (toll-free)', tel: '1553', tint: '#e9f5ef', accent: Colors.secondaryDark },
  { Icon: IconLifeBuoy, title: 'Gambling Support', sub: 'Talk to a counselor', tint: '#fdf4e3', accent: '#c78a2a' },
  { Icon: IconUsers, title: 'Reach a trusted person', sub: "You don't have to do this alone", tint: '#eef4fb', accent: Colors.primaryDark },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
  const moneyKept = streak * PAGCOR_REFERENCE_BETS.averageSessionSpend;

  // Personal counters - computed from live state.
  const statCards = [
    { Icon: IconFlame, label: 'Bet-free streak', value: `${streak} day${streak === 1 ? '' : 's'}`, accent: '#d99a3a' },
    { Icon: IconWallet, label: 'Money kept', value: peso(moneyKept), accent: Colors.secondaryDark },
    { Icon: IconBookOpen, label: 'Diary entries', value: String(diaryCount), accent: Colors.primaryDark },
    { Icon: IconActivity, label: 'Latest PGSI', value: latestAssessment ? String(latestAssessment.totalScore) : '-', accent: '#9b6bd1' },
  ];

  // Risk gauge from the latest assessment (PGSI 0–27 → 0..1 position).
  const risk = latestAssessment
    ? {
        level: latestAssessment.category,
        score: latestAssessment.totalScore,
        position: Math.min(1, latestAssessment.totalScore / 27),
      }
    : null;

  const spending = {
    spent: spendingSummary?.current ?? 0,
    limit: spendingSummary?.limit ?? 0,
  };
  const spendPct = spending.limit > 0
    ? Math.min(100, Math.round((spending.spent / spending.limit) * 100))
    : 0;

  // Bar heights scale against the week's biggest spend day (0 = bet-free).
  const maxWeekSpend = Math.max(...weeklySpendBars, 1);

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
    { Icon: IconBanknote, title: `${peso(5000)} protected`, sub: 'Money kept instead of gambled', current: moneyKept, target: 5000 },
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
    Alert.alert(
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

          {/* Risk / spending / weekly pattern */}
          <View style={styles.card}>
            <View style={styles.metricHead}>
              <View style={styles.metricHeadLeft}>
                <Text style={styles.metricLabel}>Gambling risk</Text>
                <Text style={styles.metricCaption}>From your latest self-assessment (PGSI)</Text>
              </View>
              <View style={styles.riskChip}>
                <Text style={styles.riskChipText} numberOfLines={1}>
                  {risk ? `${risk.level} · ${risk.score}` : 'Not assessed yet'}
                </Text>
              </View>
            </View>
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeSeg, { backgroundColor: '#bfe0cd' }]} />
              <View style={[styles.gaugeSeg, { backgroundColor: '#f2dca8' }]} />
              <View style={[styles.gaugeSeg, { backgroundColor: '#f2c2c0' }]} />
              {risk && <View style={[styles.gaugeMarker, { left: `${risk.position * 100}%` }]} />}
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>Low</Text>
              <Text style={styles.gaugeLabel}>Moderate</Text>
              <Text style={styles.gaugeLabel}>High</Text>
            </View>

            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => router.push('/assessment')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Retake the PGSI self-assessment"
            >
              <Text style={styles.retakeText}>
                {latestAssessment ? 'Retake assessment' : 'Take the assessment'}
              </Text>
              <IconChevronRight size={15} color={Colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <View style={styles.metricHead}>
              <View style={styles.metricHeadLeft}>
                <Text style={styles.metricLabel}>Monthly spending</Text>
                <Text style={styles.metricCaption}>Against the limit you set</Text>
              </View>
              <Text style={styles.metricValue} numberOfLines={1}>
                {spending.limit > 0
                  ? `${peso(spending.spent)} / ${peso(spending.limit)}`
                  : `${peso(spending.spent)} · no limit set`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={[styles.progressFill, { width: `${spendPct}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressHint}>
              {spending.limit > 0
                ? `${peso(Math.max(0, spending.limit - spending.spent))} left · ${spendPct}% used`
                : 'Set a limit in Settings → Spending limit'}
            </Text>

            <View style={styles.cardDivider} />

            <Text style={styles.metricLabel}>This week's spending</Text>
            <View style={styles.barsRow}>
              {weeklySpendBars.map((h, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    {h === 0 ? (
                      <View style={[styles.bar, styles.barClean]} />
                    ) : (
                      <LinearGradient
                        colors={['#e8b6b6', '#d98383']}
                        style={[styles.bar, { height: Math.max(6, (h / maxWeekSpend) * 44) }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      />
                    )}
                  </View>
                  <Text style={styles.barLabel}>{WEEK_LABELS[i]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} /><Text style={styles.legendText}>Bet-free</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#d98383' }]} /><Text style={styles.legendText}>Spent</Text></View>
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
  cardDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 18 },
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

  // Analytics blocks
  metricHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  metricHeadLeft: { flex: 1 },
  metricLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  metricCaption: { fontSize: 11, color: Colors.textLight, marginTop: 1 },
  metricValue: { fontSize: 12.5, fontWeight: '600', color: Colors.textMuted, flexShrink: 0 },
  riskChip: { backgroundColor: '#fdf3e0', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0, maxWidth: '58%' },
  riskChipText: { fontSize: 11.5, fontWeight: '700', color: '#c78a2a' },
  gaugeTrack: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', position: 'relative', gap: 2 },
  gaugeSeg: { flex: 1, borderRadius: 3 },
  gaugeMarker: { position: 'absolute', top: -3, width: 4, height: 16, borderRadius: 2, backgroundColor: Colors.text, marginLeft: -2 },
  gaugeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  gaugeLabel: { fontSize: 10, color: Colors.textLight, fontWeight: '600' },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 14 },
  retakeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: Colors.bg, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressHint: { fontSize: 11.5, color: Colors.textMuted, marginTop: 6, fontWeight: '500' },
  barsRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 56, marginTop: 12 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  bar: { width: '100%', borderRadius: 6 },
  barClean: { height: 6, backgroundColor: Colors.secondaryLight },
  barLabel: { fontSize: 10, color: Colors.textLight },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },

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
