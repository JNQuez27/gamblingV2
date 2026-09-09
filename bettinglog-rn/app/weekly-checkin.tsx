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
  K10_ITEMS,
  K10_SCALE,
  K10_STEM,
  K10_MAX,
  k10Band,
  k10BandMessage,
} from '@/constants/k10';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { sendImmediateAlert, logNotification } from '@/services/notification.service';
import { IconChevronRight } from '@/components/ui/icons';

// The K10 items complete the stem ("…did you feel tired out…"), so they're
// stored lowercase. Capitalize only for display so each line reads as a proper
// question without altering the validated instrument text.
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// The recurring distress check-in: the standard 10-item K10, each 1–5. A
// 'severe' total fires the alarm notification and points to a consultation.
export default function WeeklyCheckinScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { submitWeeklyCheckin } = useAppContext();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const allAnswered = K10_ITEMS.every((q) => answers[q.key] !== undefined);
  const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const band = k10Band(total);

  const submit = async () => {
    if (!allAnswered || saving) return;
    setSaving(true);
    try {
      await submitWeeklyCheckin(answers, total);

      // The alarm: a severe score notifies immediately and gets logged.
      if (band === 'severe') {
        const title = 'Check-in flagged high distress';
        const body = 'Your answers point to a hard stretch. A consultation can help - open the app to talk it through.';
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
          <Text style={{ fontSize: 44 }}>{band === 'well' ? '🌿' : band === 'mild' ? '🌤️' : band === 'moderate' ? '⛅' : '🫂'}</Text>
          <Text style={styles.resultScore}>{total} / {K10_MAX}</Text>
          <Text style={styles.resultMsg}>{k10BandMessage(band)}</Text>

          {band === 'severe' && (
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <IconChevronRight size={22} color={Colors.text} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Distress Check-in</Text>
          <Text style={styles.subtitle}>{K10_STEM} Honest beats perfect.</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Why these questions - context for the K10 */}
          <View style={styles.whyCard}>
            <Text style={styles.whyTitle}>Why these questions?</Text>
            <Text style={styles.whyText}>
              These ten questions are a validated psychological-distress scale
              used by clinicians worldwide. Gambling harm and stress feed each
              other, so tracking how tired, nervous, hopeless, restless, or sad
              you've felt over the past four weeks helps the app notice when you
              might need more support - and shows whether things are easing over
              time. It's a check-in, not a diagnosis.
            </Text>
          </View>

          {K10_ITEMS.map((q, qi) => (
            <View key={q.key} style={styles.qCard}>
              <Text style={styles.qNum}>QUESTION {qi + 1} OF {K10_ITEMS.length}</Text>
              <Text style={styles.qPrompt}>{capitalize(q.prompt)}</Text>
              <View style={styles.optionsRow}>
                {K10_SCALE.map((opt) => {
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  body: { padding: 24, gap: 14 },
  whyCard: { backgroundColor: 'rgba(91,155,213,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(91,155,213,0.18)' },
  whyTitle: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark, marginBottom: 6 },
  whyText: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  whyBold: { fontWeight: '700', color: Colors.text },
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
