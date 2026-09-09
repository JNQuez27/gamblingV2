import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { PGSI_ITEMS, PGSI_SCALE } from '@/constants/pgsi';
import { scorePGSI } from '@/utils/scoring';
import { useAppContext } from '@/hooks/useAppContext';
import OnboardingScaffold, { OnboardingCTA, PopIn } from '@/components/onboarding/OnboardingScaffold';

// A gauge with its needle at the start line - this step measures where the
// journey begins, nothing more.
function GaugeIllustration() {
  return (
    <Svg width={116} height={116} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="66" r="52" fill={Colors.secondary} fillOpacity="0.12" />
      {/* dial segments: calm → caution → high */}
      <Path d="M26 68 A34 34 0 0 1 43 38.6" stroke="#8fc4aa" strokeWidth="10" strokeLinecap="round" fill="none" />
      <Path d="M43 38.6 A34 34 0 0 1 77 38.6" stroke="#f2dca8" strokeWidth="10" strokeLinecap="round" fill="none" />
      <Path d="M77 38.6 A34 34 0 0 1 94 68" stroke="#f2c2c0" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* needle resting at the start */}
      <Path d="M60 68 L39 57" stroke={Colors.text} strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="60" cy="68" r="6" fill={Colors.text} />
      <Circle cx="60" cy="68" r="2.5" fill="#ffffff" />
      {/* start flag */}
      <Path d="M26 84v-12" stroke={Colors.secondaryDark} strokeWidth="2" strokeLinecap="round" />
      <Path d="M26 72h9l-2.5 3 2.5 3h-9" fill={Colors.secondaryDark} />
    </Svg>
  );
}

// Step 3 - the baseline assessment: the full 9-item PGSI. This first score is
// stored (is_baseline = true) as the starting line the app later measures its
// own influence against (README §10.4).
export default function BaselineScreen() {
  const router = useRouter();
  const { submitPGSI } = useAppContext();
  const [answers, setAnswers] = useState<number[]>(Array(PGSI_ITEMS.length).fill(-1));
  const [saving, setSaving] = useState(false);

  const setAnswer = (itemIndex: number, value: number) =>
    setAnswers((prev) => prev.map((a, i) => (i === itemIndex ? value : a)));

  const answeredCount = answers.filter((a) => a >= 0).length;
  const allAnswered = answeredCount === PGSI_ITEMS.length;
  const result = allAnswered ? scorePGSI(answers) : null;

  const finish = async () => {
    if (!allAnswered || saving) return;
    setSaving(true);
    try {
      await submitPGSI(answers, true);
    } catch {
      // Don't trap the user in onboarding over a network hiccup - the PGSI
      // can be retaken from inside the app.
    } finally {
      setSaving(false);
    }
    router.replace('/(tabs)/home');
  };

  return (
    <OnboardingScaffold
      step={5}
      title="A quick baseline"
      subtitle="Thinking about the past 12 months… honest answers become the starting line we measure progress from. A self-check, not a diagnosis."
      illustration={<GaugeIllustration />}
      footer={
        <OnboardingCTA
          label={saving ? 'Saving…' : 'Finish setup'}
          disabled={!allAnswered || saving}
          onPress={finish}
        />
      }
    >
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

      {/* Baseline result shown up top once every question is answered */}
      {result && (
        <PopIn>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>YOUR BASELINE</Text>
            <Text style={styles.resultText}>
              {result.category} · score {result.totalScore} / 27
            </Text>
            <Text style={styles.resultSub}>
              Wherever this lands, it's just the starting point - the app measures
              your progress from here.
            </Text>
          </View>
        </PopIn>
      )}

      {PGSI_ITEMS.map((item, i) => (
        <PopIn key={item.id} index={i}>
          <View style={[styles.card, answers[i] >= 0 && styles.cardAnswered]}>
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
        </PopIn>
      ))}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 16 },
  progressLabel: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark, marginBottom: 6 },
  progressLabelDone: { color: Colors.secondaryDark },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(91,155,213,0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },
  progressFillDone: { backgroundColor: Colors.secondaryDark },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardAnswered: { borderColor: Colors.secondaryLight },
  qNum: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 6 },
  question: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 12, lineHeight: 21 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  optionOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { fontSize: 13, color: Colors.textMuted },
  optionTextOn: { color: Colors.white, fontWeight: '600' },
  resultCard: { backgroundColor: Colors.secondaryLight, borderRadius: 16, padding: 16, marginTop: 4 },
  resultLabel: { fontSize: 11, fontWeight: '700', color: Colors.secondaryDark, letterSpacing: 1, marginBottom: 4 },
  resultText: { fontSize: 16, color: Colors.text, fontWeight: '700' },
  resultSub: { fontSize: 12.5, color: Colors.secondaryDark, lineHeight: 18, marginTop: 6 },
});
