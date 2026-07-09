import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Polyline } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const REFLECTION_PROMPTS = [
  'What triggered your last strong reaction?',
  'When did you pause before responding today?',
  'What pattern did you notice in yourself this week?',
  'Name one moment you\'re proud of today.',
];

const QUICK_ACTIONS = [
  { icon: '✍️', label: 'Write in diary', route: '/(tabs)/diary' as const },
  { icon: '📚', label: 'Learn something', route: '/(tabs)/learn' as const },
  { icon: '🔔', label: 'Set reminder', route: '/settings' as const },
];

const PROMPT_INDEX = Math.floor(Math.random() * REFLECTION_PROMPTS.length);

export default function HomeScreen() {
  const [streakMarked, setStreakMarked] = useState(false);
  const activeStreak = 3;
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#e8f4fd', '#d4eaf7', '#c8e8e0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Hello, Juan 👋</Text>
              <Text style={styles.greetingSub}>Ready to reflect today?</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round">
                  <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.avatarText}>J</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reality Check */}
          <View style={styles.realityCard}>
            <View style={styles.realityIcon}>
              <Text style={{ fontSize: 18 }}>💡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.realityLabel}>Reality Check</Text>
              <Text style={styles.realityText}>
                You've responded impulsively 3 times this week. Pausing for 6 seconds before reacting can reduce this significantly.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Weekly Streak */}
          <View style={styles.card}>
            <View style={styles.streakHeader}>
              <View>
                <Text style={styles.cardTitle}>Weekly Streak</Text>
                <Text style={styles.cardSub}>Keep the momentum going</Text>
              </View>
              <View style={styles.flameBadge}>
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={styles.flameCount}>{streakMarked ? activeStreak + 1 : activeStreak}</Text>
              </View>
            </View>

            <View style={styles.daysRow}>
              {WEEK_DAYS.map((day, i) => {
                const isDone = i < activeStreak || (streakMarked && i === activeStreak);
                const isToday = i === activeStreak;
                return (
                  <View key={i} style={styles.dayCol}>
                    {isDone ? (
                      <LinearGradient colors={[Colors.secondaryDark, Colors.secondary]} style={styles.dayCircle}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <Polyline points="20 6 9 17 4 12" />
                        </Svg>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.dayCircle, isToday && !streakMarked ? styles.dayCircleToday : styles.dayCircleEmpty]}>
                        <Text style={styles.dayNum}>{i + 1}</Text>
                      </View>
                    )}
                    <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Streak CTA */}
          {!streakMarked ? (
            <LinearGradient colors={[Colors.secondaryDark, Colors.secondary]} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <TouchableOpacity onPress={() => setStreakMarked(true)} style={styles.ctaTouchable}>
                <Text style={{ fontSize: 18 }}>✋</Text>
                <Text style={styles.ctaText}>I paused today — mark my streak!</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <View style={styles.streakSuccess}>
              <Text style={{ fontSize: 20 }}>🎉</Text>
              <View>
                <Text style={styles.streakSuccessTitle}>Amazing! Streak marked!</Text>
                <Text style={styles.streakSuccessSub}>Keep it going tomorrow.</Text>
              </View>
            </View>
          )}

          {/* Today's Prompt */}
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Text style={{ fontSize: 18 }}>🪞</Text>
              <Text style={styles.promptLabel}>Today's Prompt</Text>
            </View>
            <Text style={styles.promptText}>"{REFLECTION_PROMPTS[PROMPT_INDEX]}"</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/diary')} style={styles.promptBtn}>
              <Text style={styles.promptBtnText}>Reflect on this</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity key={action.label} onPress={() => router.push(action.route)} style={styles.quickCard}>
                <Text style={{ fontSize: 22 }}>{action.icon}</Text>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Insights */}
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          {[
            { icon: '😤', label: 'Anger pattern', desc: 'Identified on Tuesday • 3 triggers', bg: '#fee2e2', border: '#fca5a5' },
            { icon: '🧘', label: 'Mindful moment', desc: 'Logged on Monday • 4 min pause', bg: '#f0fdf4', border: '#86efac' },
          ].map((insight) => (
            <View key={insight.label} style={[styles.insightCard, { backgroundColor: insight.bg, borderColor: insight.border }]}>
              <Text style={{ fontSize: 24 }}>{insight.icon}</Text>
              <View>
                <Text style={styles.insightTitle}>{insight.label}</Text>
                <Text style={styles.insightDesc}>{insight.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 24 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 26, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  greetingSub: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  realityCard: {
    marginTop: 20,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  realityIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  realityLabel: { fontSize: 11, fontWeight: '700', color: '#92400e', letterSpacing: 1, marginBottom: 3 },
  realityText: { fontSize: 14, color: '#78350f', lineHeight: 20 },
  body: { padding: 24, gap: 16 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  flameBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef9ec', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  flameCount: { fontSize: 16, fontWeight: '700', color: '#92400e' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayCircleToday: { borderWidth: 2, borderColor: Colors.secondary, borderStyle: 'dashed', backgroundColor: 'transparent' },
  dayCircleEmpty: { backgroundColor: Colors.bg },
  dayNum: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },
  dayLabel: { fontSize: 11, color: Colors.textLight },
  dayLabelToday: { color: Colors.secondaryDark, fontWeight: '700' },
  ctaBtn: { borderRadius: 16, overflow: 'hidden' },
  ctaTouchable: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  streakSuccess: {
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakSuccessTitle: { fontSize: 15, fontWeight: '600', color: '#166534' },
  streakSuccessSub: { fontSize: 12, color: '#4ade80' },
  promptCard: { backgroundColor: '#eef6ff', borderWidth: 1, borderColor: Colors.primaryLight, borderRadius: 20, padding: 20 },
  promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  promptLabel: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark, letterSpacing: 1 },
  promptText: { fontSize: 16, color: Colors.text, lineHeight: 26, fontWeight: '500', marginBottom: 14 },
  promptBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' },
  promptBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  quickLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  insightCard: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  insightDesc: { fontSize: 12, color: Colors.textMuted },
});
