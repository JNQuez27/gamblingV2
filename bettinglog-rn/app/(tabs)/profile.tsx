import React from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const ACHIEVEMENTS = [
  { icon: '🔥', label: '3-Day Streak', desc: '3 days in a row', unlocked: true },
  { icon: '🌱', label: 'First Reflection', desc: 'Wrote your first diary entry', unlocked: true },
  { icon: '🧘', label: 'Mindful Week', desc: '7 consecutive pauses', unlocked: false },
  { icon: '🌟', label: '30-Day Champion', desc: 'Complete 30-day streak', unlocked: false },
  { icon: '💎', label: 'Deep Thinker', desc: 'Write 10 diary entries', unlocked: false },
  { icon: '🏔️', label: 'Peak Awareness', desc: 'Log 50 pauses', unlocked: false },
];

const STAT_CARDS = [
  { label: 'Current Streak', value: '3', unit: 'days', icon: '🔥', bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
  { label: 'Total Pauses', value: '24', unit: 'logged', icon: '✋', bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  { label: 'Diary Entries', value: '7', unit: 'written', icon: '📓', bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  { label: 'Best Streak', value: '5', unit: 'days', icon: '🏆', bg: '#fdf4ff', border: '#e9d5ff', text: '#6b21a8' },
];

const WEEK_BARS = [60, 30, 80, 50, 100, 40, 20];
const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#e8f4fd', '#d4eaf7', '#c8e8e0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.settingsRow}>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="3" />
                <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarText}>J</Text>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <Text style={{ fontSize: 10 }}>✓</Text>
            </View>
          </View>

          <Text style={styles.name}>Juan Rivera</Text>
          <Text style={styles.email}>juan@example.com</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>Member since Jan 2026</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats */}
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {STAT_CARDS.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg, borderColor: stat.border }]}>
                <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.text }]}>{stat.value}</Text>
                <Text style={[styles.statUnit, { color: stat.text }]}>{stat.unit}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Weekly activity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>This Week's Activity</Text>
            <View style={styles.barsRow}>
              {WEEK_BARS.map((h, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    {i < 3 ? (
                      <LinearGradient
                        colors={[Colors.secondary, Colors.secondaryDark]}
                        style={[styles.bar, { height: h * 0.56 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      />
                    ) : (
                      <View style={[styles.bar, { height: h * 0.56, backgroundColor: Colors.border }]} />
                    )}
                  </View>
                  <Text style={styles.barLabel}>{WEEK_LABELS[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Achievements */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achieveGrid}>
            {ACHIEVEMENTS.map((badge) => (
              <View
                key={badge.label}
                style={[
                  styles.badgeCard,
                  badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <Text style={[{ fontSize: 26 }, !badge.unlocked && { opacity: 0.4 }]}>{badge.icon}</Text>
                <Text style={styles.badgeLabel}>{badge.label}</Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
                {!badge.unlocked && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedText}>Locked</Text>
                  </View>
                )}
              </View>
            ))}
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 16 },
  statValue: { fontSize: 26, fontWeight: '700', lineHeight: 32, marginTop: 6 },
  statUnit: { fontSize: 11, opacity: 0.7, marginTop: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginTop: 4 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  barsRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 60 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.textLight },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '30%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 6 },
  badgeUnlocked: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.secondaryLight, shadowColor: Colors.secondary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  badgeLocked: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: Colors.border, opacity: 0.55 },
  badgeLabel: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center', lineHeight: 14 },
  badgeDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 13 },
  lockedBadge: { backgroundColor: Colors.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  lockedText: { fontSize: 10, color: Colors.textLight },
});
