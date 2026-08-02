import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import {
  WEEKLY_CHECKIN_ITEMS,
  WEEKLY_CHECKIN_SCALE,
  weeklyBand,
  weeklyBandMessage,
} from '@/constants/weeklyCheckin';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { sendImmediateAlert, logNotification } from '@/services/notification.service';

// The recurring weekly questionnaire. Five items, 0–3 each. A 'high' total
// fires the alarm notification and points the user to a consultation.
export default function WeeklyCheckinScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { submitWeeklyCheckin } = useAppContext();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const allAnswered = WEEKLY_CHECKIN_ITEMS.every((q) => answers[q.key] !== undefined);
  const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const band = weeklyBand(total);

  const submit = async () => {
    if (!allAnswered || saving) return;
    setSaving(true);
    try {
      await submitWeeklyCheckin(answers, total);

      // The alarm: a high score notifies immediately and gets logged.
      if (band === 'high') {
        const title = 'Check-in flagged a hard week';
        const body = 'Your answers suggest this week was rough. A consultation can help - open the app to talk it through.';
        await sendImmediateAlert(title, body);
        if (user) await logNotification(user.id, 'weekly', title, body).catch(() => {});
      }
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.resultWrap}>
          <Text style={{ fontSize: 44 }}>{band === 'steady' ? '🌿' : band === 'elevated' ? '🌤️' : '🫂'}</Text>
          <Text style={styles.resultScore}>{total} / 15</Text>
          <Text style={styles.resultMsg}>{weeklyBandMessage(band)}</Text>

          {band === 'high' && (
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
        <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.title}>Weekly Check-in</Text>
          <Text style={styles.subtitle}>Answer for the past 7 days. Honest beats perfect.</Text>
        </LinearGradient>

        <View style={styles.body}>
          {WEEKLY_CHECKIN_ITEMS.map((q, qi) => (
            <View key={q.key} style={styles.qCard}>
              <Text style={styles.qNum}>QUESTION {qi + 1} OF {WEEKLY_CHECKIN_ITEMS.length}</Text>
              <Text style={styles.qPrompt}>{q.prompt}</Text>
              <View style={styles.optionsRow}>
                {WEEKLY_CHECKIN_SCALE.map((opt) => {
                  const on = answers[q.key] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.opt, on && styles.optOn]}
                      onPress={() => setAnswers((prev) => ({ ...prev, [q.key]: opt.value }))}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${q.prompt} - ${opt.label}`}
                    >
                      <Text style={[styles.optText, on && styles.optTextOn]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submit, !allAnswered && styles.submitDisabled]}
            onPress={submit}
            disabled={!allAnswered || saving}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Submit weekly check-in"
          >
            <Text style={styles.submitText}>{saving ? 'Saving…' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 24 },
  header: { padding: 24, paddingTop: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  body: { padding: 24, gap: 14 },
  qCard: { backgroundColor: Colors.bgCard, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: Colors.border },
  qNum: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 6 },
  qPrompt: { fontSize: 15, fontWeight: '600', color: Colors.text, lineHeight: 21, marginBottom: 14 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opt: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  optOn: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  optText: { fontSize: 13, color: Colors.textMuted },
  optTextOn: { color: Colors.primaryDark, fontWeight: '700' },
  submit: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 8 },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  resultScore: { fontSize: 34, fontWeight: '800', color: Colors.text },
  resultMsg: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  consultBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 28, marginTop: 10 },
  consultBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  doneBtn: { paddingVertical: 12, paddingHorizontal: 28 },
  doneBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
