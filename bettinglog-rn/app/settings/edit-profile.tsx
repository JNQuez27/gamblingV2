import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import BackHeader from '@/components/ui/BackHeader';
import BirthdateField from '@/components/ui/BirthdateField';
import { updateProfile, getMyBio } from '@/services/auth.service';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

// Edit name, demographics, and bio - all persisted to the `profiles` table.
export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refresh } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [middleName, setMiddleName] = useState(user?.middleName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [birthdate, setBirthdate] = useState<string | null>(user?.birthdate ?? null);
  const [gender, setGender] = useState<string | null>(user?.gender ?? null);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyBio().then(setBio).catch(() => {});
  }, []);

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ firstName, middleName, lastName, birthdate, gender, bio });
      await refresh();
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Could not save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <BackHeader title="Edit profile" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>FIRST NAME</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={Colors.textLight} autoCapitalize="words" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>LAST NAME</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={Colors.textLight} autoCapitalize="words" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>MIDDLE NAME (OPTIONAL)</Text>
          <TextInput style={styles.input} value={middleName} onChangeText={setMiddleName} placeholder="Middle name" placeholderTextColor={Colors.textLight} autoCapitalize="words" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>BIRTHDATE</Text>
          <BirthdateField value={birthdate} onChange={setBirthdate} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>GENDER</Text>
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>BIO</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={bio}
            onChangeText={setBio}
            placeholder="A short note to yourself…"
            placeholderTextColor={Colors.textLight}
            multiline
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={[styles.save, saving && styles.saveDisabled]} onPress={save} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, paddingTop: 8, paddingBottom: 40 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    fontSize: 15,
    color: Colors.text,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
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
  error: { color: '#c0392b', fontSize: 13, marginBottom: 12 },
  save: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 4 },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
