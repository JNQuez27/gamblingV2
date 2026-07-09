import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useSpending } from '../../src/core/hooks/useSpending';
import { peso } from '../../src/utils/mathEngine';

// Set or update the monthly spending limit. The limit drives the spending
// engine and the math-engine warnings (README §12, §14).
export default function SpendingLimitScreen() {
  const router = useRouter();
  const { spendingLimit, spendingSummary, updateSpendingLimit } = useSpending();
  const [value, setValue] = useState(spendingLimit ? String(spendingLimit) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const amount = Number(value);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await updateSpendingLimit(amount);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Spending limit</Text>
      <Text style={styles.subtitle}>
        Set the most you want to spend in a month. We'll warn you before you get
        there — and show what that money could be instead.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>MONTHLY LIMIT (₱)</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="5000"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
        />
      </View>

      {spendingSummary && spendingSummary.limit > 0 && (
        <View style={styles.current}>
          <Text style={styles.currentText}>
            So far this period: {peso(spendingSummary.current)} of{' '}
            {peso(spendingSummary.limit)} ({spendingSummary.percentUsed}%)
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.save} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveText}>Save limit</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    fontSize: 18,
    color: Colors.text,
  },
  current: { backgroundColor: Colors.warningBg, borderColor: Colors.warningBorder, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 },
  currentText: { fontSize: 14, color: '#78350f' },
  save: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  saveText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
