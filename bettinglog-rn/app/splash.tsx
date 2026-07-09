import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

// ── Illustrations ────────────────────────────────────────────────────────────

function AwarenessIllustration() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200" fill="none">
      <Circle cx="100" cy="100" r="80" fill="#a8cce8" fillOpacity="0.25" />
      <Ellipse cx="100" cy="100" rx="55" ry="32" stroke="#5b9bd5" strokeWidth="3" fill="none" />
      <Circle cx="100" cy="100" r="18" fill="#5b9bd5" fillOpacity="0.8" />
      <Circle cx="100" cy="100" r="10" fill="#3a7dbf" />
      <Circle cx="106" cy="95" r="3" fill="white" fillOpacity="0.8" />
      <Line x1="100" y1="30" x2="100" y2="50" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Line x1="100" y1="150" x2="100" y2="170" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Line x1="30" y1="100" x2="50" y2="100" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Line x1="150" y1="100" x2="170" y2="100" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Line x1="51" y1="51" x2="65" y2="65" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <Line x1="135" y1="135" x2="149" y2="149" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <Line x1="149" y1="51" x2="135" y2="65" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <Line x1="51" y1="149" x2="65" y2="135" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

function ReflectionIllustration() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200" fill="none">
      <Circle cx="100" cy="100" r="80" fill="#b2d9c4" fillOpacity="0.3" />
      <Circle cx="100" cy="100" r="55" stroke="#7ab89a" strokeWidth="3" fill="none" strokeDasharray="6 4" />
      <Path d="M74 68 L126 68 L100 100 L126 132 L74 132 L100 100 Z" fill="#7ab89a" fillOpacity="0.5" stroke="#4f9a74" strokeWidth="2" strokeLinejoin="round" />
      <Rect x="70" y="62" width="60" height="8" rx="4" fill="#4f9a74" fillOpacity="0.8" />
      <Rect x="70" y="130" width="60" height="8" rx="4" fill="#4f9a74" fillOpacity="0.8" />
      <Circle cx="100" cy="106" r="3" fill="white" fillOpacity="0.9" />
      <Circle cx="100" cy="115" r="2" fill="white" fillOpacity="0.6" />
      <Circle cx="100" cy="122" r="1.5" fill="white" fillOpacity="0.4" />
    </Svg>
  );
}

function GrowthIllustration() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200" fill="none">
      <Circle cx="100" cy="100" r="80" fill="#e8b86d" fillOpacity="0.2" />
      <Path d="M60 145 Q75 120 90 110 Q105 100 115 85 Q125 70 140 55" stroke="#e8b86d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <Path d="M130 50 L140 55 L135 66" stroke="#e8b86d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="60" cy="145" r="7" fill="#e8b86d" fillOpacity="0.6" />
      <Circle cx="88" cy="112" r="7" fill="#e8b86d" fillOpacity="0.75" />
      <Circle cx="115" cy="85" r="7" fill="#e8b86d" fillOpacity="0.9" />
      <Circle cx="140" cy="55" r="9" fill="#e8b86d" />
      <Circle cx="140" cy="55" r="5" fill="white" fillOpacity="0.8" />
      <Circle cx="155" cy="80" r="2.5" fill="#e8b86d" fillOpacity="0.5" />
      <Circle cx="165" cy="100" r="1.8" fill="#e8b86d" fillOpacity="0.4" />
      <Circle cx="50" cy="90" r="2" fill="#7ab89a" fillOpacity="0.5" />
    </Svg>
  );
}

// ── Slide data ───────────────────────────────────────────────────────────────

const slides = [
  {
    id: 0,
    gradientColors: ['#e8f4fd', '#d4eaf7', '#c8e8e0'] as const,
    Illustration: AwarenessIllustration,
    tag: 'Awareness',
    title: 'See yourself clearly.',
    body: 'The first step toward change is noticing what\'s happening inside you — without judgment.',
  },
  {
    id: 1,
    gradientColors: ['#e8f4fd', '#d6eee4', '#c8e8d8'] as const,
    Illustration: ReflectionIllustration,
    tag: 'Reflection',
    title: 'Pause. Think. Understand.',
    body: 'Take a moment to understand your patterns. Reflection is where real growth begins.',
  },
  {
    id: 2,
    gradientColors: ['#fdf6e8', '#f8eed8', '#e8f4fd'] as const,
    Illustration: GrowthIllustration,
    tag: 'Better Choices',
    title: 'You can choose differently.',
    body: 'Every moment is a new opportunity. Small, intentional changes lead to a life you\'re proud of.',
  },
];

// ── Screen ───────────────────────────────────────────────────────────────────

export default function SplashScreen() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const { Illustration } = slide;

  const goNext = () => {
    if (!isLast) {
      setCurrent((c) => c + 1);
    } else {
      router.replace('/login');
    }
  };

  return (
    <LinearGradient colors={slide.gradientColors} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView style={styles.safe}>
        {/* Skip */}
        <View style={styles.skipRow}>
          {!isLast && (
            <TouchableOpacity onPress={() => router.replace('/login')} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <Illustration />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Tag */}
          <View style={styles.tagWrap}>
            <Text style={styles.tag}>{slide.tag}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{slide.title}</Text>

          {/* Body */}
          <Text style={styles.body}>{slide.body}</Text>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setCurrent(i)} hitSlop={8}>
                <View style={[styles.dot, i === current && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA */}
          <LinearGradient
            colors={isLast ? [Colors.secondaryDark, Colors.secondary] : [Colors.primaryDark, Colors.primary]}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity onPress={goNext} style={styles.btnTouchable}>
              <Text style={styles.btnText}>{isLast ? 'Get Started' : 'Continue'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 28 },
  skipRow: { alignItems: 'flex-end', paddingTop: 16, minHeight: 40 },
  skip: { color: Colors.textMuted, fontSize: 14, letterSpacing: 0.3 },
  illustrationWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illustrationCircle: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 120,
    padding: 28,
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  content: { paddingBottom: 36 },
  tagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(91,155,213,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
  },
  tag: { color: Colors.primaryDark, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  body: { fontSize: 16, color: Colors.textMuted, lineHeight: 26, marginBottom: 32 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  dotActive: { width: 28, backgroundColor: Colors.primary },
  btn: { borderRadius: 16, overflow: 'hidden' },
  btnTouchable: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
