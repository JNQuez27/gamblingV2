import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import Mascot from '@/components/ui/Mascot';
import BirthdateField from '@/components/ui/BirthdateField';
import OnboardingScaffold, { OnboardingCTA } from '@/components/onboarding/OnboardingScaffold';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/services/auth.service';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

// Step 2 - basic demographics. Kept optional (skippable) but encouraged; the
// birthdate/gender let the rest of the app tailor its guidance.
export default function AboutYouScreen() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [birthdate, setBirthdate] = useState<string | null>(user?.birthdate ?? null);
  const [gender, setGender] = useState<string | null>(user?.gender ?? null);

  const onContinue = async () => {
    if (birthdate || gender) {
      try {
        await updateProfile({ birthdate: birthdate ?? undefined, gender: gender ?? undefined });
        await refresh();
      } catch {
        // Non-fatal - don't trap the user in onboarding over a save hiccup.
      }
    }
    router.push('/onboarding/gambling-apps');
  };

  return (
    <OnboardingScaffold
      step={2}
      title="A little about you"
      subtitle="A few details help us tailor your plan. You can change these anytime in Settings."
      illustration={
        <View style={styles.mascotCircle}>
          <Mascot size={84} />
        </View>
      }
      footer={<OnboardingCTA label={birthdate || gender ? 'Continue' : 'Skip for now'} onPress={onContinue} />}
    >
      <Text style={styles.label}>BIRTHDATE</Text>
      <BirthdateField value={birthdate} onChange={setBirthdate} />

      <Text style={[styles.label, { marginTop: 22 }]}>GENDER</Text>
      <View style={styles.chips}>
        {GENDERS.map((g) => {
          const on = gender === g.value;
          return (
            <TouchableOpacity
              key={g.value}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => setGender(on ? null : g.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={g.label}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{g.label}</Text>
            </TouchableOpacity>
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
  label: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 8 },
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
});
