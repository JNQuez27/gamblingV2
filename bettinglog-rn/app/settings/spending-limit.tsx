import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { PH_ALTERNATIVES, PAGCOR_REFERENCE_BETS } from '@/constants/phPrices';
import { useSpending } from '@/hooks/useSpending';
import { useAppContext } from '@/hooks/useAppContext';
import { peso } from '@/utils/mathEngine';
import BackHeader from '@/components/ui/BackHeader';

// Convert a peso amount into everyday things (same math as the home card).
function toRealThings(amount: number) {
  return PH_ALTERNATIVES
    .map((a) => {
      const count = Math.floor(amount / a.cost);
      return { ...a, count, unit: count === 1 ? a.one : a.many };
    })
    .filter((a) => a.count >= 1)
    .slice(0, 4);
}

// Set or update the monthly spending limit. The limit drives the spending
// engine and the math-engine warnings (README §12, §14).
export default function SpendingLimitScreen() {
  const router = useRouter();
  const { spendingLimit, spendingSummary, updateSpendingLimit } = useSpending();
  const { streak } = useAppContext();
  const [value, setValue] = useState(spendingLimit ? String(spendingLimit) : '');
  const [saving, setSaving] = useState(false);

  // "Money kept" is the streak estimate (₱350 reference session per bet-free
  // day) - motivational, not a ledger, so it is displayed here but never
  // written into spending_logs.
  const moneyKept = streak * PAGCOR_REFERENCE_BETS.averageSessionSpend;

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
      <BackHeader title="Spending limit" />
      <Text style={styles.subtitle}>
        Set the most you want to spend in a month. We'll warn you before you get
        there - and show what that money could be instead.
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

      {/* The recorded spend, routed through the same "real things" converter
          the home card uses - what the money already bet could have been. */}
      {spendingSummary && spendingSummary.current > 0 && (
        <View style={styles.couldHave}>
          <Text style={styles.couldHaveTitle}>
            {peso(spendingSummary.current)} recorded so far could have been…
          </Text>
          {toRealThings(spendingSummary.current).map((a) => (
            <Text key={a.unit} style={styles.couldHaveRow}>
              {a.icon}  <Text style={styles.couldHaveCount}>{a.count}</Text> {a.unit}
            </Text>
          ))}
        </View>
      )}

      {/* Money kept (streak × reference session), routed through the same
          converter - shown with or without a saved limit. */}
      {moneyKept > 0 && (
        <View style={styles.kept}>
          <Text style={styles.keptTitle}>
            {peso(moneyKept)} kept from {streak} bet-free day{streak === 1 ? '' : 's'} - already worth…
          </Text>
          {toRealThings(moneyKept).map((a) => (
            <Text key={a.unit} style={styles.couldHaveRow}>
              {a.icon}  <Text style={styles.keptCount}>{a.count}</Text> {a.unit}
            </Text>
          ))}
          <Text style={styles.keptNote}>
            Estimated at ₱{PAGCOR_REFERENCE_BETS.averageSessionSpend} per bet-free
            day - an estimate, so it's not counted in your spending record.
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
  couldHave: { backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 20 },
  couldHaveTitle: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark, letterSpacing: 0.3, marginBottom: 8 },
  couldHaveRow: { fontSize: 14, color: Colors.text, paddingVertical: 3 },
  couldHaveCount: { fontWeight: '800', color: Colors.primaryDark },
  kept: { backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 20 },
  keptTitle: { fontSize: 12, fontWeight: '700', color: Colors.secondaryDark, letterSpacing: 0.3, marginBottom: 8 },
  keptCount: { fontWeight: '800', color: Colors.secondaryDark },
  keptNote: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', marginTop: 8, lineHeight: 16 },
  save: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  saveText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
