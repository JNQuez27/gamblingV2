import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAppContext } from '@/hooks/useAppContext';
import { visitRiskLevel } from '@/utils/thresholdEngine';

// Risk levels map to the existing palette (low = green, medium = gold, high = soft red).
const RISK_COLORS = {
  low: Colors.secondaryDark,
  medium: '#c78a2a',
  high: '#c9433f',
} as const;

type RiskLevel = keyof typeof RISK_COLORS;

type GamblingVisit = {
  id: string;
  name: string;          // app or site name from the usage log
  category: string;
  timestamp: string;
  sessionDuration?: number; // seconds
  riskLevel: RiskLevel;
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'high-risk', label: 'High risk' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

/**
 * GamblingVisitLogs - detailed, scrollable log of gambling app/site visits,
 * read from gambling_usage_logs via app context. Risk per visit is derived
 * (late-night / long-session heuristic in thresholdEngine).
 */
export default function GamblingVisitLogs() {
  const { usageLogs } = useAppContext();
  const visits: GamblingVisit[] = usageLogs.map((log) => ({
    id: log.id,
    name: log.appName,
    category: log.category ?? 'other',
    timestamp: log.createdAt,
    sessionDuration: log.timeSpent > 0 ? log.timeSpent * 60 : undefined,
    riskLevel: visitRiskLevel(log.createdAt, log.timeSpent),
  }));
  const [filterBy, setFilterBy] = useState<FilterKey>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
  const todayVisits = visits.filter((v) => isToday(v.timestamp));
  const highRiskCount = visits.filter((v) => v.riskLevel === 'high').length;

  const filteredVisits = (() => {
    let list = visits;
    if (filterBy === 'today') list = todayVisits;
    else if (filterBy === 'high-risk') list = visits.filter((v) => v.riskLevel === 'high');
    return [...list].sort((a, b) => {
      const t = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortBy === 'newest' ? -t : t;
    });
  })();

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (date.toDateString() === today.toDateString()) dateStr = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) dateStr = 'Yesterday';
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date: dateStr, time: timeStr };
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'sports-betting': '🏈',
      poker: '♠️',
      casino: '🎰',
      slots: '🎲',
      lotteries: '🎫',
      'esports-betting': '🎮',
      'betting-exchange': '💱',
      other: '🎯',
    };
    return iconMap[category] || '🎯';
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Summary chips */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryValue}>{visits.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryValue}>{todayVisits.length}</Text>
          <Text style={styles.summaryLabel}>Today</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryValue, { color: RISK_COLORS.high }]}>{highRiskCount}</Text>
          <Text style={styles.summaryLabel}>High risk</Text>
        </View>
      </View>

      {/* Clean filter bar: soft pills + compact sort toggle */}
      <View style={styles.filterBar}>
        <View style={styles.filterPills}>
          {FILTERS.map((f) => {
            const active = filterBy === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilterBy(f.key)}
                style={[styles.pill, active && styles.pillActive]}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={() => setSortBy((s) => (s === 'newest' ? 'oldest' : 'newest'))}
          style={styles.sortToggle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${sortBy} first. Tap to switch.`}
        >
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" />
          </Svg>
          <Text style={styles.sortText}>{sortBy === 'newest' ? 'Newest' : 'Oldest'}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filteredVisits.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsTitle}>No visits found</Text>
          <Text style={styles.noResultsText}>
            {filterBy === 'today' ? 'Nothing recorded today.' : filterBy === 'high-risk' ? 'No high-risk visits - great.' : 'No visits recorded.'}
          </Text>
        </View>
      ) : (
        filteredVisits.map((item) => {
          const { date, time } = formatDateTime(item.timestamp);
          const riskColor = RISK_COLORS[item.riskLevel];
          return (
            <View key={item.id} style={styles.logCard}>
              <View style={styles.cardHeader}>
                <View style={styles.siteInfo}>
                  <View style={styles.catIconWrap}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
                  </View>
                  <View style={styles.siteDetails}>
                    <Text style={styles.siteName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.category}>{item.category.replace('-', ' ')}</Text>
                  </View>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: riskColor + '18' }]}>
                  <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
                  <Text style={[styles.riskLabel, { color: riskColor }]}>{item.riskLevel}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{date}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>{time}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{formatDuration(item.sessionDuration)}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}

      {filteredVisits.length > 0 && (
        <Text style={styles.footerText}>Showing {filteredVisits.length} of {visits.length} visits</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryChip: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  summaryValue: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginTop: 3 },

  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  filterPills: { flexDirection: 'row', gap: 8, flex: 1 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: 12.5, fontWeight: '600', color: Colors.textMuted },
  pillTextActive: { color: Colors.white },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginLeft: 8 },
  sortText: { fontSize: 12.5, fontWeight: '600', color: Colors.textMuted },

  logCard: { backgroundColor: Colors.bgCard, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  siteInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  catIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { fontSize: 22 },
  siteDetails: { flex: 1 },
  siteName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  category: { fontSize: 12, color: Colors.textMuted, fontWeight: '500', textTransform: 'capitalize' },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskLabel: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg, borderRadius: 12, paddingVertical: 12 },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: 10.5, color: Colors.textLight, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  divider: { width: 1, height: 22, backgroundColor: Colors.border },

  noResults: { alignItems: 'center', paddingVertical: 48 },
  noResultsIcon: { fontSize: 40, marginBottom: 12 },
  noResultsTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  noResultsText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  footerText: { fontSize: 12, color: Colors.textLight, fontWeight: '500', textAlign: 'center', marginTop: 6 },
});
