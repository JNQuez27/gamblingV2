// src/components/diary/JourneyMap.tsx
//
// Duolingo-style journey map for the diary tab: a soft blue-green board (same
// wash as the screen headers) with a dotted path snaking through level nodes.
// The map scrolls inside its own area while the screen header stays fixed.
// Completed days are tappable and distinguish bet-free days (green) from days
// the user gambled (soft red); tapping one opens a detail card with money
// kept/spent, mood and the day's note. "Drip" the mascot - a calm droplet with
// a growth sprout - floats at the user's current level.
//
// Data-driven: the levels are built from the signed-in user's real diary
// history (one node per logged day, newest at the bottom of the trail). The
// trail is a record of check-ins - the current node shows the check-in day the
// user is on (recorded days + 1), so a brand-new user starts at day 1.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAppContext } from '@/hooks/useAppContext';
import { PAGCOR_REFERENCE_BETS } from '@/constants/phPrices';
import { IconX, IconLeaf } from '@/components/ui/icons';
import Mascot from '@/components/ui/Mascot';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const USE_NATIVE = Platform.OS !== 'web';

const NODE = 64;
const LEVEL_GAP = 180; // roomy enough for the badge + mascot stack above the current node
const TOP_PAD = 130;
const BOTTOM_PAD = 80;

// How many completed days to draw on the trail (keeps the board a sane height).
const MAX_DONE_NODES = 6;

// Zig-zag column positions (fraction of screen width), cycled down the trail.
const X_LANES = [0.5, 0.66, 0.34, 0.6, 0.4, 0.66, 0.33, 0.5];

type LevelStatus = 'locked' | 'current' | 'done';

type DayDetail = {
  date: string;
  gambled: boolean;
  mood: string;
  note: string;
  amount?: number; // spent, when the user gambled
  saved?: number; // kept, on a bet-free day
  trigger?: string;
};

type Level = { level: number; status: LevelStatus; x: number; detail?: DayDetail };

// "2026-07-07" → "Jul 7"
function shortDate(dateKey: string): string {
  return new Date(dateKey).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

// A day counts as a slip when its note carries the honest-slip wording the
// Home check-in writes, or the word "gambled". Manual reflections read as
// bet-free days.
function looksGambled(note: string): boolean {
  return /slip|gambled|natalo/i.test(note);
}

// Faint palette-tinted specks that give the board quiet depth.
const AMBIENT_DOTS = [
  { x: 0.12, y: 100, r: 3, c: Colors.primary, o: 0.3 },
  { x: 0.85, y: 160, r: 2, c: Colors.secondary, o: 0.35 },
  { x: 0.2, y: 270, r: 2.5, c: Colors.secondary, o: 0.28 },
  { x: 0.9, y: 340, r: 3, c: Colors.primary, o: 0.25 },
  { x: 0.15, y: 440, r: 2, c: Colors.accent, o: 0.35 },
  { x: 0.82, y: 510, r: 2.5, c: Colors.primary, o: 0.28 },
  { x: 0.6, y: 620, r: 2, c: Colors.secondary, o: 0.3 },
];

// Dotted guide path: flows in from the top edge, snakes through every node,
// then exits toward the bottom for future levels.
function buildPath(points: { x: number; y: number }[], mapHeight: number): string {
  const first = points[0];
  let d = `M ${first.x + 70} -30 C ${first.x + 60} ${first.y - 90}, ${first.x} ${first.y - 70}, ${first.x} ${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    d += ` C ${a.x} ${a.y + LEVEL_GAP * 0.5}, ${b.x} ${b.y - LEVEL_GAP * 0.5}, ${b.x} ${b.y}`;
  }
  const last = points[points.length - 1];
  d += ` C ${last.x} ${last.y + 60}, ${last.x - 40} ${last.y + 70}, ${last.x - 50} ${mapHeight + 30}`;
  return d;
}

export default function JourneyMap() {
  const { diaryEntries, streak } = useAppContext();
  const [selected, setSelected] = useState<number | null>(null);

  // One completed node per logged day (newest first), built from the user's
  // real diary history. Each day's outcome and note come from that day's entry.
  const days = useMemo(() => {
    return Object.keys(diaryEntries)
      .sort((a, b) => b.localeCompare(a)) // most recent date first
      .map((dateKey) => {
        const dayEntries = diaryEntries[dateKey];
        const rep = dayEntries[dayEntries.length - 1] ?? dayEntries[0];
        const combined = dayEntries.map((e) => e.note).join(' ');
        return {
          dateKey,
          mood: rep.mood,
          note: rep.note,
          gambled: looksGambled(combined),
        };
      });
  }, [diaryEntries]);

  // Levels: a locked "future" node at the top, the current node, then a
  // completed node per recorded day. The trail is a RECORD of check-ins, not a
  // streak: the current node's number is the check-in day the user is on
  // (days already recorded + 1), so a brand-new user starts at day 1.
  const levels: Level[] = useMemo(() => {
    const totalDays = days.length;
    const out: Level[] = [
      { level: totalDays + 2, status: 'locked', x: X_LANES[0] },
      { level: totalDays + 1, status: 'current', x: X_LANES[1] },
    ];
    days.slice(0, MAX_DONE_NODES).forEach((d, i) => {
      out.push({
        level: totalDays - i,
        status: 'done',
        x: X_LANES[(i + 2) % X_LANES.length],
        detail: {
          date: shortDate(d.dateKey),
          gambled: d.gambled,
          mood: d.mood,
          note: d.note,
          saved: d.gambled ? undefined : PAGCOR_REFERENCE_BETS.averageSessionSpend,
        },
      });
    });
    return out;
  }, [days]);

  const mapHeight = TOP_PAD + (levels.length - 1) * LEVEL_GAP + BOTTOM_PAD + NODE;
  const points = useMemo(
    () => levels.map((l, i) => ({ x: l.x * SCREEN_W, y: TOP_PAD + i * LEVEL_GAP })),
    [levels],
  );
  const selectedLevel = levels.find((l) => l.level === selected && l.status === 'done');

  // Nodes drift in one after another; the current node breathes slowly and the
  // mascot bobs with the same rhythm. The detail card slides up when a day is
  // selected. Anim values are keyed to the level count so they stay in sync
  // when the user's history loads or grows.
  const nodeAnims = useMemo(
    () => levels.map(() => new Animated.Value(0)),
    [levels.length],
  );
  const pulse = useRef(new Animated.Value(0)).current;
  const detailAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(
      120,
      nodeAnims.map((a) =>
        Animated.spring(a, { toValue: 1, friction: 7, tension: 60, useNativeDriver: USE_NATIVE })
      )
    ).start();
  }, [nodeAnims]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: USE_NATIVE }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: USE_NATIVE }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (selected != null) {
      detailAnim.setValue(0);
      Animated.timing(detailAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: USE_NATIVE,
      }).start();
    }
  }, [selected]);

  const haloStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
  };

  const floatStyle = {
    transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  };

  // Fill at least the visible area so the gradient reaches the bottom - no gray
  // gap for a new user whose trail is short. (~240 = header + toggle + tab bar.)
  const boardHeight = Math.max(mapHeight, SCREEN_H - 240);

  return (
    <View style={styles.wrapper}>
      {/* Only the board scrolls - the screen header and toggle stay fixed. */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.bg, '#eef2ef', Colors.bg]}
          style={[styles.board, { height: boardHeight }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Svg width={SCREEN_W} height={boardHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Soft glow pools for depth */}
            <Circle cx={SCREEN_W * 0.88} cy={140} r={95} fill={Colors.primary} fillOpacity={0.06} />
            <Circle cx={SCREEN_W * 0.1} cy={530} r={110} fill={Colors.secondary} fillOpacity={0.07} />
            {AMBIENT_DOTS.map((d, i) => (
              <Circle key={i} cx={d.x * SCREEN_W} cy={d.y} r={d.r} fill={d.c} fillOpacity={d.o} />
            ))}
            <Path
              d={buildPath(points, mapHeight)}
              stroke="#b9cbdc"
              strokeWidth={3.5}
              strokeDasharray="1 11"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>

          {levels.map((lvl, i) => {
            const { x, y } = points[i];
            const entrance = {
              opacity: nodeAnims[i],
              transform: [{ scale: nodeAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
            };
            return (
              <Animated.View
                key={`${lvl.status}-${i}`}
                style={[styles.nodeWrap, { left: x - NODE / 2, top: y - NODE / 2 }, entrance]}
              >
                {lvl.status === 'locked' && (
                  <>
                    <View style={styles.nodeLocked}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Rect x="3" y="11" width="18" height="11" rx="2" />
                        <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </Svg>
                    </View>
                    <Text style={styles.lockedLabel}>LV {lvl.level}</Text>
                  </>
                )}

                {lvl.status === 'current' && (
                  <>
                    <View style={styles.hereBadge}>
                      <Text style={styles.hereText}>YOU ARE HERE</Text>
                    </View>
                    <Animated.View style={[styles.mascotWrap, floatStyle]}>
                      <Mascot />
                    </Animated.View>
                    <View>
                      <Animated.View style={[styles.halo, haloStyle]} />
                      <View style={styles.nodeCurrentOuter}>
                        <View style={styles.nodeCurrent}>
                          <Text style={styles.currentNum}>{lvl.level}</Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}

                {lvl.status === 'done' && lvl.detail && (
                  <>
                    <TouchableOpacity
                      onPress={() => setSelected(selected === lvl.level ? null : lvl.level)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Day ${lvl.level}, ${lvl.detail.gambled ? 'gambled' : 'bet-free'}. Show details`}
                      style={[
                        styles.nodeDone,
                        lvl.detail.gambled ? styles.nodeSlip : styles.nodeClean,
                        selected === lvl.level && styles.nodeSelected,
                      ]}
                    >
                      <Text style={[styles.doneNum, { color: lvl.detail.gambled ? '#7c2d2d' : Colors.white }]}>
                        {lvl.level}
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.doneLabel, { color: lvl.detail.gambled ? '#c0625f' : Colors.secondaryDark }]}>
                      {lvl.detail.gambled ? 'GAMBLED' : 'BET-FREE'}
                    </Text>
                  </>
                )}
              </Animated.View>
            );
          })}

          {/* Quiet footer note */}
          <View style={styles.captionWrap} pointerEvents="none">
            <Text style={styles.caption}>Every step counts</Text>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Pinned overlays */}
      <View style={styles.pinnedTop} pointerEvents="none">
        <View style={styles.progressChip}>
          <Text style={styles.progressText}>
            {days.length} day{days.length === 1 ? '' : 's'} logged · {streak}-day streak
          </Text>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.legendText}>Bet-free</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.warningCritical }]} />
            <Text style={styles.legendText}>Gambled</Text>
          </View>
        </View>
      </View>

      {/* Day detail card */}
      {selectedLevel?.detail && (
        <Animated.View
          style={[
            styles.detailCard,
            {
              opacity: detailAnim,
              transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            },
          ]}
        >
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Day {selectedLevel.level}</Text>
            <Text style={styles.detailDate}>{selectedLevel.detail.date}</Text>
            <TouchableOpacity
              onPress={() => setSelected(null)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close details"
            >
              <IconX size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={[styles.statusChip, selectedLevel.detail.gambled ? styles.statusChipSlip : styles.statusChipClean]}>
            {!selectedLevel.detail.gambled && <IconLeaf size={12} color={Colors.secondaryDark} />}
            <Text style={[styles.statusChipText, { color: selectedLevel.detail.gambled ? '#9c3b3b' : Colors.secondaryDark }]}>
              {selectedLevel.detail.gambled ? 'Gambled that day' : 'Bet-free day'}
            </Text>
          </View>

          <View style={styles.detailRows}>
            {!selectedLevel.detail.gambled && selectedLevel.detail.saved != null && (
              <View style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>Money kept</Text>
                <Text style={styles.detailRowValue}>₱{selectedLevel.detail.saved}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailRowLabel}>Mood</Text>
              <Text style={styles.detailRowValue}>{selectedLevel.detail.mood}</Text>
            </View>
          </View>

          <Text style={styles.detailNote}>"{selectedLevel.detail.note}"</Text>
          <Text style={styles.detailFooter}>
            {selectedLevel.detail.gambled
              ? 'A slip you log is awareness gained - tomorrow counts.'
              : "One day at a time - it's working."}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bg },
  board: { width: '100%' },
  nodeWrap: { position: 'absolute', width: NODE, alignItems: 'center' },

  pinnedTop: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center', gap: 6 },
  progressChip: {
    backgroundColor: 'rgba(226,242,234,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(122,184,154,0.4)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  progressText: { fontSize: 11, fontWeight: '600', color: Colors.secondaryDark, letterSpacing: 0.4 },
  legendRow: { flexDirection: 'row', gap: 8 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },

  // Locked
  nodeLocked: {
    width: NODE,
    height: NODE,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lockedLabel: { marginTop: 8, fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 1.5 },

  // Current
  hereBadge: {
    position: 'absolute',
    top: -78,
    width: 118,
    left: (NODE - 118) / 2,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    zIndex: 3,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  hereText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  mascotWrap: {
    position: 'absolute',
    top: -46,
    width: 54,
    left: (NODE - 54) / 2,
    zIndex: 2,
  },
  halo: {
    position: 'absolute',
    width: NODE + 24,
    height: NODE + 24,
    left: -8,
    top: -8,
    borderRadius: 28,
    backgroundColor: 'rgba(91,155,213,0.28)',
  },
  nodeCurrentOuter: {
    borderRadius: 24,
    padding: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(91,155,213,0.45)',
    backgroundColor: 'rgba(91,155,213,0.08)',
  },
  nodeCurrent: {
    width: NODE,
    height: NODE,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  currentNum: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },

  // Done (base + per-outcome variants)
  nodeDone: {
    width: NODE,
    height: NODE,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  nodeClean: { backgroundColor: Colors.secondary, borderColor: Colors.secondaryDark, shadowColor: Colors.secondary },
  nodeSlip: { backgroundColor: '#fca5a5', borderColor: '#d98383', shadowColor: '#fca5a5' },
  nodeSelected: { borderWidth: 3, borderColor: Colors.primaryDark },
  doneNum: { fontSize: 20, fontWeight: '800' },
  doneLabel: { marginTop: 8, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  captionWrap: { position: 'absolute', bottom: 22, left: 0, right: 0, alignItems: 'center' },
  caption: { fontSize: 12, color: Colors.textLight, letterSpacing: 0.5, fontStyle: 'italic' },

  // Day detail card
  detailCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  detailTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  detailDate: { flex: 1, fontSize: 12, color: Colors.textLight },
  detailClose: { fontSize: 14, color: Colors.textMuted, padding: 2 },
  statusChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusChipClean: { backgroundColor: 'rgba(122,184,154,0.15)', borderColor: 'rgba(122,184,154,0.4)' },
  statusChipSlip: { backgroundColor: 'rgba(252,165,165,0.18)', borderColor: 'rgba(252,165,165,0.5)' },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  detailRows: { gap: 6, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailRowLabel: { fontSize: 13, color: Colors.textMuted },
  detailRowValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  detailNote: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 19,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryLight,
    paddingLeft: 10,
    marginBottom: 10,
  },
  detailFooter: { fontSize: 12, color: Colors.secondaryDark, fontWeight: '600' },
});
