import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import BackHeader from '@/components/ui/BackHeader';
import { GAMBLING_APP_PRESETS } from '@/constants/gamblingApps';
import { getChosenApps, saveChosenApps, OTHERS } from '@/services/gamblingProfile';

// Lets the user update which apps they use after onboarding. Drives the Learn
// screen's focus. Saves on every change so there's no "unsaved" state.
export default function GamblingAppsSettingsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    getChosenApps().then(setSelected).catch(() => {});
  }, []);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
      saveChosenApps(next).catch(() => {});
      return next;
    });
  };

  const options = [...GAMBLING_APP_PRESETS.map((p) => p.name), OTHERS];

  return (
    <SafeAreaView style={styles.root}>
      <BackHeader title="Apps You Use" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Pick the apps or sites you use. Your Learn feed focuses on these; pick "Others" only
          and it stays general. Changes save automatically.
        </Text>

        <View style={styles.chips}>
          {options.map((name) => {
            const on = selected.includes(name);
            return (
              <TouchableOpacity
                key={name}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => toggle(name)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={name}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.count}>
          {selected.length ? `${selected.length} selected` : 'Nothing selected - Learn stays general'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, paddingTop: 8 },
  intro: { fontSize: 14, color: Colors.textMuted, lineHeight: 21, marginBottom: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  chipOn: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.text },
  chipTextOn: { color: Colors.primaryDark, fontWeight: '600' },
  count: { fontSize: 12.5, color: Colors.textLight, marginTop: 18 },
});
