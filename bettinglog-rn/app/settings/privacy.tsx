import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

// Plain-language summary of how the app handles data. Reinforces the
// non-judgmental, privacy-first framing (README §1).
const POINTS = [
  { title: 'Your data is yours', body: 'Everything you log is protected by row-level security — only your account can read it.' },
  { title: 'Nothing runs in the background', body: 'We cannot see which apps you open. All gambling-usage data is what you choose to report.' },
  { title: 'Secrets stay server-side', body: 'API keys never live in the app. The anon key you carry can only reach your own rows.' },
  { title: 'You can delete everything', body: 'Removing your account cascades to every table and erases your history.' },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy</Text>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.card}>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.cardBody}>{p.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 16 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardBody: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
});
