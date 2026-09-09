import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useDialog } from '@/components/ui/DialogProvider';
import { deleteAccount } from '@/services/auth.service';
import {
  reportGamblingOpen,
  getMonitorPrefs,
  isNativeMonitorAvailable,
  enableBackgroundMonitoring,
  disableBackgroundMonitoring,
  enableWebsiteShield,
  disableWebsiteShield,
} from '@/services/gamblingDetection.service';
import {
  IconUser,
  IconWallet,
  IconLock,
  IconClipboard,
  IconGlobe,
  IconMoon,
  IconDownload,
  IconHelpCircle,
  IconStar,
  IconBell,
  IconLogOut,
  IconTrash,
  IconSmartphone,
} from '@/components/ui/icons';

type RowIcon = React.ComponentType<{ size?: number; color?: string }>;

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
  Icon,
  label,
  desc,
  right,
  danger = false,
  onPress,
}: {
  Icon: RowIcon;
  label: string;
  desc?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.65 : 1} style={styles.row}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Icon size={17} color={danger ? '#dc2626' : Colors.textMuted} />
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
  const { signOut } = useAuth();
  const dialog = useDialog();

  // Actually end the session: clear the persisted token so relaunching the app
  // returns to login. Without this, "Log Out" only navigated away while the
  // saved session stayed on disk, so a restart signed the user right back in.
  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Even if the network revoke fails, the local session is cleared; still
      // send the user to the login screen.
    }
    router.replace('/login');
  };

  // Two-step confirm so an account is never deleted by an accidental tap.
  const handleDeleteAccount = () => {
    dialog(
      'Delete account?',
      'This permanently deletes your account and everything in it - diary entries, streaks, plans, and check-ins. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: confirmDeleteAccount },
      ],
    );
  };
  const confirmDeleteAccount = () => {
    dialog('Are you sure?', 'Last chance - your account will be gone for good.', [
      { text: 'Keep my account', style: 'cancel' },
      { text: 'Delete forever', style: 'destructive', onPress: reallyDeleteAccount },
    ]);
  };
  const reallyDeleteAccount = async () => {
    try {
      await deleteAccount();
      router.replace('/login');
    } catch (e: any) {
      dialog('Could not delete account', e?.message ?? 'Please try again.');
    }
  };

  const [toggles, setToggles] = useState<ToggleSetting[]>([
    { key: 'daily_reminder', label: 'Daily reminder', desc: 'Get a gentle nudge each day at 8:00 AM', value: true },
    { key: 'streak_alerts', label: 'Streak alerts', desc: "Remind me if I'm about to lose my streak", value: true },
    { key: 'insight_notif', label: 'Weekly insights', desc: 'Receive a summary every Sunday evening', value: false },
    { key: 'pause_prompts', label: 'Pause prompts', desc: 'Random mindfulness nudges throughout the day', value: false },
  ]);

  const [biometric, setBiometric] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  // Background gambling monitoring (Mechanism 2). Reflects MonitorPrefs;
  // the switch is disabled when the native module isn't in this build.
  const monitorSupported = isNativeMonitorAvailable();
  const [monitoring, setMonitoring] = useState(false);
  const [monitorBusy, setMonitorBusy] = useState(false);

  // Website shield (Mechanism 3) - local DNS VPN, separate consent.
  const [shield, setShield] = useState(false);
  const [shieldBusy, setShieldBusy] = useState(false);

  useEffect(() => {
    getMonitorPrefs().then((p) => {
      setMonitoring(p.consentGranted && p.enabled);
      setShield(p.siteConsentGranted && p.siteEnabled);
    });
  }, []);

  const turnMonitoringOn = () => {
    // Consent step: explain exactly what it does before asking the OS.
    dialog(
      'Background monitoring',
      'BettingLog will watch which app is in the foreground and send you a ' +
        'supportive nudge when a gambling app opens. This needs the "Usage ' +
        'Access" permission - you\'ll grant it on the next screen. A quiet ' +
        '"Monitoring is on" notification stays visible while it runs. You can ' +
        'turn this off any time.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setMonitorBusy(true);
            try {
              const on = await enableBackgroundMonitoring();
              setMonitoring(on);
              if (!on) {
                dialog(
                  'Usage Access needed',
                  'Monitoring stays off until BettingLog is allowed in Settings → Usage Access.',
                );
              }
            } finally {
              setMonitorBusy(false);
            }
          },
        },
      ],
    );
  };

  const toggleMonitoring = async (next: boolean) => {
    if (next) {
      turnMonitoringOn();
      return;
    }
    setMonitorBusy(true);
    try {
      await disableBackgroundMonitoring();
      setMonitoring(false);
    } finally {
      setMonitorBusy(false);
    }
  };

  const startShield = (mode: 'detect' | 'block') => {
    setShieldBusy(true);
    (async () => {
      try {
        const on = await enableWebsiteShield(mode);
        setShield(on);
        if (!on) {
          dialog(
            'Shield not enabled',
            'The website shield stays off unless you approve the VPN request. ' +
              'If another VPN app is active, turn it off first - Android allows only one.',
          );
        }
      } finally {
        setShieldBusy(false);
      }
    })();
  };

  const turnShieldOn = () => {
    // Distinct consent: explain the local VPN and let the user pick the mode.
    dialog(
      'Website shield',
      'This runs a private on-device VPN that inspects only which sites you look ' +
        'up (DNS). Nothing is sent off your phone. When a gambling site is ' +
        'detected you get a nudge; in Block mode the site is stopped from loading. ' +
        'Android will ask you to approve the VPN on the next screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Detect only', onPress: () => startShield('detect') },
        { text: 'Block sites', onPress: () => startShield('block') },
      ],
    );
  };

  const toggleShield = async (next: boolean) => {
    if (next) {
      turnShieldOn();
      return;
    }
    setShieldBusy(true);
    try {
      await disableWebsiteShield();
      setShield(false);
    } finally {
      setShieldBusy(false);
    }
  };

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
            <SettingsRow Icon={IconUser} label="Edit Profile" desc="Name, avatar, bio" onPress={() => router.push('/settings/edit-profile')} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconWallet} label="Spending Limit" desc="Set your monthly cap" onPress={() => router.push('/settings/spending-limit')} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconSmartphone} label="Apps You Use" desc="Tune your Learn feed" onPress={() => router.push('/settings/gambling-apps')} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconLock} label="Privacy" desc="How your data is handled" onPress={() => router.push('/settings/privacy')} />
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
                <Text style={styles.rowLabel}>Background Monitoring</Text>
                <Text style={styles.rowDesc}>
                  {monitorSupported
                    ? 'Nudge me when a gambling app opens (uses Usage Access)'
                    : 'Requires the dev build - not available here'}
                </Text>
              </View>
              <Switch
                value={monitoring}
                disabled={!monitorSupported || monitorBusy}
                onValueChange={toggleMonitoring}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Website Shield</Text>
                <Text style={styles.rowDesc}>
                  {monitorSupported
                    ? 'Detect or block gambling sites via a private on-device VPN'
                    : 'Requires the dev build - not available here'}
                </Text>
              </View>
              <Switch
                value={shield}
                disabled={!monitorSupported || shieldBusy}
                onValueChange={toggleShield}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>
            <View style={styles.divider} />
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
            <SettingsRow Icon={IconClipboard} label="Privacy Policy" onPress={() => {}} />
          </View>

          {/* General */}
          <SectionHeader>General</SectionHeader>
          <View style={styles.group}>
            <SettingsRow Icon={IconGlobe} label="Language" desc="English" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconMoon} label="Appearance" desc="Light mode" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconDownload} label="Export Data" desc="Download your diary & logs" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconHelpCircle} label="Help & Support" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconStar} label="Rate the App" onPress={() => {}} />
          </View>

          {/* Developer - only in dev builds. Verifies the detection → nudge
              pipeline without the native module. */}
          {__DEV__ && (
            <>
              <SectionHeader>Developer</SectionHeader>
              <View style={styles.group}>
                <SettingsRow
                  Icon={IconBell}
                  label="Send test nudge"
                  desc="Simulate opening BingoPlus"
                  onPress={() => { reportGamblingOpen('BingoPlus', 'app'); }}
                />
              </View>
            </>
          )}

          {/* Danger zone */}
          <SectionHeader>Account Actions</SectionHeader>
          <View style={styles.group}>
            <SettingsRow Icon={IconLogOut} label="Log Out" danger onPress={handleLogout} />
            <View style={styles.divider} />
            <SettingsRow Icon={IconTrash} label="Delete Account" desc="This action cannot be undone" danger onPress={handleDeleteAccount} />
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
