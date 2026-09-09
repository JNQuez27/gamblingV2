import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { PGSI_ITEMS, PGSI_SCALE } from '@/constants/pgsi';
import { scorePGSI, type ScoredResult } from '@/utils/scoring';
import { useAppContext } from '@/hooks/useAppContext';
import BackHeader from '@/components/ui/BackHeader';

// PGSI re-take (README §10.4): the same 9 items as the onboarding baseline,
// re-run on demand. The saved session (is_baseline = false) becomes the
// "current" side of the baseline-vs-current app-influence comparison.
export default function AssessmentScreen() {
  const router = useRouter();
  const { assessmentResults, submitPGSI } = useAppContext();

  const [answers, setAnswers] = useState<number[]>(Array(PGSI_ITEMS.length).fill(-1));
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<ScoredResult | null>(null);

  // The onboarding run is the fixed reference point every re-take compares to.
  const baseline = assessmentResults.find((r) => r.isBaseline);

  const setAnswer = (itemIndex: number, value: number) =>
    setAnswers((prev) => prev.map((a, i) => (i === itemIndex ? value : a)));

  const answeredCount = answers.filter((a) => a >= 0).length;
  const allAnswered = answeredCount === PGSI_ITEMS.length;

  const submit = async () => {
    if (!allAnswered || saving) return;
    setSaving(true);
    try {
      await submitPGSI(answers, false);
      setSubmitted(scorePGSI(answers));
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    const delta = baseline ? submitted.totalScore - baseline.totalScore : null;
    const deltaMsg =
      delta === null
        ? 'No baseline on record yet - this score becomes your reference point.'
        : delta < 0
          ? `Down ${-delta} point${delta === -1 ? '' : 's'} from your baseline (${baseline!.totalScore} → ${submitted.totalScore}). The risk is moving the right way.`
          : delta > 0
            ? `Up ${delta} point${delta === 1 ? '' : 's'} from your baseline (${baseline!.totalScore} → ${submitted.totalScore}). Worth a look at what changed - your diary can help.`
            : `Same as your baseline (${baseline!.totalScore}). Holding steady.`;

    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.resultWrap}>
          <Text style={{ fontSize: 44 }}>{delta !== null && delta < 0 ? '📉' : delta !== null && delta > 0 ? '🧭' : '📌'}</Text>
          <Text style={styles.resultScore}>{submitted.totalScore} / 27</Text>
          <Text style={styles.resultCategory}>{submitted.category}</Text>
          <Text style={styles.resultMsg}>{deltaMsg}</Text>
          <Text style={styles.resultNote}>
            This is a self-check, not a diagnosis. If the score keeps climbing,
            consider talking it through with a professional.
          </Text>

          {submitted.riskLevel === 'severe' && (
            <TouchableOpacity
              style={styles.consultBtn}
              onPress={() => router.replace('/consultation')}
              activeOpacity={0.85}
            >
              <Text style={styles.consultBtnText}>💬 Start a consultation</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackHeader title="PGSI Self-Check" />
        <Text style={styles.subtitle}>
          The same 9 questions from your baseline, about the past 12 months.
          Answer honestly - the point is to see your own trend, not to score well.
        </Text>

        {/* Live progress bar */}
        <View style={styles.progressWrap}>
          <Text style={[styles.progressLabel, allAnswered && styles.progressLabelDone]}>
            {allAnswered ? 'All questions answered' : `${answeredCount} of ${PGSI_ITEMS.length} answered`}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                allAnswered && styles.progressFillDone,
                { width: `${(answeredCount / PGSI_ITEMS.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {PGSI_ITEMS.map((item, i) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.qNum}>QUESTION {i + 1} OF {PGSI_ITEMS.length}</Text>
            <Text style={styles.question}>{item.prompt}</Text>
            <View style={styles.optionsRow}>
              {PGSI_SCALE.map((opt) => {
                const on = answers[i] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.option, on && styles.optionOn]}
                    onPress={() => setAnswer(i, opt.value)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${item.prompt} - ${opt.label}`}
                  >
                    <Text style={[styles.optionText, on && styles.optionTextOn]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submit, !allAnswered && styles.submitDisabled]}
          disabled={!allAnswered || saving}
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel="Submit self-check"
        >
          <Text style={styles.submitText}>{saving ? 'Saving…' : 'See my score'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, paddingBottom: 32 },
  subtitle: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 20 },
  progressWrap: { marginBottom: 18 },
  progressLabel: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark, marginBottom: 6 },
  progressLabelDone: { color: Colors.secondaryDark },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(91,155,213,0.12)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },
  progressFillDone: { backgroundColor: Colors.secondaryDark },
  card: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  qNum: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 6 },
  question: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 12, lineHeight: 21 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  optionOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { fontSize: 13, color: Colors.textMuted },
  optionTextOn: { color: Colors.white, fontWeight: '600' },
  submit: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 4 },
  submitDisabled: { backgroundColor: Colors.primaryLight },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  resultScore: { fontSize: 34, fontWeight: '800', color: Colors.text },
  resultCategory: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark },
  resultMsg: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  resultNote: { fontSize: 12.5, color: Colors.textLight, textAlign: 'center', lineHeight: 18, marginTop: 4 },
  consultBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 28, marginTop: 10 },
  consultBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  doneBtn: { paddingVertical: 12, paddingHorizontal: 28 },
  doneBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
