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
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAppContext } from '@/hooks/useAppContext';
import { IconX, IconLeaf } from '@/components/ui/icons';
import Mascot from '@/components/ui/Mascot';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const USE_NATIVE = Platform.OS !== 'web';

// Serif body to match the Diary Notes "paper" journal treatment (Noto Serif on
// Android, Georgia on iOS).
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const NODE = 64;
const LEVEL_GAP = 180; // roomy enough for the badge + mascot stack above the current node
const TOP_PAD = 130;
const BOTTOM_PAD = 80;

// Fast-navigation rail: once the trail is this long, show a column of evenly
// spaced day markers so the user can jump instead of scrolling endlessly.
const SECTOR_MIN_DAYS = 100;
const SECTOR_COUNT = 10;

// Zig-zag column positions (fraction of screen width), cycled down the trail.
const X_LANES = [0.5, 0.66, 0.34, 0.6, 0.4, 0.66, 0.33, 0.5];

type LevelStatus = 'locked' | 'current' | 'done';

type DayDetail = {
  date: string;
  gambled: boolean;
  mood: string;
  note: string;
  amount?: number; // spent, when the user gambled
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

// One dotted connector between two consecutive nodes, drawn as its own small
// Svg. Rendering the whole trail as a single tall Svg crashes past Android's
// max canvas/texture size (~100+ day boards), so we tile it per segment.
function TrailSegment({ a, b }: { a: { x: number; y: number }; b: { x: number; y: number } }) {
  const M = 70; // horizontal margin for the curve's overshoot
  const left = Math.min(a.x, b.x) - M;
  const width = Math.abs(b.x - a.x) + 2 * M;
  const height = b.y - a.y;
  const ax = a.x - left;
  const bx = b.x - left;
  const d = `M ${ax} 0 C ${ax} ${LEVEL_GAP * 0.5}, ${bx} ${height - LEVEL_GAP * 0.5}, ${bx} ${height}`;
  return (
    <Svg style={{ position: 'absolute', left, top: a.y }} width={width} height={height} pointerEvents="none">
      <Path d={d} stroke="#b9cbdc" strokeWidth={3.5} strokeDasharray="1 11" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export default function JourneyMap() {
  const { diaryEntries, streak } = useAppContext();
  const [selected, setSelected] = useState<number | null>(null);

  // One completed node per logged day (newest first), built from the user's
  // real diary history. Each day's outcome and note come from that day's entry.
  const days = useMemo(() => {
    const real = Object.keys(diaryEntries)
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
    return real;
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
    days.forEach((d, i) => {
      out.push({
        level: totalDays - i,
        status: 'done',
        x: X_LANES[(i + 2) % X_LANES.length],
        detail: {
          date: shortDate(d.dateKey),
          gambled: d.gambled,
          mood: d.mood,
          note: d.note,
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
  const scrollRef = useRef<ScrollView>(null);

  // Long trails (100+ days) get a pinned jump-rail: ~10 evenly-spaced day
  // markers so the user can leap anywhere - including straight back to day 1 -
  // instead of scrolling forever.
  const totalDays = days.length;
  const levelY = useMemo(() => {
    const m = new Map<number, number>();
    levels.forEach((l, i) => m.set(l.level, points[i].y));
    return m;
  }, [levels, points]);
  const sectors = useMemo(() => {
    if (totalDays < SECTOR_MIN_DAYS) return [];
    const anchors: number[] = [];
    for (let k = 0; k < SECTOR_COUNT; k++) {
      const day = Math.round(totalDays - (k * (totalDays - 1)) / (SECTOR_COUNT - 1));
      anchors.push(Math.max(1, day));
    }
    return [...new Set(anchors)]; // newest (top) → day 1 (bottom)
  }, [totalDays]);
  const jumpToDay = (day: number) => {
    const y = levelY.get(day);
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 130), animated: true });
  };

  useEffect(() => {
    // Keep the whole cascade ~1.4s no matter how many nodes, so a 100-day trail
    // doesn't animate in for 12 seconds.
    const step = Math.max(10, Math.min(120, Math.floor(1400 / Math.max(1, nodeAnims.length))));
    Animated.stagger(
      step,
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
      {/* Only the board scrolls - the screen header and toggle stay fixed.
          flex:1 bounds the ScrollView to the viewport so a tall board (many
          logged days) actually scrolls instead of clipping. */}
      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.board, { height: boardHeight }]}>
          {/* Dotted trail: one small Svg per gap (see TrailSegment) so a long
              board never becomes a single oversized canvas. */}
          {points.slice(0, -1).map((a, i) => (
            <TrailSegment key={i} a={a} b={points[i + 1]} />
          ))}

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
        </View>
      </ScrollView>

      {/* Fast-navigation rail (long trails only) */}
      {sectors.length > 0 && (
        <View style={styles.sectorRail}>
          {sectors.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.sectorPill, day === 1 && styles.sectorPillEnd]}
              onPress={() => jumpToDay(day)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={day === 1 ? 'Jump to day 1' : `Jump to day ${day}`}
            >
              <Text style={[styles.sectorText, day === 1 && styles.sectorTextEnd]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
  scroll: { flex: 1 },
  board: { width: '100%', backgroundColor: Colors.bg },

  // Fast-navigation rail
  sectorRail: {
    position: 'absolute',
    right: 6,
    top: 90,
    bottom: 100, // clear the compose FAB at the bottom-right
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectorPill: {
    minWidth: 36,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: '#22303e',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectorPillEnd: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  sectorText: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark },
  sectorTextEnd: { color: Colors.white },
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
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1E8E2',
    shadowColor: '#6b5b4a',
    shadowOpacity: 0.18,
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
    fontFamily: SERIF,
    fontSize: 14.5,
    color: '#2c2620',
    lineHeight: 22,
    borderLeftWidth: 3,
    borderLeftColor: '#E4D6C3',
    paddingLeft: 12,
    marginBottom: 10,
  },
  detailFooter: { fontSize: 12, color: Colors.secondaryDark, fontWeight: '600' },
});
