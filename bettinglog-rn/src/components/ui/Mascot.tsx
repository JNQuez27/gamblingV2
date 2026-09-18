// src/components/ui/Mascot.tsx
//
// The app's mascot: the BettingLog dice character, alive rather than static.
// Idle it breathes - a slow float with a gentle tilt, as if hovering. Tapping
// it "rolls" the die: a full spin with a squash-and-stretch pop.
//
// Defaults to the simplified dice-only artwork, which stays readable down to
// 54px (journey map, onboarding). Pass `source` for the full logo art.
// All animation is transform-only so it runs on the native driver.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, AccessibilityInfo } from 'react-native';

const SIMPLE = require('../../../assets/mascot-simple.png');

export default function Mascot({
  size = 54,
  source = SIMPLE,
  interactive = true,
}: {
  size?: number;
  source?: number;
  interactive?: boolean;
}) {
  const idle = useRef(new Animated.Value(0)).current;
  const roll = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect the OS "reduce motion" setting - this is a looping animation.
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduceMotion(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(idle, {
        toValue: 1,
        duration: 3200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [idle, reduceMotion]);

  const float = idle.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -size * 0.08, 0] });
  const tilt = idle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-4deg', '0deg', '4deg', '0deg'],
  });

  // Tap: one full rotation with a pop on the way round.
  const spin = roll.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const pop = roll.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [1, 1.18, 0.93, 1] });

  const playRoll = () => {
    roll.setValue(0);
    Animated.timing(roll, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const art = (
    <Animated.Image
      source={source}
      style={{
        width: size,
        height: size,
        transform: [{ translateY: float }, { rotate: tilt }, { rotate: spin }, { scale: pop }],
      }}
      resizeMode="contain"
      accessibilityLabel="BettingLog mascot"
    />
  );

  if (!interactive) return art;

  return (
    <Pressable
      onPress={playRoll}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="BettingLog mascot, tap to roll"
    >
      {art}
    </Pressable>
  );
}
