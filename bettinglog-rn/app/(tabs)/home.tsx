import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  Pressable,
  Platform,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { peso, limitProximity, savingsReinforcement } from '@/utils/mathEngine';
import { explainBand } from '@/utils/thresholdEngine';
import { PH_ALTERNATIVES, PAGCOR_REFERENCE_BETS } from '@/constants/phPrices';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { todayKey, daysBetween } from '@/utils/date';
import {
  IconFlame,
  IconWallet,
  IconBookOpen,
  IconTarget,
  IconActivity,
  IconClipboard,
  IconCheck,
  IconBulb,
  IconMoon,
  IconLeaf,
  IconBarChart,
  IconClock,
  IconBell,
  IconPencil,
  IconMessage,
  IconSunrise,
  IconFaceGreat,
  IconFaceGood,
  IconFaceOkay,
  IconFaceStruggling,
  IconFaceTempted,
  IconBus,
  IconBowl,
  IconUtensils,
  IconCoffee,
  IconSmartphone,
  IconFilm,
  IconCart,
  IconZap,
  IconHome,
  IconCircle,
  IconWaves,
  IconDice,
} from '@/components/ui/icons';

// PH_ALTERNATIVES (constants/phPrices.ts) keys each alternative by an emoji
// string that other engines quote in sentences; on screen we swap it for the
// matching outline icon.
const ALT_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  '🚌': IconBus,
  '🍚': IconBowl,
  '🍔': IconUtensils,
  '☕': IconCoffee,
  '📱': IconSmartphone,
  '🎬': IconFilm,
  '📚': IconBookOpen,
  '🛒': IconCart,
  '⚡': IconZap,
  '🏠': IconHome,
  '⛽': IconFlame,
  '🐟': IconWaves,
  '🥚': IconCircle,
  '🐖': IconUtensils,
};

// react-native-web falls back to the JS driver anyway; skip the warning.
const USE_NATIVE = Platform.OS !== 'web';

// Mood options tuned for gambling recovery - "Tempted" matters here.
// Each mood lights up its icon in a distinct, theme-fitting colour when picked.
const MOODS = [
  { Icon: IconFaceGreat, label: 'Great', color: '#e0913a' },
  { Icon: IconFaceGood, label: 'Good', color: Colors.secondaryDark },
  { Icon: IconFaceOkay, label: 'Okay', color: Colors.primaryDark },
  { Icon: IconFaceStruggling, label: 'Struggling', color: '#cf5b57' },
  { Icon: IconFaceTempted, label: 'Tempted', color: '#9b6bd1' },
];

// Soft coloured backgrounds for the swipeable Reality Check slide cards,
// cycled by index. Each pairs a tint with a matching icon/label accent.
const REALITY_TINTS = [
  { bg: '#fff4e0', accent: '#c78a2a' },
  { bg: '#eaf5ef', accent: Colors.secondaryDark },
  { bg: '#eef4fb', accent: Colors.primaryDark },
  { bg: '#f3eefb', accent: '#8b63c9' },
  { bg: '#fdecec', accent: '#cf5b57' },
];

// Bet-free streak: the 7-day strip (Monday-based; "today" comes from the clock).
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// "See in real things" - concrete alternatives to a bet amount (opportunity
// cost, priced in constants/phPrices.ts).
const ALTERNATIVES = PH_ALTERNATIVES;

const QUICK_ACTIONS = [
  { Icon: IconPencil, accent: Colors.primaryDark, label: 'Write in diary', route: '/(tabs)/diary' as const },
  { Icon: IconMessage, accent: Colors.secondaryDark, label: 'Talk it out', route: '/consultation' as const },
  { Icon: IconBookOpen, accent: '#9b6bd1', label: 'Learn something', route: '/(tabs)/learn' as const },
  { Icon: IconBell, accent: '#d99a3a', label: 'Set reminder', route: '/settings' as const },
];

// Greeting that follows the actual clock.
function greetingFor(hour: number): string {
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    streak,
    streakMarked,
    markStreak,
    addDiaryEntry,
    diaryEntries,
    spendingSummary,
    topGamblingApps,
    usageBand,
    usageLogs,
    weeklyCheckinDue,
    logSpend,
  } = useAppContext();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [dayStatus, setDayStatus] = useState<'clean' | 'slip' | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betLogState, setBetLogState] = useState<'idle' | 'saving' | 'done'>('idle');
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<number[]>([]);
  const [rcIndex, setRcIndex] = useState(0);

  const { width: winW } = useWindowDimensions();
  const rcCardW = winW - 48; // header horizontal padding is 24 each side
  const rcRef = useRef<ScrollView>(null);

  // Everything below keys off the real clock.
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // 0 = Monday
  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'friend');
  const sessionCost = PAGCOR_REFERENCE_BETS.averageSessionSpend;

  // Recent Insights - patterns pulled from the user's own logs this week.
  const thisWeekOpens = usageLogs.filter((l) => {
    const age = daysBetween(l.loggedDate, todayKey());
    return age >= 0 && age < 7;
  });
  const lateNightOpens = thisWeekOpens
    .filter((l) => {
      const hour = new Date(l.createdAt).getHours();
      return hour >= 22 || hour < 4;
    })
    .reduce((sum, l) => sum + l.openCount, 0);
  const topApp = topGamblingApps[0];
  const insights = [
    ...(lateNightOpens > 0
      ? [{ Icon: IconMoon, color: '#6b7cc9', label: 'Late-night pattern', desc: `${lateNightOpens} late-night open${lateNightOpens === 1 ? '' : 's'} this week - urges tend to peak after 10 PM`, tint: '#eef2ff' }]
      : []),
    ...(topApp
      ? [{ Icon: IconActivity, color: Colors.primaryDark, label: 'Most-opened app', desc: `${topApp.appName} • ${topApp.totalOpens} open${topApp.totalOpens === 1 ? '' : 's'} logged - that's where the habit lives`, tint: '#eef4fb' }]
      : []),
  ];

  // Reality Check carousel - built from the user's own live data, with
  // evergreen awareness cards as filler.
  const realityChecks = useMemo(() => {
    const cards: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string }[] = [
      { Icon: IconBulb, text: 'Urges usually peak for about 10 minutes. Pause and ride the wave - it passes.' },
    ];
    if (streak > 0) {
      cards.push({ Icon: IconWallet, text: savingsReinforcement(streak, sessionCost) });
    }
    if (spendingSummary && spendingSummary.limit > 0) {
      cards.push({ Icon: IconTarget, text: limitProximity(spendingSummary) });
    }
    if (topGamblingApps.length > 0) {
      const top = topGamblingApps[0];
      cards.push({ Icon: IconBarChart, text: `${top.appName} is your most-opened gambling app - ${top.totalOpens}× logged. That's where the habit lives.` });
    }
    cards.push({ Icon: IconActivity, text: explainBand(usageBand) });
    cards.push(
      { Icon: IconMoon, text: 'Most slips happen late at night. A wind-down routine can protect you.' },
      { Icon: IconLeaf, text: 'Every bet-free day rewires the habit loop a little more.' },
    );
    return cards;
  }, [streak, spendingSummary, topGamblingApps, usageBand, sessionCost]);

  // In-app notifications shown by the bell - generated from live state.
  const notifs = useMemo(() => {
    const list: {
      id: number;
      Icon: React.ComponentType<{ size?: number; color?: string }>;
      color: string;
      title: string;
      body: string;
      time: string;
    }[] = [];
    if (weeklyCheckinDue) {
      list.push({ id: 1, Icon: IconClipboard, color: Colors.primaryDark, title: 'Weekly check-in due', body: 'Five quick questions about your week. One minute, tops.', time: 'now' });
    }
    if (streak > 0) {
      list.push({ id: 2, Icon: IconFlame, color: '#d99a3a', title: 'Streak milestone', body: `${streak} bet-free day${streak === 1 ? '' : 's'} in a row - keep it going!`, time: 'today' });
      list.push({ id: 3, Icon: IconWallet, color: Colors.secondaryDark, title: 'Money kept', body: `You've held on to about ${peso(streak * sessionCost)} so far.`, time: 'today' });
    }
    if (spendingSummary && spendingSummary.limit > 0 && spendingSummary.isCritical) {
      list.push({ id: 4, Icon: IconTarget, color: '#c9433f', title: 'Limit reminder', body: limitProximity(spendingSummary), time: 'today' });
    }
    if (!streakMarked) {
      list.push({ id: 5, Icon: IconClock, color: Colors.textMuted, title: 'Daily check-in', body: 'How are you feeling today? Take a moment.', time: 'today' });
    }
    return list;
  }, [weeklyCheckinDue, streak, streakMarked, spendingSummary, sessionCost]);

  // Reality Check: gentle auto-advance that slides to the next card. Manual
  // swipes update the index via onMomentumScrollEnd below.
  useEffect(() => {
    const id = setInterval(() => {
      setRcIndex((i) => {
        const next = (i + 1) % realityChecks.length;
        rcRef.current?.scrollTo({ x: next * rcCardW, animated: true });
        return next;
      });
    }, 4600);
    return () => clearInterval(id);
  }, [realityChecks.length, rcCardW]);

  const onRcScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / rcCardW);
    if (i !== rcIndex) setRcIndex(i);
  };

  const goToCard = (i: number) => {
    setRcIndex(i);
    rcRef.current?.scrollTo({ x: i * rcCardW, animated: true });
  };

  // Persist today's outcome (streaks table) and ALWAYS file a diary entry -
  // the week strip and the journey map both read the day's record from the
  // diary, so every check-in leaves a durable trace.
  const logDay = async (clean: boolean) => {
    setDayStatus(clean ? 'clean' : 'slip');
    try {
      await markStreak(clean);
      const mood = selectedMood !== null ? MOODS[selectedMood].label : 'Okay';
      await addDiaryEntry(mood, note.trim() || (clean ? 'Stayed bet-free today.' : 'Slipped today - logged it honestly.'));
      setNote('');
      setSelectedMood(null);
    } catch {
      // Persistence failed (e.g. offline) - the local state still reflects the tap.
    }
  };

  const alreadyLogged = streakMarked && dayStatus === null;

  // A day's notes mark a slip when they carry the honest-slip wording the
  // check-in writes (same heuristic the journey map uses).
  const looksGambled = (notes: string) => /slip|gambled|natalo/i.test(notes);

  // Real per-day statuses for this week, read from the diary record - so
  // yesterday keeps its check or cross even after the streak resets.
  const weekStatus = WEEK_DAYS.map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - todayIndex + i);
    const dayEntries = diaryEntries[todayKey(d)];
    const logged = dayEntries && dayEntries.length > 0;
    const gambled = logged && looksGambled(dayEntries.map((e) => e.note).join(' '));
    if (i > todayIndex) return 'upcoming';
    if (i === todayIndex) {
      if (dayStatus) return dayStatus;
      if (logged) return gambled ? 'slip' : 'clean';
      return streakMarked ? 'clean' : 'today';
    }
    if (logged) return gambled ? 'slip' : 'clean';
    return 'upcoming'; // no check-in recorded that day
  });

  const amount = parseInt(betAmount.replace(/[^0-9]/g, ''), 10) || 0;

  // Pipe the typed amount into spending_logs so the monthly limit tracks it.
  const logBetAsSpend = async () => {
    if (amount <= 0 || betLogState === 'saving') return;
    setBetLogState('saving');
    try {
      await logSpend(amount, 'Logged from "What\'s the bet really worth?"');
      setBetLogState('done');
      setBetAmount('');
    } catch {
      setBetLogState('idle');
    }
  };
  const alternatives = ALTERNATIVES
    .map((a) => {
      const count = Math.floor(amount / a.cost);
      return { ...a, count, unit: count === 1 ? a.one : a.many };
    })
    .filter((a) => a.count >= 1)
    .slice(0, 5);

  const unread = notifs.filter((n) => !readNotifs.includes(n.id)).length;
  const markAllRead = () => setReadNotifs(notifs.map((n) => n.id));

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingLine}>{greetingFor(now.getHours())}</Text>
              <Text style={styles.greetingName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.greetingSub}>One calm day at a time.</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => setNotifOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${unread} unread`}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </Svg>
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Reality Check - swipeable colour slide cards */}
          <View style={styles.realityWrap}>
            <ScrollView
              ref={rcRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onRcScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
            >
              {realityChecks.map((c, i) => {
                const t = REALITY_TINTS[i % REALITY_TINTS.length];
                const CardIcon = c.Icon;
                return (
                  <View key={i} style={[styles.realityCard, { width: rcCardW, backgroundColor: t.bg }]}>
                    <View style={styles.realityIcon}>
                      <CardIcon size={18} color={t.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.realityLabel, { color: t.accent }]}>REALITY CHECK</Text>
                      <Text numberOfLines={2} style={styles.realityText}>{c.text}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.dotsRow}>
              {realityChecks.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => goToCard(i)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Reality check ${i + 1} of ${realityChecks.length}`}
                >
                  <View style={[styles.dot, i === rcIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Weekly questionnaire banner - shows while this week's check-in is unanswered */}
          {weeklyCheckinDue && (
            <TouchableOpacity
              style={styles.checkinBanner}
              onPress={() => router.push('/weekly-checkin')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Weekly check-in is due. Answer now."
            >
              <IconClipboard size={20} color={Colors.primaryDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkinBannerTitle}>Weekly check-in due</Text>
                <Text style={styles.checkinBannerSub}>Five quick questions about your week - one minute.</Text>
              </View>
              <Text style={styles.checkinBannerGo}>Answer →</Text>
            </TouchableOpacity>
          )}

          {/* Daily Check-in (streak + mood + note + bet-or-not) */}
          <LinearGradient
            colors={['#ffffff', '#f3f9ff', '#eef7f1']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.checkinHeader}>
              <View>
                <Text style={styles.cardTitle}>Daily Check-in</Text>
                <Text style={styles.cardSub}>Consecutive bet-free days</Text>
              </View>
              <View style={styles.flameBadge}>
                <IconFlame size={15} color="#d99a3a" />
                <Text style={styles.flameCount}>{streak}</Text>
              </View>
            </View>

            {/* Weekly strip */}
            <View style={styles.daysRow}>
              {WEEK_DAYS.map((day, i) => {
                const status = weekStatus[i];
                return (
                  <View key={i} style={styles.dayCol}>
                    {status === 'clean' && (
                      <LinearGradient colors={[Colors.secondaryDark, Colors.secondary]} style={styles.dayCircle}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <Polyline points="20 6 9 17 4 12" />
                        </Svg>
                      </LinearGradient>
                    )}
                    {status === 'slip' && (
                      <View style={[styles.dayCircle, styles.dayCircleSlip]}>
                        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <Path d="M18 6 6 18M6 6l12 12" />
                        </Svg>
                      </View>
                    )}
                    {status === 'today' && (
                      <View style={[styles.dayCircle, styles.dayCircleToday]}>
                        <Text style={styles.dayNum}>{i + 1}</Text>
                      </View>
                    )}
                    {status === 'upcoming' && (
                      <View style={[styles.dayCircle, styles.dayCircleEmpty]}>
                        <Text style={styles.dayNum}>{i + 1}</Text>
                      </View>
                    )}
                    <Text style={[styles.dayLabel, i === todayIndex && styles.dayLabelToday]}>{day}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Mood */}
            <Text style={styles.blockLabel}>What's keeping you strong today?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedMood(i)}
                  style={[styles.moodBtn, selectedMood === i && styles.moodBtnActive]}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedMood === i }}
                  accessibilityLabel={`Mood: ${m.label}`}
                >
                  <m.Icon size={22} color={selectedMood === i ? m.color : Colors.textLight} />
                  <Text style={styles.moodLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note (optional)…"
              placeholderTextColor={Colors.textLight}
              multiline
            />

            {/* Bet-or-not - persists to the streaks table */}
            {alreadyLogged ? (
              <View style={styles.resultClean}>
                <View style={styles.resultCheck}>
                  <IconCheck size={13} color={Colors.white} strokeWidth={3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultCleanTitle}>Today is already logged.</Text>
                  <Text style={styles.resultCleanSub}>Current streak: {streak} day{streak === 1 ? '' : 's'} - around {peso(streak * sessionCost)} kept.</Text>
                </View>
              </View>
            ) : dayStatus === null ? (
              <View style={styles.betRow}>
                <TouchableOpacity
                  onPress={() => logDay(true)}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel="I stayed bet-free today"
                >
                  <LinearGradient colors={[Colors.secondaryDark, Colors.secondary]} style={styles.betBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.betBtnIcon}>
                      <IconLeaf size={52} color="rgba(255,255,255,0.28)" />
                    </View>
                    <Text style={styles.betBtnText}>Bet-free</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => logDay(false)}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel="I gambled today"
                >
                  <LinearGradient colors={['#e08f8f', '#d07676']} style={styles.betBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.betBtnIcon}>
                      <IconDice size={52} color="rgba(255,255,255,0.28)" />
                    </View>
                    <Text style={styles.betBtnText}>I gambled</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : dayStatus === 'clean' ? (
              <View style={styles.resultClean}>
                <View style={styles.resultCheck}>
                  <IconCheck size={13} color={Colors.white} strokeWidth={3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultCleanTitle}>Bet-free day logged!</Text>
                  <Text style={styles.resultCleanSub}>That's {streak} day{streak === 1 ? '' : 's'} - around {peso(streak * sessionCost)} kept.</Text>
                </View>
              </View>
            ) : (
              <View style={styles.resultSlip}>
                <IconSunrise size={20} color="#c2703a" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultSlipTitle}>Logged honestly - that takes courage.</Text>
                  <Text style={styles.resultSlipSub}>Tomorrow is a fresh start. Your awareness is growing.</Text>
                </View>
              </View>
            )}
          </LinearGradient>

          {/* Smart math - What's the bet really worth? */}
          <View style={styles.mathCard}>
            <Text style={styles.mathTitle}>What's the bet really worth?</Text>
            <Text style={styles.mathSub}>Type how much you were about to bet</Text>

            <View style={styles.mathInputRow}>
              <View style={styles.pesoBox}>
                <Text style={styles.pesoSign}>₱</Text>
              </View>
              <TextInput
                style={styles.mathInput}
                value={betAmount}
                onChangeText={(text) => {
                  setBetAmount(text);
                  if (betLogState === 'done') setBetLogState('idle');
                }}
                placeholder="0"
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
                accessibilityLabel="Amount you were about to bet"
              />
            </View>

            {amount > 0 ? (
              <View style={styles.altList}>
                <Text style={styles.altHeader}>{peso(amount)} could be…</Text>
                {alternatives.length > 0 ? (
                  alternatives.map((a) => {
                    const AltIcon = ALT_ICONS[a.icon] ?? IconWallet;
                    return (
                      <View key={a.unit} style={styles.altRow}>
                        <AltIcon size={18} color={Colors.primaryDark} />
                        <Text style={styles.altText}>
                          <Text style={styles.altCount}>{a.count}</Text> {a.unit}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.altHint}>Even small amounts add up - every peso kept counts.</Text>
                )}
                <TouchableOpacity
                  style={styles.logBetBtn}
                  onPress={logBetAsSpend}
                  disabled={betLogState === 'saving'}
                  accessibilityLabel="Log this amount to my monthly spending"
                >
                  <Text style={styles.logBetText}>
                    {betLogState === 'saving' ? 'Logging…' : `I bet this - add ${peso(amount)} to my spending`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : betLogState === 'done' ? (
              <View style={styles.logBetDone}>
                <Text style={styles.logBetDoneText}>✓ Added to your monthly spending</Text>
              </View>
            ) : (
              <View style={styles.seeRealHint}>
                <Text style={styles.seeRealText}>See it in real things  →</Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route)}
                style={styles.quickCard}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={[styles.quickChip, { backgroundColor: action.accent + '14' }]}>
                  <action.Icon size={18} color={action.accent} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Insights - derived from the user's own logs, never canned */}
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          {insights.length === 0 ? (
            <View style={styles.insightCard}>
              <View style={[styles.insightChip, { backgroundColor: '#f0fdf4' }]}>
                <IconLeaf size={18} color={Colors.secondaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>No patterns yet</Text>
                <Text style={styles.insightDesc}>Insights appear here as your own logs build up.</Text>
              </View>
            </View>
          ) : (
            insights.map((insight) => (
              <View key={insight.label} style={styles.insightCard}>
                <View style={[styles.insightChip, { backgroundColor: insight.tint }]}>
                  <insight.Icon size={18} color={insight.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insightTitle}>{insight.label}</Text>
                  <Text style={styles.insightDesc}>{insight.desc}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Notifications panel */}
      <Modal visible={notifOpen} transparent animationType="fade" onRequestClose={() => setNotifOpen(false)}>
        <Pressable style={styles.notifBackdrop} onPress={() => setNotifOpen(false)}>
          <Pressable style={styles.notifPanel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notifications</Text>
              {unread > 0 && (
                <TouchableOpacity onPress={markAllRead} accessibilityRole="button" accessibilityLabel="Mark all as read">
                  <Text style={styles.notifMarkAll}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {notifs.length === 0 && (
                <Text style={styles.notifEmpty}>Nothing right now - you're all caught up.</Text>
              )}
              {notifs.map((n) => {
                const isUnread = !readNotifs.includes(n.id);
                return (
                  <View key={n.id} style={[styles.notifItem, isUnread && styles.notifItemUnread]}>
                    <View style={styles.notifIcon}>
                      <n.Icon size={17} color={n.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.notifItemTop}>
                        <Text style={styles.notifItemTitle}>{n.title}</Text>
                        <Text style={styles.notifTime}>{n.time}</Text>
                      </View>
                      <Text style={styles.notifBody}>{n.body}</Text>
                    </View>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 24 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingBlock: { flex: 1, paddingRight: 12 },
  greetingLine: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  greetingName: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginTop: 1 },
  greetingSub: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#e05252', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#eaf2f6' },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  realityWrap: { marginTop: 18 },
  realityCard: {
    height: 92, // fixed so long and short messages take the same space
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  realityIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  realityLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  realityText: { fontSize: 14, color: Colors.text, lineHeight: 20, height: 40 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#dbe4ee' },
  dotActive: { width: 18, backgroundColor: '#d99a3a' },

  body: { padding: 24, gap: 16 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 22, padding: 20, shadowColor: '#22303e', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  checkinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  flameBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef9ec', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  flameCount: { fontSize: 16, fontWeight: '700', color: '#92400e' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayCircleToday: { borderWidth: 2, borderColor: Colors.secondary, borderStyle: 'dashed', backgroundColor: 'transparent' },
  dayCircleEmpty: { backgroundColor: Colors.bg },
  dayCircleSlip: { backgroundColor: '#e59a9a' },
  dayNum: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },
  dayLabel: { fontSize: 10, color: Colors.textLight },
  dayLabelToday: { color: Colors.secondaryDark, fontWeight: '700' },
  // Transparent spacer: keeps the vertical rhythm but shows no line against
  // the card's gradient background.
  divider: { height: 1, backgroundColor: 'transparent', marginVertical: 18 },
  blockLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 12 },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  moodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: Colors.bg, alignItems: 'center', gap: 4 },
  // Neutral highlight on select - the colour cue lives on the icon itself.
  moodBtnActive: { borderColor: '#d5dce3', backgroundColor: '#eceff3' },
  moodLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
  noteInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    fontSize: 14,
    color: Colors.text,
    minHeight: 56,
    lineHeight: 20,
    marginBottom: 14,
  },
  betRow: { flexDirection: 'row', gap: 10 },
  betBtn: {
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  betBtnIcon: { position: 'absolute', right: -8, top: -4, bottom: -4, justifyContent: 'center' },
  betBtnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  resultCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  resultClean: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#86efac', borderRadius: 14, padding: 16 },
  resultCleanTitle: { fontSize: 15, fontWeight: '700', color: '#166534' },
  resultCleanSub: { fontSize: 12, color: '#4f9a74', marginTop: 2 },
  resultSlip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fed7aa', borderRadius: 14, padding: 16 },
  resultSlipTitle: { fontSize: 14, fontWeight: '700', color: '#9a3412' },
  resultSlipSub: { fontSize: 12, color: '#c2703a', marginTop: 2 },
  checkinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eef6ff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#22303e',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  checkinBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  checkinBannerSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  checkinBannerGo: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  mathCard: { backgroundColor: Colors.bgCard, borderRadius: 22, padding: 20, shadowColor: '#22303e', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  mathTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  mathSub: { fontSize: 12, color: Colors.textMuted, marginTop: 3, marginBottom: 14 },
  mathInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  pesoBox: { width: 48, height: 52, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  pesoSign: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  mathInput: { flex: 1, height: 52, borderRadius: 14, backgroundColor: Colors.bg, paddingHorizontal: 16, fontSize: 22, fontWeight: '700', color: Colors.text },
  seeRealHint: { marginTop: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center' },
  seeRealText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  altList: { marginTop: 14, gap: 2 },
  altHeader: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark, letterSpacing: 0.3, marginBottom: 8 },
  altRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 8 },
  altText: { fontSize: 14, color: Colors.text },
  altCount: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark },
  altHint: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic', lineHeight: 19 },
  logBetBtn: { marginTop: 6, borderRadius: 14, backgroundColor: Colors.primary, paddingVertical: 13, alignItems: 'center' },
  logBetText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  logBetDone: { marginTop: 14, borderRadius: 14, backgroundColor: Colors.bg, paddingVertical: 14, alignItems: 'center' },
  logBetDoneText: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#22303e',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  quickChip: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  // Informational, not a button: flat on the page background, no shadow, so it
  // reads clearly as non-tappable next to the white action cards.
  insightCard: {
    backgroundColor: Colors.bg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  insightChip: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  insightDesc: { fontSize: 12, color: Colors.textMuted },

  // Notifications panel
  notifBackdrop: { flex: 1, backgroundColor: 'rgba(15,22,32,0.35)', paddingTop: 78, paddingHorizontal: 16, alignItems: 'flex-end' },
  notifPanel: { width: '100%', maxWidth: 380, backgroundColor: Colors.bgCard, borderRadius: 20, padding: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  notifTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  notifMarkAll: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  notifItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 14 },
  notifItemUnread: { backgroundColor: '#f2f8fd' },
  notifIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  notifItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifItemTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  notifTime: { fontSize: 11, color: Colors.textLight },
  notifBody: { fontSize: 12.5, color: Colors.textMuted, lineHeight: 18, marginTop: 2 },
  notifEmpty: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
});
