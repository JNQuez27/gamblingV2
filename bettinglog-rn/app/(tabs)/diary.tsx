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

// "2026-07-12" + ISO timestamp → "Today, 9:41 AM" / "Yesterday, 7:15 PM" /
// "Mon, Jul 7".
function formatEntryDate(entry: DiaryEntry): string {
  const d = new Date(entry.createdAt || entry.date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
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

  // Highest bet-free run on record. The Home streak counts daily and resets
  // to zero after a slip; this pill remembers the personal best instead.
  const bestStreak = React.useMemo(() => {
    const cleanKeys = Object.keys(diaryEntries)
      .filter((k) => !/slip|gambled|natalo/i.test(diaryEntries[k].map((e) => e.note).join(' ')))
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
              <IconSprout size={30} color={Colors.secondaryDark} />
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyText}>
                Tap the + button to write your first reflection. Notes you add on the
                Home check-in show up here too.
              </Text>
            </View>
          ) : (
            entries.map((entry) => {
              const meta = moodMeta(entry.mood);
              return (
                <View
                  key={entry.id}
                  style={[styles.entryCard, { borderLeftWidth: 4, borderLeftColor: meta.tint }]}
                >
                  <View style={styles.entryTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryDate}>{formatEntryDate(entry)}</Text>
                      <View style={[styles.moodTag, { backgroundColor: meta.tint + '33' }]}>
                        <meta.Icon size={12} color={meta.accent} />
                        <Text style={styles.moodTagText}>{entry.mood}</Text>
                      </View>
                    </View>
                    <meta.Icon size={22} color={meta.accent} />
                  </View>
                  <Text style={styles.entryPreview}>{entry.note}</Text>
                </View>
              );
            })
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
  entryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  entryDate: { fontSize: 10, color: Colors.textLight, letterSpacing: 0.5 },
  entryTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginTop: 4 },
  moodTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  moodTagText: { fontSize: 11, fontWeight: '700', color: Colors.text },
  emptyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },
  anxietyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  anxietyPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  anxietyDot: { width: 8, height: 8, borderRadius: 4 },
  anxietyText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  anxietyMeter: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  meterSeg: { width: 12, height: 5, borderRadius: 3 },
  entryPreview: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primaryLight },
  tagText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '500' },
});
