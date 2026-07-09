import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { GAMBLING_APP_PRESETS } from '../../constants/gamblingApps';

// Step 2 — which gambling apps/sites the user uses. Multi-select chips seeded
// with common PH apps. This scopes what "usage" tracking will ask about later.
export default function GamblingAppsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>STEP 2 OF 3</Text>
        <Text style={styles.title}>Which apps do you use?</Text>
        <Text style={styles.subtitle}>
          Pick any that apply. We only track what you choose to report — nothing
          runs in the background.
        </Text>

        <View style={styles.chips}>
          {GAMBLING_APP_PRESETS.map((app) => {
            const on = selected.includes(app.name);
            return (
              <TouchableOpacity
                key={app.name}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => toggle(app.name)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{app.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.next} onPress={() => router.push('/onboarding/baseline')}>
        <Text style={styles.nextText}>{selected.length ? 'Continue' : 'Skip for now'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  body: { paddingTop: 24, paddingBottom: 16 },
  step: { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 24 },
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
  next: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  nextText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
