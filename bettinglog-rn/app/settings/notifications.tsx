import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import BackHeader from '@/components/ui/BackHeader';
import type { NotificationPreferences } from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/services/notification.service';

// Opt in/out of each notification type. Persists to `notification_preferences`
// (README §14); toggling the weekly check-in also (un)schedules the recurring
// Sunday-evening local notification.
const ROWS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'mathEngine', label: 'Math-engine insights', desc: 'Opportunity-cost and spending math from your own data' },
  { key: 'checklist', label: 'Daily checklist', desc: 'A short actionable list to keep the habit loop healthy' },
  { key: 'weeklyCheckin', label: 'Weekly check-in', desc: 'The recurring questionnaire that tracks your progress (Sunday 7 PM)' },
];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    mathEngine: true,
    checklist: true,
    weeklyCheckin: true,
  });

  useEffect(() => {
    getNotificationPreferences()
      .then((saved) => saved && setPrefs(saved))
      .catch(() => {});
  }, []);

  const toggle = (key: keyof NotificationPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (user) saveNotificationPreferences(user.id, next).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <BackHeader title="Notifications" />
      <View style={styles.group}>
        {ROWS.map((row, i) => (
          <View key={row.key}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.desc}>{row.desc}</Text>
              </View>
              <Switch
                value={Boolean(prefs[row.key])}
                onValueChange={() => toggle(row.key)}
                trackColor={{ true: Colors.primary, false: Colors.border }}
              />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 20 },
  group: { backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  divider: { height: 1, backgroundColor: Colors.border },
  label: { fontSize: 15, fontWeight: '600', color: Colors.text },
  desc: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
});
