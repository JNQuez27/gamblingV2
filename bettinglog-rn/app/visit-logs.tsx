import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import GamblingVisitLogs from '@/components/visit-logs/GamblingVisitLogs';

// Dedicated screen for the full gambling visit history. Keeping the detailed,
// scrollable list here (instead of nested inside the Profile tab) avoids the
// cramped scroll-within-scroll and gives the filters room to breathe.
export default function VisitLogsScreen() {
  const router = useRouter();

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
            <Text style={styles.title}>Visit Logs</Text>
            <Text style={styles.subtitle}>Your gambling site history</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <GamblingVisitLogs />
      </View>
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
  content: { flex: 1 },
});
