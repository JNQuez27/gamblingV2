// src/components/ui/Logo.tsx
//
// BettingLog logo. Both the mascot and the "BettingLog" wordmark are the
// supplied brand artwork (transparent PNGs in assets/), so the wordmark is
// pixel-exact rather than an approximation via a system font.
//   variant="stack" (default) - mascot above the wordmark + tagline (login)
//   variant="row"             - small mascot beside the wordmark (splash header)
import React from 'react';
import { View, Text, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Mascot from './Mascot';

const NAVY = '#072a4b';
const MASCOT = require('../../../assets/mascot.png');
const WORDMARK = require('../../../assets/bettinglog-wordmark.png');
const WORDMARK_RATIO = 1825 / 360; // width / height of the artwork

function Wordmark({ width }: { width: number }) {
  return (
    <Image
      source={WORDMARK}
      style={{ width, height: width / WORDMARK_RATIO }}
      resizeMode="contain"
      accessibilityLabel="BettingLog"
    />
  );
}

export function Logo({
  size = 140,
  tagline = true,
  variant = 'stack',
  style,
}: {
  size?: number;
  tagline?: boolean;
  variant?: 'stack' | 'row';
  style?: StyleProp<ViewStyle>;
}) {
  if (variant === 'row') {
    return (
      <View style={[styles.row, style]}>
        <Mascot size={size} source={MASCOT} />
        <Wordmark width={size * 2} />
      </View>
    );
  }

  return (
    <View style={[styles.stack, style]}>
      <Mascot size={size} source={MASCOT} />
      <View style={{ height: size * 0.04 }} />
      <Wordmark width={size * 1.7} />
      {tagline && <Text style={[styles.tagline, { fontSize: size * 0.11 }]}>Track. Reflect. Regain Control.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagline: { fontFamily: 'Nunito_400Regular', color: NAVY, letterSpacing: -0.3, marginTop: 10 },
});

export default Logo;
