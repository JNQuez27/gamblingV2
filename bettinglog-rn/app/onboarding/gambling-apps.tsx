import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { GAMBLING_APP_PRESETS } from '@/constants/gamblingApps';
import { detectedAppNames } from '@/services/appDetection.service';
import { saveChosenApps, OTHERS } from '@/services/gamblingProfile';
import { IconSmartphone } from '@/components/ui/icons';
import OnboardingScaffold, { OnboardingCTA, PopIn } from '@/components/onboarding/OnboardingScaffold';

// A phone with app tiles - one flagged - with soft "radar" rings: what this
// step is about, at a glance.
function PhoneIllustration() {
  return (
    <Svg width={116} height={116} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="54" fill={Colors.primary} fillOpacity="0.12" />
      <Circle cx="60" cy="60" r="42" stroke={Colors.primary} strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 6" />
      {/* phone */}
      <Rect x="39" y="22" width="42" height="76" rx="9" fill="#ffffff" stroke={Colors.primaryDark} strokeWidth="2.5" />
      <Path d="M54 28h12" stroke={Colors.border} strokeWidth="2.5" strokeLinecap="round" />
      {/* app tiles */}
      <Rect x="46" y="36" width="12" height="12" rx="3.5" fill={Colors.primary} fillOpacity="0.75" />
      <Rect x="62" y="36" width="12" height="12" rx="3.5" fill={Colors.secondary} fillOpacity="0.75" />
      <Rect x="46" y="52" width="12" height="12" rx="3.5" fill={Colors.accent} fillOpacity="0.7" />
      <Rect x="46" y="68" width="12" height="12" rx="3.5" fill={Colors.primaryLight} />
      <Rect x="62" y="68" width="12" height="12" rx="3.5" fill={Colors.secondaryLight} />
      {/* flagged gambling tile */}
      <Rect x="62" y="52" width="12" height="12" rx="3.5" fill="#e59a9a" />
      <Path d="M68 55.5v3.5" stroke="#7c2d2d" strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="68" cy="61.4" r="0.9" fill="#7c2d2d" />
      {/* radar ping on the flagged tile */}
      <Circle cx="68" cy="58" r="12" stroke="#d98383" strokeOpacity="0.55" strokeWidth="1.5" />
      <Circle cx="68" cy="58" r="18" stroke="#d98383" strokeOpacity="0.25" strokeWidth="1.5" />
    </Svg>
  );
}

// Step 2 - which gambling apps/sites the user uses. Multi-select chips seeded
// with common PH apps. When the native monitor reports installed apps they're
// pre-selected and badged; self-report remains the source of truth.
export default function GamblingAppsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [detected, setDetected] = useState<string[]>([]);

  useEffect(() => {
    detectedAppNames()
      .then((names) => {
        setDetected(names);
        // Pre-select what we found; the user can always deselect.
        setSelected((prev) => [...new Set([...prev, ...names])]);
      })
      .catch(() => {});
  }, []);

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  return (
    <OnboardingScaffold
      step={3}
      title="Which apps do you use?"
      subtitle="Pick any that apply - what you report here is the source of truth. You can add background monitoring later, always with your consent."
      illustration={<PhoneIllustration />}
      footer={
        <OnboardingCTA
          label={selected.length ? 'Continue' : 'Skip for now'}
          onPress={async () => {
            await saveChosenApps(selected);
            router.push('/onboarding/protect');
          }}
        />
      }
    >
      {detected.length > 0 && (
        <View style={styles.detectedNote}>
          <IconSmartphone size={16} color={Colors.primaryDark} />
          <Text style={styles.detectedNoteText}>
            We noticed {detected.length} gambling app{detected.length === 1 ? '' : 's'} installed
            on this device and pre-selected {detected.length === 1 ? 'it' : 'them'}.
          </Text>
        </View>
      )}

      <View style={styles.chips}>
        {GAMBLING_APP_PRESETS.map((app, i) => {
          const on = selected.includes(app.name);
          const wasDetected = detected.includes(app.name);
          return (
            <PopIn key={app.name} index={i}>
              <TouchableOpacity
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => toggle(app.name)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${app.name}${wasDetected ? ', installed on this device' : ''}`}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {app.name}{wasDetected ? ' · installed' : ''}
                </Text>
              </TouchableOpacity>
            </PopIn>
          );
        })}

        {/* Catch-all for anything not listed. Selecting only this keeps the
            Learn screen's materials general (no single focus). */}
        <PopIn index={GAMBLING_APP_PRESETS.length}>
          <TouchableOpacity
            style={[styles.chip, selected.includes(OTHERS) && styles.chipOn]}
            onPress={() => toggle(OTHERS)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: selected.includes(OTHERS) }}
            accessibilityLabel="Others - an app or site not listed"
          >
            <Text style={[styles.chipText, selected.includes(OTHERS) && styles.chipTextOn]}>
              Others
            </Text>
          </TouchableOpacity>
        </PopIn>
      </View>

      {selected.length > 0 && (
        <Text style={styles.countHint}>
          {selected.length} selected - you can change this anytime in Settings.
        </Text>
      )}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  detectedNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detectedNoteText: { flex: 1, fontSize: 13, color: '#78350f', lineHeight: 19 },
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
  countHint: { fontSize: 12.5, color: Colors.textLight, marginTop: 16 },
});
