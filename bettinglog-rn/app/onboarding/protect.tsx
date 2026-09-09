import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import OnboardingScaffold, { OnboardingCTA, PopIn } from '@/components/onboarding/OnboardingScaffold';
import {
  isNativeMonitorAvailable,
  getMonitorPrefs,
  enableBackgroundMonitoring,
  disableBackgroundMonitoring,
  enableWebsiteShield,
  disableWebsiteShield,
} from '@/services/gamblingDetection.service';

// A shield with a check - "we've got your back while you're not looking".
function ShieldIllustration() {
  return (
    <Svg width={112} height={112} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="62" r="52" fill={Colors.secondary} fillOpacity="0.12" />
      <Path
        d="M60 26l24 9v22c0 17-11 29-24 34-13-5-24-17-24-34V35l24-9z"
        fill="#ffffff"
        stroke={Colors.primary}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Path d="M50 61l7 7 14-16" stroke={Colors.secondaryDark} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={Colors.primaryDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <Path d="M11 18h2" />
    </Svg>
  );
}

function GlobeIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={Colors.primaryDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="9" />
      <Path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </Svg>
  );
}

// Onboarding step 4: ask for the two background-detection permissions up front,
// right after the user names the apps they use. Both are optional - "Continue"
// always proceeds - and each can be changed later in Settings. Enabling one
// triggers its own system flow (Usage Access screen / VPN consent dialog); the
// switch only sticks ON if that flow was granted.
export default function ProtectScreen() {
  const router = useRouter();
  const available = isNativeMonitorAvailable();
  const [appOn, setAppOn] = useState(false);
  const [siteOn, setSiteOn] = useState(false);
  const [busy, setBusy] = useState<null | 'app' | 'site'>(null);

  useEffect(() => {
    getMonitorPrefs().then((p) => {
      setAppOn(p.consentGranted && p.enabled);
      setSiteOn(p.siteConsentGranted && p.siteEnabled);
    });
  }, []);

  const toggleApp = async (v: boolean) => {
    setBusy('app');
    try {
      if (v) setAppOn(await enableBackgroundMonitoring());
      else {
        await disableBackgroundMonitoring();
        setAppOn(false);
      }
    } finally {
      setBusy(null);
    }
  };

  const toggleSite = async (v: boolean) => {
    setBusy('site');
    try {
      if (v) setSiteOn(await enableWebsiteShield('detect'));
      else {
        await disableWebsiteShield();
        setSiteOn(false);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <OnboardingScaffold
      step={4}
      title="Catch the urge early"
      subtitle="The app can watch for gambling apps and websites and gently nudge you the moment one opens - your best chance to pause. Turn on what you're comfortable with; you can change this anytime in Settings."
      illustration={<ShieldIllustration />}
      footer={<OnboardingCTA label="Continue" onPress={() => router.push('/onboarding/baseline')} />}
    >
      {!available && (
        <Text style={styles.unavailable}>
          Background detection isn't available on this build - you can enable it later in Settings.
        </Text>
      )}

      <PopIn index={0}>
        <View style={styles.card}>
          <View style={styles.cardIcon}><PhoneIcon /></View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Gambling app detection</Text>
            <Text style={styles.cardDesc}>
              Notices when a betting app opens (via Android's Usage Access) and nudges you to pause.
            </Text>
          </View>
          {busy === 'app' ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Switch
              value={appOn}
              onValueChange={toggleApp}
              disabled={!available || busy !== null}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={appOn ? Colors.primary : '#f4f3f4'}
            />
          )}
        </View>
      </PopIn>

      <PopIn index={1}>
        <View style={styles.card}>
          <View style={styles.cardIcon}><GlobeIcon /></View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Gambling website detection</Text>
            <Text style={styles.cardDesc}>
              A private on-device check reads only the website name - nothing else leaves your phone.
            </Text>
          </View>
          {busy === 'site' ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Switch
              value={siteOn}
              onValueChange={toggleSite}
              disabled={!available || busy !== null}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={siteOn ? Colors.primary : '#f4f3f4'}
            />
          )}
        </View>
      </PopIn>

      <Text style={styles.privacy}>
        Private by design: detection runs on your device, and you stay in control - turn either off
        anytime.
      </Text>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  unavailable: { fontSize: 13, color: Colors.textMuted, lineHeight: 19, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(91,155,213,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardDesc: { fontSize: 12.5, color: Colors.textMuted, lineHeight: 18, marginTop: 2 },
  privacy: { fontSize: 12, color: Colors.textLight, lineHeight: 18, marginTop: 6, fontStyle: 'italic' },
});
