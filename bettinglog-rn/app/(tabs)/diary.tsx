import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import JourneyMap from '@/components/diary/JourneyMap';
import { useAppContext } from '@/hooks/useAppContext';
import { daysBetween } from '@/utils/date';
import { isSlipNote } from '@/utils/diary';
import type { DiaryEntry } from '@/types/diary';
import {
  IconFlame,
  IconSprout,
  IconPencil,
  IconPlus,
  IconFaceGreat,
  IconFaceGood,
  IconFaceOkay,
  IconFaceLow,
  IconFaceStruggling,
  IconFaceTempted,
} from '@/components/ui/icons';

type MoodIcon = React.ComponentType<{ size?: number; color?: string }>;

// Same set and order as the Home Daily Check-in, so moods mean the same thing
// everywhere.
const MOOD_ICONS: MoodIcon[] = [IconFaceGreat, IconFaceGood, IconFaceOkay, IconFaceStruggling, IconFaceTempted];
const MOOD_LABELS = ['Great', 'Good', 'Okay', 'Struggling', 'Tempted'];
// Icon lights up in these colours when picked (matches the Home check-in).
const MOOD_COLORS = ['#e0913a', Colors.secondaryDark, Colors.primaryDark, '#cf5b57', '#9b6bd1'];

// Icon + accent for any mood label we might have stored - the diary compose
// uses one set, the home Daily Check-in another, so we map both here with a
// neutral fallback for anything unrecognized.
const MOOD_META: Record<string, { Icon: MoodIcon; accent: string; tint: string }> = {
  Struggling: { Icon: IconFaceStruggling, accent: '#c0625f', tint: '#dfa8a8' },
  Low: { Icon: IconFaceLow, accent: '#c78a2a', tint: '#e8c9a0' },
  Neutral: { Icon: IconFaceOkay, accent: '#8494a8', tint: '#cbd5e1' },
  Okay: { Icon: IconFaceOkay, accent: '#8494a8', tint: '#cbd5e1' },
  Good: { Icon: IconFaceGood, accent: '#4f9a74', tint: '#b5d6c3' },
  Great: { Icon: IconFaceGreat, accent: '#3f8f68', tint: '#7ab89a' },
  Tempted: { Icon: IconFaceTempted, accent: '#c05f8a', tint: '#e0a8c0' },
};
const MOOD_FALLBACK = { Icon: IconPencil, accent: Colors.primaryDark, tint: Colors.primaryLight };
const moodMeta = (label: string) => MOOD_META[label] ?? MOOD_FALLBACK;

// react-native-web falls back to the JS driver anyway; skip the warning.
const USE_NATIVE = Platform.OS !== 'web';

// Serif body gives the notes a warm, handwritten-journal feel (Soft UI /
// wellness direction). RN maps 'serif' to Noto Serif on Android; Georgia on iOS.
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

// Just the clock time, e.g. "9:41 AM" - the day is shown as a group header now.
function timeOf(entry: DiaryEntry): string {
  return new Date(entry.createdAt || entry.date).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// "Today" / "Yesterday" / "Wednesday, July 9" - the date-group header label.
function dayLabelOf(entry: DiaryEntry): string {
  const d = new Date(entry.createdAt || entry.date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
}

// One diary note, styled as a warm paper card with a mood avatar and serif body.
// Eases in with a small staggered rise so the feed feels alive, not static.
function EntryItem({ entry, index }: { entry: DiaryEntry; index: number }) {
  const meta = moodMeta(entry.mood);
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(Math.min(index, 8) * 55),
      Animated.spring(v, { toValue: 1, friction: 8, tension: 80, useNativeDriver: USE_NATIVE }),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
        ],
      }}
    >
      <View style={styles.paperCard}>
        <View style={[styles.moodAvatar, { backgroundColor: meta.tint + '33' }]}>
          <meta.Icon size={22} color={meta.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.paperTop}>
            <View style={styles.moodLabelRow}>
              <View style={[styles.moodDot, { backgroundColor: meta.accent }]} />
              <Text style={[styles.moodName, { color: meta.accent }]}>{entry.mood}</Text>
            </View>
            <Text style={styles.paperTime}>{timeOf(entry)}</Text>
          </View>
          <Text style={styles.paperNote}>{entry.note}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function DiaryScreen() {
  const { diaryEntries, addDiaryEntry, streak } = useAppContext();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [entryText, setEntryText] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'map' | 'notes'>('map');

  // Flatten the date-grouped entries into a single list, newest first.
  const entries: DiaryEntry[] = React.useMemo(
    () =>
      Object.values(diaryEntries)
        .flat()
        .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date)),
    [diaryEntries],
  );

  // Group the newest-first entries under day headers ("Today" / date), keeping
  // order so the feed reads as a running journal.
  const groupedEntries = React.useMemo(() => {
    const groups: { label: string; items: DiaryEntry[] }[] = [];
    for (const entry of entries) {
      const label = dayLabelOf(entry);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(entry);
      else groups.push({ label, items: [entry] });
    }
    return groups;
  }, [entries]);

  // Highest bet-free run on record. The Home streak counts daily and resets
  // to zero after a slip; this pill remembers the personal best instead.
  const bestStreak = React.useMemo(() => {
    const cleanKeys = Object.keys(diaryEntries)
      .filter((k) => !isSlipNote(diaryEntries[k].map((e) => e.note).join(' ')))
      .sort();
    let best = 0;
    let run = 0;
    let prev: string | null = null;
    for (const k of cleanKeys) {
      run = prev !== null && daysBetween(prev, k) === 1 ? run + 1 : 1;
      if (run > best) best = run;
      prev = k;
    }
    return Math.max(best, streak);
  }, [diaryEntries, streak]);

  const viewAnim = useRef(new Animated.Value(1)).current;
  const composeAnim = useRef(new Animated.Value(0)).current;

  // Compose card gently eases in when opened.
  useEffect(() => {
    Animated.timing(composeAnim, {
      toValue: showCompose ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: USE_NATIVE,
    }).start();
  }, [showCompose]);

  // Soft cross-fade between the map and notes views.
  const switchView = (next: 'map' | 'notes') => {
    if (next === view) return;
    Animated.timing(viewAnim, {
      toValue: 0,
      duration: 120,
      easing: Easing.in(Easing.ease),
      useNativeDriver: USE_NATIVE,
    }).start(() => {
      setView(next);
      Animated.timing(viewAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.ease),
        useNativeDriver: USE_NATIVE,
      }).start();
    });
  };

  // The floating button jumps to the notes view and opens the composer.
  const openCompose = () => {
    switchView('notes');
    setShowCompose(true);
  };

  // Persist the note to the diary (Supabase via the app provider), then reset
  // and close the compose card. The new entry shows up in the list on refresh.
  const handleSave = async () => {
    if (!entryText.trim() || saving) return;
    setSaving(true);
    try {
      const mood = selectedMood !== null ? MOOD_LABELS[selectedMood] : 'Okay';
      await addDiaryEntry(mood, entryText.trim());
      setShowCompose(false);
      setEntryText('');
      setSelectedMood(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        {/* Header */}
        <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>My Diary</Text>
              <Text style={styles.subtitle}>Your private reflection space</Text>
            </View>
            <View style={styles.streakPill} accessibilityLabel={`Best streak: ${bestStreak} days`}>
              <IconFlame size={14} color="#d99a3a" />
              <Text style={styles.streakPillText}>{bestStreak}</Text>
              <Text style={styles.streakPillBest}>BEST</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Journey Map / Diary Notes toggle */}
        <View style={styles.viewToggleRow}>
          <TouchableOpacity
            onPress={() => switchView('map')}
            style={[styles.viewToggleBtn, view === 'map' && styles.viewToggleBtnActive]}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === 'map' }}
            accessibilityLabel="Journey Map"
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={view === 'map' ? Colors.primaryDark : Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
              <Path d="M8 2v16" />
              <Path d="M16 6v16" />
            </Svg>
            <Text style={[styles.viewToggleText, view === 'map' && styles.viewToggleTextActive]}>Journey Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchView('notes')}
            style={[styles.viewToggleBtn, view === 'notes' && styles.viewToggleBtnActive]}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === 'notes' }}
            accessibilityLabel="Diary Notes"
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={view === 'notes' ? Colors.primaryDark : Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </Svg>
            <Text style={[styles.viewToggleText, view === 'notes' && styles.viewToggleTextActive]}>Diary Notes</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            flex: 1,
            opacity: viewAnim,
            transform: [{ translateY: viewAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          }}
        >
        {view === 'map' ? (
          <JourneyMap />
        ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Compose panel */}
          {showCompose && (
            <Animated.View
              style={[
                styles.composeCard,
                {
                  opacity: composeAnim,
                  transform: [{ translateY: composeAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
                },
              ]}
            >
              <Text style={styles.composeTitle}>How are you feeling?</Text>

              {/* Mood selector */}
              <View style={styles.moodRow}>
                {MOOD_ICONS.map((MoodFace, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedMood(i)}
                    style={[styles.moodBtn, selectedMood === i && styles.moodBtnActive]}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedMood === i }}
                    accessibilityLabel={`Mood: ${MOOD_LABELS[i]}`}
                  >
                    <MoodFace size={22} color={selectedMood === i ? MOOD_COLORS[i] : Colors.textLight} />
                    <Text style={styles.moodLabel}>{MOOD_LABELS[i]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textarea}
                value={entryText}
                onChangeText={setEntryText}
                placeholder="What's on your mind? Write freely, without judgment..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <View style={styles.composeBtns}>
                <TouchableOpacity
                  onPress={() => setShowCompose(false)}
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel entry"
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!entryText.trim() || saving}
                  style={{ flex: 2 }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Save entry"
                  accessibilityState={{ disabled: !entryText.trim() || saving }}
                >
                  <LinearGradient
                    colors={entryText.trim() ? [Colors.secondaryDark, Colors.secondary] : [Colors.border, Colors.border]}
                    style={styles.saveBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.saveText, !entryText.trim() && { color: Colors.textLight }]}>
                      {saving ? 'Saving…' : 'Save Entry'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Past entries */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Past Entries</Text>
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{entries.length}</Text>
            </View>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <IconSprout size={32} color={Colors.secondaryDark} />
              </View>
              <Text style={styles.emptyTitle}>Your story starts here</Text>
              <Text style={styles.emptyText}>
                Tap the pencil to write your first reflection. Notes you add on the
                Home check-in land here too.
              </Text>
            </View>
          ) : (
            groupedEntries.map((group, gi) => (
              <View key={group.label} style={gi > 0 ? styles.dayGroup : undefined}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{group.label}</Text>
                  <View style={styles.dayHeaderLine} />
                  <Text style={styles.dayHeaderCount}>
                    {group.items.length} {group.items.length === 1 ? 'note' : 'notes'}
                  </Text>
                </View>
                {group.items.map((entry, i) => (
                  <EntryItem key={entry.id} entry={entry} index={i} />
                ))}
              </View>
            ))
          )}
        </ScrollView>
        )}

          {/* Soft edge fades on the scrollable notes list */}
          {view === 'notes' && (
            <>
              <LinearGradient
                pointerEvents="none"
                colors={[Colors.bg, 'rgba(240,244,248,0)']}
                style={styles.fadeTop}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(240,244,248,0)', Colors.bg]}
                style={styles.fadeBottom}
              />
            </>
          )}
        </Animated.View>
      </View>

      {/* Floating compose button - present on both Journey Map and Diary Notes */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCompose}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Write a new diary entry"
      >
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <IconPencil size={22} color={Colors.white} />
        </LinearGradient>
        <View style={styles.fabPlus}>
          <IconPlus size={12} color={Colors.primaryDark} strokeWidth={3.5} />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  streakPillText: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  streakPillBest: { fontSize: 8, fontWeight: '800', color: '#b98a3a', letterSpacing: 0.5 },
  fab: { position: 'absolute', right: 20, bottom: 22, width: 58, height: 58 },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabPlus: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  fadeTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 16 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 30 },
  viewToggleRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  viewToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 14,
  },
  viewToggleBtnActive: {
    backgroundColor: Colors.bgCard,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  viewToggleText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  viewToggleTextActive: { color: Colors.primaryDark, fontWeight: '700' },
  body: { padding: 24, gap: 12, paddingBottom: 100 },
  composeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  composeTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  moodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: Colors.bg, alignItems: 'center', gap: 4 },
  moodBtnActive: { borderColor: '#d5dce3', backgroundColor: '#eceff3' },
  moodLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
  textarea: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    lineHeight: 22,
  },
  composeBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  saveBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  countChip: { backgroundColor: 'rgba(91,155,213,0.12)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countChipText: { fontSize: 11, fontWeight: '700', color: Colors.primaryDark },
  // Day grouping header
  dayGroup: { marginTop: 18 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dayHeaderText: { fontSize: 12, fontWeight: '800', color: Colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
  dayHeaderLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dayHeaderCount: { fontSize: 11, fontWeight: '600', color: Colors.textLight },

  // Warm "paper" entry card
  paperCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1E8E2',
    shadowColor: '#6b5b4a',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  moodAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  paperTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  moodLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moodDot: { width: 7, height: 7, borderRadius: 4 },
  moodName: { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  paperTime: { fontSize: 11, color: Colors.textLight, fontWeight: '600' },
  paperNote: { fontFamily: SERIF, fontSize: 15.5, color: '#2c2620', lineHeight: 24 },
  emptyCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1E8E2',
    marginTop: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(122,184,154,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
