import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { Colors } from '../../constants/colors';
import type { NotificationPreferences } from '../../src/types/notification';

// Opt in/out of each notification type. These map to the columns in
// `notification_preferences` (README §14).
const ROWS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'mathEngine', label: 'Math-engine insights', desc: 'Opportunity-cost and spending math from your own data' },
  { key: 'checklist', label: 'Daily checklist', desc: 'A short actionable list to keep the habit loop healthy' },
  { key: 'weeklyCheckin', label: 'Weekly check-in', desc: 'The recurring questionnaire that tracks your progress' },
];

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    mathEngine: true,
    checklist: true,
    weeklyCheckin: true,
  });

  const toggle = (key: keyof NotificationPreferences) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Notifications</Text>
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
