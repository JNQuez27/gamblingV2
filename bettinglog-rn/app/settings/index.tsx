import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

type ToggleSetting = {
  key: string;
  label: string;
  desc: string;
  value: boolean;
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.sectionHeader}>{children}</Text>
  );
}

function SettingsRow({
  icon,
  label,
  desc,
  right,
  danger = false,
  onPress,
}: {
  icon: string;
  label: string;
  desc?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.65 : 1} style={styles.row}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
      {right ?? (
        onPress && !danger && (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={Colors.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="9 18 15 12 9 6" />
          </Svg>
        )
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<ToggleSetting[]>([
    { key: 'daily_reminder', label: 'Daily reminder', desc: 'Get a gentle nudge each day at 8:00 AM', value: true },
    { key: 'streak_alerts', label: 'Streak alerts', desc: "Remind me if I'm about to lose my streak", value: true },
    { key: 'insight_notif', label: 'Weekly insights', desc: 'Receive a summary every Sunday evening', value: false },
    { key: 'pause_prompts', label: 'Pause prompts', desc: 'Random mindfulness nudges throughout the day', value: false },
  ]);

  const [biometric, setBiometric] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const toggleItem = (key: string) => {
    setToggles((prev) => prev.map((t) => (t.key === key ? { ...t, value: !t.value } : t)));
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#e8f4fd', '#d4eaf7', '#c8e8e0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M15 18l-6-6 6-6" />
              </Svg>
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>Manage your preferences</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Account */}
          <SectionHeader>Account</SectionHeader>
          <View style={styles.group}>
            <SettingsRow icon="👤" label="Edit Profile" desc="Name, avatar, bio" onPress={() => router.push('/settings/edit-profile')} />
            <View style={styles.divider} />
            <SettingsRow icon="💰" label="Spending Limit" desc="Set your monthly cap" onPress={() => router.push('/settings/spending-limit')} />
            <View style={styles.divider} />
            <SettingsRow icon="🔒" label="Privacy" desc="How your data is handled" onPress={() => router.push('/settings/privacy')} />
          </View>

          {/* Notifications */}
          <SectionHeader>Notifications</SectionHeader>
          <View style={styles.group}>
            {toggles.map((t, i) => (
              <View key={t.key}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{t.label}</Text>
                    <Text style={styles.rowDesc}>{t.desc}</Text>
                  </View>
                  <Switch
                    value={t.value}
                    onValueChange={() => toggleItem(t.key)}
                    trackColor={{ false: Colors.border, true: Colors.secondary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Privacy */}
          <SectionHeader>Privacy &amp; Security</SectionHeader>
          <View style={styles.group}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Biometric Lock</Text>
                <Text style={styles.rowDesc}>Require Face ID or fingerprint</Text>
              </View>
              <Switch
                value={biometric}
                onValueChange={() => setBiometric(!biometric)}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Anonymous Analytics</Text>
                <Text style={styles.rowDesc}>Help us improve the app</Text>
              </View>
              <Switch
                value={analytics}
                onValueChange={() => setAnalytics(!analytics)}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>
            <View style={styles.divider} />
            <SettingsRow icon="📋" label="Privacy Policy" onPress={() => {}} />
          </View>

          {/* General */}
          <SectionHeader>General</SectionHeader>
          <View style={styles.group}>
            <SettingsRow icon="🌐" label="Language" desc="English" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow icon="🌙" label="Appearance" desc="Light mode" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow icon="💾" label="Export Data" desc="Download your diary & logs" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow icon="❓" label="Help & Support" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow icon="⭐" label="Rate the App" onPress={() => {}} />
          </View>

          {/* Danger zone */}
          <SectionHeader>Account Actions</SectionHeader>
          <View style={styles.group}>
            <SettingsRow icon="🚪" label="Log Out" danger onPress={() => router.replace('/login')} />
            <View style={styles.divider} />
            <SettingsRow icon="🗑️" label="Delete Account" desc="This action cannot be undone" danger onPress={() => {}} />
          </View>

          <Text style={styles.version}>Reflect v1.0.0 • Made with care</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  body: { padding: 24, gap: 10 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2, paddingLeft: 4, marginTop: 8 },
  group: { backgroundColor: Colors.bgCard, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 68 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingHorizontal: 16 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  rowIconDanger: { backgroundColor: '#fee2e2' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.text },
  rowLabelDanger: { color: '#dc2626' },
  rowDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textLight, marginTop: 8 },
});
