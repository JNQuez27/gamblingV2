import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { ONBOARDING_ART, type ArtKey } from '@/constants/onboardingArt';

const { width: W, height: H } = Dimensions.get('window');
const ART_SIZE = Math.min(W - 64, H * 0.38, 300);

// ── Slide data ───────────────────────────────────────────────────────────────
// Each StorySet illustration is matched to the message that fits its theme.

type Slide = {
  key: ArtKey;
  pre: string;
  accent: string;
  accentColor: string;
  subtitle: string;
  gradient: readonly [string, string, string];
};

const SLIDES: Slide[] = [
  {
    key: 'diary',
    pre: 'Know your ',
    accent: 'pattern',
    accentColor: '#3a7dbf',
    subtitle: 'Track your mood and reflections daily. Awareness is the first step toward change.',
    gradient: ['#eaf4fd', '#dceaf6', '#cfe7de'],
  },
  {
    key: 'savings',
    pre: 'Set your ',
    accent: 'limits',
    accentColor: '#dd9a2b',
    subtitle: 'See exactly where your money goes. Opportunity cost makes every peso count.',
    gradient: ['#fdf6e8', '#f7edd6', '#eaf1f5'],
  },
  {
    key: 'goals',
    pre: 'Grow your ',
    accent: 'control',
    accentColor: '#3f9a6e',
    subtitle: 'Step-by-step plans, guided consultation, and measurable influence, all theory-driven.',
    gradient: ['#eaf6ef', '#dcefe2', '#e9f1f7'],
  },
];

// ── Per-layer motion ─────────────────────────────────────────────────────────
// Classify each layer by its group id so shapes move in a way that suits them:
// grounded parts stay put, the background barely moves, accents float, clouds
// drift sideways, and a "shine" twinkles - all sharing one clock so it reads as
// one cohesive motion, not noise.
type Kind = 'bg' | 'ground' | 'cloud' | 'shine' | 'trophy' | 'pulse' | 'float';

function classify(id: string): Kind {
  const s = id.toLowerCase();
  if (s.includes('background')) return 'bg';
  if (/shadow|floor/.test(s)) return 'ground';
  if (s.includes('cloud')) return 'cloud';
  if (s.includes('shine')) return 'shine';
  if (s.includes('trophy')) return 'trophy';
  if (s.includes('bulb') || s.includes('heart')) return 'pulse';
  return 'float';
}

function AnimatedArt({
  slide,
  index,
  scrollX,
  floatT,
  active,
}: {
  slide: Slide;
  index: number;
  scrollX: Animated.Value;
  floatT: Animated.Value;
  active: boolean;
}) {
  const art = ONBOARDING_ART[slide.key];
  const enter = useRef(new Animated.Value(0)).current;
  const n = art.layers.length;
  const inputRange = [(index - 1) * W, index * W, (index + 1) * W];

  // Replay the staggered entrance whenever this slide becomes active.
  useEffect(() => {
    enter.setValue(0);
    if (active) {
      Animated.timing(enter, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [active, enter]);

  const illoScale = scrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });
  const illoOpacity = scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });

  // Shared idle drivers (one clock -> harmonious motion). Gentle by design.
  const shinePulse = floatT.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.97, 1.04, 0.97] });
  const softPulse = floatT.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.96, 1.05, 0.96] });
  const cloudScale = floatT.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.04, 1.08, 1.04] }); // eases clouds outward from center

  return (
    <Animated.View style={[styles.artBox, { opacity: illoOpacity, transform: [{ scale: illoScale }] }]}>
      <View style={styles.artHalo} />

      {art.layers.map((layer, k) => {
        const kind = classify(layer.id);
        const t = n > 1 ? k / (n - 1) : 0;
        const depth = kind === 'bg' ? 0.05 : kind === 'ground' ? 0.1 : t;
        const doFloat = kind === 'float' || kind === 'trophy';
        const amp = kind === 'trophy' ? 5 : 4 + depth * 7;

        const parallaxX = scrollX.interpolate({
          inputRange,
          outputRange: [W * 0.16 * depth, 0, -W * 0.16 * depth],
          extrapolate: 'clamp',
        });
        const floatY = floatT.interpolate({ inputRange: [0, 0.5, 1], outputRange: [amp / 2, -amp / 2, amp / 2] });

        // Staggered entrance carved out of the single `enter` driver.
        const startAt = Math.min(0.8, k * 0.09);
        const ratio = enter.interpolate({
          inputRange: [startAt, Math.min(1, startAt + 0.55)],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });
        const entranceY = ratio.interpolate({ inputRange: [0, 1], outputRange: [32, 0] });
        const entranceScale = ratio.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

        // Compose transforms per kind: floats bob, shine/pulse breathe, clouds
        // ease outward from center. Nothing spins.
        const translateY = doFloat ? Animated.add(entranceY, floatY) : entranceY;
        const transform: any[] = [{ translateX: parallaxX }, { translateY }, { scale: entranceScale }];
        if (kind === 'shine') transform.push({ scale: shinePulse });
        else if (kind === 'pulse') transform.push({ scale: softPulse });
        else if (kind === 'cloud') transform.push({ scale: cloudScale });

        return (
          <Animated.View key={layer.id + k} style={[StyleSheet.absoluteFill, { opacity: ratio, transform }]}>
            <SvgXml xml={layer.xml} width="100%" height="100%" />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function SplashScreen() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const floatT = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(floatT, {
        toValue: 1,
        duration: 4800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [floatT]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const i = Math.round(e.nativeEvent.contentOffset.x / W);
        if (i !== index) setIndex(i);
      },
    },
  );

  const goToLogin = () => router.replace('/login');
  const goNext = () => {
    if (isLast) goToLogin();
    else scrollRef.current?.scrollTo({ x: (index + 1) * W, animated: true });
  };

  return (
    <View style={styles.root}>
      {/* Per-slide gradient, crossfaded on swipe. */}
      {SLIDES.map((s, i) => {
        const opacity = scrollX.interpolate({
          inputRange: [(i - 1) * W, i * W, (i + 1) * W],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View key={s.key} style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
            <LinearGradient colors={s.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          </Animated.View>
        );
      })}

      <SafeAreaView style={styles.safe}>
        <View style={styles.skipRow}>
          {!isLast && (
            <TouchableOpacity onPress={goToLogin} hitSlop={12} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Skip introduction">
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.pager}
        >
          {SLIDES.map((slide, i) => {
            const range = [(i - 1) * W, i * W, (i + 1) * W];
            const textOpacity = scrollX.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: 'clamp' });
            const textY = scrollX.interpolate({ inputRange: range, outputRange: [26, 0, 26], extrapolate: 'clamp' });
            return (
              <View key={slide.key} style={styles.slide}>
                <View style={styles.artWrap}>
                  <AnimatedArt slide={slide} index={i} scrollX={scrollX} floatT={floatT} active={i === index} />
                </View>
                <Animated.View style={[styles.copy, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
                  <Text style={styles.title}>
                    {slide.pre}
                    <Text style={{ color: slide.accentColor }}>{slide.accent}</Text>
                  </Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>
                </Animated.View>
              </View>
            );
          })}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {SLIDES.map((s, i) => {
              const range = [(i - 1) * W, i * W, (i + 1) * W];
              const dotW = scrollX.interpolate({ inputRange: range, outputRange: [8, 26, 8], extrapolate: 'clamp' });
              const dotOpacity = scrollX.interpolate({ inputRange: range, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
              return (
                <TouchableOpacity key={s.key} onPress={() => scrollRef.current?.scrollTo({ x: i * W, animated: true })} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Go to slide ${i + 1}`}>
                  <Animated.View style={[styles.dot, { width: dotW, opacity: dotOpacity, backgroundColor: SLIDES[index].accentColor }]} />
                </TouchableOpacity>
              );
            })}
          </View>

          <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <TouchableOpacity onPress={goNext} style={styles.btnTouchable} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={isLast ? 'Get started' : 'Continue'}>
              <Text style={styles.btnText}>{isLast ? 'Get Started' : 'Continue'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#eaf4fd' },
  safe: { flex: 1 },
  skipRow: { alignItems: 'flex-end', paddingTop: 12, paddingHorizontal: 28, minHeight: 40 },
  skip: { color: Colors.textMuted, fontSize: 14, letterSpacing: 0.3 },
  pager: { flex: 1 },
  slide: { width: W, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  artWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  artBox: { width: ART_SIZE, height: ART_SIZE, alignItems: 'center', justifyContent: 'center' },
  artHalo: {
    position: 'absolute',
    width: ART_SIZE * 0.84,
    height: ART_SIZE * 0.84,
    borderRadius: ART_SIZE,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  copy: { paddingBottom: 8, minHeight: 150 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 14, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.textMuted, lineHeight: 25, textAlign: 'center', paddingHorizontal: 6 },
  footer: { paddingHorizontal: 28, paddingBottom: 24 },
  dotsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 22 },
  dot: { height: 8, borderRadius: 4 },
  btn: { borderRadius: 16, overflow: 'hidden' },
  btnTouchable: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
