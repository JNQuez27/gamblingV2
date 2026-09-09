import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/colors';
import { todayKey, prettyDate, ageFromBirthdate } from '@/utils/date';

// Opens the native Android date spinner and returns a 'YYYY-MM-DD' string.
// Shows the picked date + computed age once set.
export default function BirthdateField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const open = () => {
    const initial = value ? new Date(value) : new Date(2000, 0, 1);
    if (Platform.OS !== 'android') return; // Android-first; native spinner only
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      maximumDate: new Date(),
      minimumDate: new Date(1920, 0, 1),
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(todayKey(date));
      },
    });
  };

  const age = value ? ageFromBirthdate(value) : null;
  const label = value
    ? `${prettyDate(value)}${age != null ? `  ·  ${age} years old` : ''}`
    : 'Select your birthdate';

  return (
    <TouchableOpacity
      style={styles.field}
      onPress={open}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={value ? `Birthdate ${label}. Tap to change.` : 'Select your birthdate'}
    >
      <Text style={[styles.text, !value && styles.placeholder]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  text: { fontSize: 15, color: Colors.text },
  placeholder: { color: Colors.textLight },
});
