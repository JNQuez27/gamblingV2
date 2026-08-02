import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useAppContext } from '@/hooks/useAppContext';
import * as consultationService from '@/services/consultation.service';
import type { ConsultationMessage } from '@/services/consultation.service';
import { generateAppReply } from '@/utils/consultationEngine';

const OPENER =
  "Hi - this is a private space to talk through what's going on. " +
  'What brought you here today? (For emergencies, always call 911 or NCMH 1553.)';

// Consultation between the app and the user. Messages persist in Supabase;
// the app side is generated locally by the theory-driven consultation engine
// using the user's live context (risk, readiness, spending, usage, time).
export default function ConsultationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    latestAssessment,
    readinessStage,
    moralReasoningLevel,
    spendingSummary,
    usageBand,
    streak,
  } = useAppContext();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Resume the latest session, or start one with the app's opener.
  useEffect(() => {
    if (!user) return;
    (async () => {
      let session = await consultationService.getLatestSession();
      if (!session) {
        session = await consultationService.startConsultation(user.id, 'general');
        await consultationService.sendMessage(session.id, 'app', OPENER);
      }
      setSessionId(session.id);
      setMessages(await consultationService.getMessages(session.id));
    })().catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || busy) return;
    setBusy(true);
    setInput('');
    try {
      const userMsg = await consultationService.sendMessage(sessionId, 'user', text);
      setMessages((prev) => [...prev, userMsg]);

      const reply = generateAppReply(text, {
        riskLevel: latestAssessment?.riskLevel,
        readinessStage,
        moralReasoningLevel,
        spendingSummary,
        usageBand,
        streak,
      });
      const appMsg = await consultationService.sendMessage(sessionId, 'app', reply);
      setMessages((prev) => [...prev, appMsg]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M15 18l-6-6 6-6" />
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Consultation</Text>
            <Text style={styles.subtitle}>Private · saved to your account only</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.thread}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubble, m.sender === 'user' ? styles.bubbleUser : styles.bubbleApp]}
            >
              <Text style={m.sender === 'user' ? styles.bubbleUserText : styles.bubbleAppText}>
                {m.content}
              </Text>
            </View>
          ))}
          {busy && (
            <View style={[styles.bubble, styles.bubbleApp]}>
              <Text style={styles.bubbleAppText}>…</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Say what's on your mind…"
            placeholderTextColor={Colors.textLight}
            multiline
            accessibilityLabel="Message"
          />
          <TouchableOpacity
            onPress={send}
            style={[styles.sendBtn, (!input.trim() || busy) && { opacity: 0.4 }]}
            disabled={!input.trim() || busy}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  thread: { padding: 20, gap: 10, paddingBottom: 12 },
  bubble: { maxWidth: '84%', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 11 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 6 },
  bubbleApp: { alignSelf: 'flex-start', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 6 },
  bubbleUserText: { color: Colors.white, fontSize: 14.5, lineHeight: 20 },
  bubbleAppText: { color: Colors.text, fontSize: 14.5, lineHeight: 21 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 16, paddingTop: 8 },
  input: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 15,
    paddingVertical: 11,
    fontSize: 14.5,
    color: Colors.text,
    maxHeight: 110,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
