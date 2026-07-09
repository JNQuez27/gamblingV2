import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { scorePGSI } from '../../src/utils/scoring';

// Step 3 — a short baseline assessment. This first score is stored as the
// baseline the app later measures its own influence against (README §10.4).
// Three sample PGSI-style items shown here; the full 9-item PGSI plugs in the
// same way once the instrument is seeded in Supabase.
const ITEMS = [
  'Have you bet more than you could really afford to lose?',
  'Have you felt guilty about the way you gamble?',
  'Has gambling caused you any financial problems?',
];

const OPTIONS = [
  { label: 'Never', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Most of the time', value: 2 },
  { label: 'Almost always', value: 3 },
];

export default function BaselineScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(Array(ITEMS.length).fill(-1));

  const setAnswer = (itemIndex: number, value: number) =>
    setAnswers((prev) => prev.map((a, i) => (i === itemIndex ? value : a)));

  const allAnswered = answers.every((a) => a >= 0);
  const result = allAnswered ? scorePGSI(answers) : null;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text style={styles.step}>STEP 3 OF 3</Text>
        <Text style={styles.title}>A quick baseline</Text>
        <Text style={styles.subtitle}>
          Over the past 12 months… Your honest answer here becomes the starting
          line we measure progress from.
        </Text>

        {ITEMS.map((item, i) => (
          <View key={item} style={styles.card}>
            <Text style={styles.question}>{item}</Text>
            <View style={styles.optionsRow}>
              {OPTIONS.map((opt) => {
                const on = answers[i] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.option, on && styles.optionOn]}
                    onPress={() => setAnswer(i, opt.value)}
                  >
                    <Text style={[styles.optionText, on && styles.optionTextOn]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Baseline recorded</Text>
            <Text style={styles.resultText}>
              {result.category} · score {result.totalScore}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.next, !allAnswered && styles.nextDisabled]}
        disabled={!allAnswered}
        onPress={() => router.replace('/(tabs)/home')}
      >
        <Text style={styles.nextText}>Finish setup</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24, justifyContent: 'space-between' },
  body: { flex: 1, paddingTop: 24 },
  step: { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 20 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  question: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 12, lineHeight: 21 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  optionOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { fontSize: 13, color: Colors.textMuted },
  optionTextOn: { color: Colors.white, fontWeight: '600' },
  resultCard: { backgroundColor: Colors.secondaryLight, borderRadius: 16, padding: 16, marginTop: 4 },
  resultLabel: { fontSize: 12, fontWeight: '700', color: Colors.secondaryDark, letterSpacing: 1, marginBottom: 4 },
  resultText: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  next: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  nextDisabled: { backgroundColor: Colors.primaryLight },
  nextText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
