import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

// Step 1 of onboarding — capture the user's own words for why they are here.
// Non-judgmental framing: this is a starting point, not a confession.
const SUGGESTIONS = [
  "I'm spending more than I want to",
  "I open betting apps too often",
  "I want to understand my habits",
  "Someone I trust is worried about me",
];

export default function ProblemScreen() {
  const router = useRouter();
  const [text, setText] = useState('');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text style={styles.step}>STEP 1 OF 3</Text>
        <Text style={styles.title}>What brings you here?</Text>
        <Text style={styles.subtitle}>
          There are no wrong answers. This just helps us meet you where you are.
        </Text>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Write it in your own words…"
          placeholderTextColor={Colors.textLight}
          multiline
        />

        <View style={styles.chips}>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} style={styles.chip} onPress={() => setText(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.next, !text && styles.nextDisabled]}
        disabled={!text}
        onPress={() => router.push('/onboarding/gambling-apps')}
      >
        <Text style={styles.nextText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24, justifyContent: 'space-between' },
  body: { flex: 1, paddingTop: 24 },
  step: { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 24 },
  input: {
    minHeight: 110,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, color: Colors.primaryDark },
  next: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  nextDisabled: { backgroundColor: Colors.primaryLight },
  nextText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
