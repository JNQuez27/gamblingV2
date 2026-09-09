import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import Mascot from '@/components/ui/Mascot';
import OnboardingScaffold, { OnboardingCTA, PopIn } from '@/components/onboarding/OnboardingScaffold';

// Step 1 of onboarding - capture the user's own words for why they are here.
// Non-judgmental framing: this is a starting point, not a confession. Drip
// (the mascot) does the greeting so the moment feels welcoming, not clinical.
const SUGGESTIONS = [
  "I'm spending more than I want to",
  'I open betting apps too often',
  'I want to understand my habits',
  'Someone I trust is worried about me',
];

export default function ProblemScreen() {
  const router = useRouter();
  const [text, setText] = useState('');

  return (
    <OnboardingScaffold
      step={1}
      showBack={false}
      title="What brings you here?"
      subtitle="There are no wrong answers. This just helps us meet you where you are."
      illustration={
        <View style={styles.mascotCircle}>
          <Mascot size={84} />
        </View>
      }
      footer={
        <OnboardingCTA
          label="Continue"
          disabled={!text.trim()}
          onPress={() => router.push('/onboarding/about-you')}
        />
      }
    >
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Write it in your own words…"
        placeholderTextColor={Colors.textLight}
        multiline
        accessibilityLabel="Why are you here, in your own words"
      />

      <Text style={styles.orLabel}>Or start from one of these</Text>
      <View style={styles.chips}>
        {SUGGESTIONS.map((s, i) => {
          const on = text === s;
          return (
            <PopIn key={s} index={i}>
              <TouchableOpacity
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setText(on ? '' : s)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={s}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
              </TouchableOpacity>
            </PopIn>
          );
        })}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  mascotCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  input: {
    minHeight: 104,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  orLabel: { fontSize: 12, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.6, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipOn: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textMuted },
  chipTextOn: { color: Colors.primaryDark, fontWeight: '600' },
});
