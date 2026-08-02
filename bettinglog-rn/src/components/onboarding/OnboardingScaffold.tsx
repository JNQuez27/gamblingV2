// src/components/onboarding/OnboardingScaffold.tsx
//
// Shared shell for the 3-step onboarding flow: an animated segmented progress
// bar (the active segment fills as you land), a back button, a gently floating
// illustration on the header wash, and a fade-up entrance for the content.
// Screens supply the illustration, body and footer CTA.
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

const USE_NATIVE = Platform.OS !== 'web';
const TOTAL_STEPS = 3;

export default function OnboardingScaffold({
  step,
  title,
  subtitle,
  illustration,
  children,
  footer,
  showBack = true,
}: {
  step: number;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
}) {
  const router = useRouter();
  const fill = useRef(new Animated.Value(0)).current; // active progress segment
  const enter = useRef(new Animated.Value(0)).current; // content entrance
  const float = useRef(new Animated.Value(0)).current; // illustration bob

  useEffect(() => {
    // Width animation can't ride the native driver.
    Animated.timing(fill, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(enter, { toValue: 1, duration: 420, easing: Easing.out(Easing.ease), useNativeDriver: USE_NATIVE }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: USE_NATIVE }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: USE_NATIVE }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <LinearGradient colors={Colors.headerGradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.topRow}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M15 18l-6-6 6-6" />
              </Svg>
            </TouchableOpacity>
          ) : (
            <View style={styles.backSpacer} />
          )}
          <View style={styles.progressRow}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const idx = i + 1;
              return (
                <View key={i} style={styles.segTrack}>
                  {idx < step && <View style={styles.segFill} />}
                  {idx === step && (
                    <Animated.View
                      style={[
                        styles.segFill,
                        { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          <Text style={styles.stepText}>{step}/{TOTAL_STEPS}</Text>
        </View>

        <Animated.View
          style={[
            styles.illustrationWrap,
            { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] },
          ]}
        >
          {illustration}
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={{
          flex: 1,
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>{footer}</View>
    </SafeAreaView>
  );
}

// Gradient CTA used by every step's footer.
export function OnboardingCTA({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={styles.ctaWrap}
    >
      <LinearGradient
        colors={disabled ? [Colors.primaryLight, Colors.primaryLight] : [Colors.primaryDark, Colors.primary]}
        style={styles.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.ctaText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Small pop-in used to stagger chips/cards into view.
export function PopIn({ index = 0, children }: { index?: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(150 + Math.min(index, 8) * 70),
      Animated.spring(v, { toValue: 1, friction: 7, tension: 90, useNativeDriver: USE_NATIVE }),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={{ opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { width: 36, height: 36 },
  progressRow: { flex: 1, flexDirection: 'row', gap: 6 },
  segTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)', overflow: 'hidden' },
  segFill: { height: '100%', width: '100%', borderRadius: 3, backgroundColor: Colors.primary },
  stepText: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  illustrationWrap: { alignItems: 'center', marginTop: 18 },

  content: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 20 },

  footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  ctaWrap: { borderRadius: 16, overflow: 'hidden' },
  cta: { paddingVertical: 17, alignItems: 'center' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
