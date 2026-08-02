import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { Colors } from '@/constants/colors';

const USE_NATIVE = Platform.OS !== 'web';

// Bar geometry. The active tab's icon rides in a bubble raised above the bar;
// a background-colored "notch" circle bites into the bar underneath it.
//
// ── SPACING KNOBS - edit these to tune how much room the bar takes ──────────
// RAISE      = how far the bubble pokes above the bar (smaller = tighter).
// BOTTOM_GAP = empty space below the bar.
// Total height of the whole bar area = RAISE + BAR_H + BOTTOM_GAP.
const RAISE = 8;
const BOTTOM_GAP = 6;
// ─────────────────────────────────────────────────────────────────────────────
const H_MARGIN = 14;
const BAR_H = 60;
const BUBBLE = 52;
const NOTCH = BUBBLE + 16; // ring gap around the bubble
// Bubble center measured from the bar's top edge (derived - no need to touch).
const BUBBLE_CENTER = BUBBLE / 2 - RAISE;

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

function DiaryIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Svg>
  );
}

function LearnIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <Path d="M6 12v5c3 3 9 3 12 0v-5" />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

const TAB_META: Record<string, { label: string; Icon: React.ComponentType<{ color: string }> }> = {
  home: { label: 'Home', Icon: HomeIcon },
  diary: { label: 'Diary', Icon: DiaryIcon },
  learn: { label: 'Learn', Icon: LearnIcon },
  profile: { label: 'Profile', Icon: ProfileIcon },
};

// "Slime" bottom bar: the active icon lives in a raised bubble docked into a
// notch. On tab change the bubble springs across with a squash-and-stretch
// (gooey) motion, the notch travels with it, the icon pops in, and a small
function SlimeTabBar({ state, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const slotW = (width - H_MARGIN * 2) / state.routes.length;
  const slotCenter = (i: number) => i * slotW + slotW / 2;

  const centerX = useRef(new Animated.Value(slotCenter(state.index))).current;
  const squash = useRef(new Animated.Value(0)).current;
  const iconPop = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;
  // One opacity per tab: 1 when inactive (label shown), 0 when active (hidden).
  const labelAnims = useRef(state.routes.map((_, i) => new Animated.Value(i === state.index ? 0 : 1))).current;
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      centerX.setValue(slotCenter(state.index));
      return;
    }

    // Travel with overshoot - the bubble "flows" to its new slot.
    Animated.spring(centerX, {
      toValue: slotCenter(state.index),
      friction: 6.5,
      tension: 70,
      useNativeDriver: USE_NATIVE,
    }).start();

    // Gooey squash while moving, spring back on arrival.
    squash.setValue(0);
    Animated.sequence([
      Animated.timing(squash, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE }),
      Animated.spring(squash, { toValue: 0, friction: 4, tension: 120, useNativeDriver: USE_NATIVE }),
    ]).start();

    // New icon pops into the bubble.
    iconPop.setValue(0);
    Animated.spring(iconPop, { toValue: 1, friction: 6, tension: 120, useNativeDriver: USE_NATIVE }).start();

    // Dot fades back in once the bubble has landed.
    dotAnim.setValue(0);
    Animated.sequence([
      Animated.delay(170),
      Animated.timing(dotAnim, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: USE_NATIVE }),
    ]).start();

    // Labels: the active tab's label fades out (its icon rides the bubble),
    // the others fade back in.
    labelAnims.forEach((a, i) =>
      Animated.timing(a, {
        toValue: i === state.index ? 0 : 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: USE_NATIVE,
      }).start(),
    );
  }, [state.index, slotW]);

  const ActiveIcon = (TAB_META[state.routes[state.index].name] ?? TAB_META.home).Icon;

  const bubbleStyle = {
    transform: [
      { translateX: centerX },
      { scaleX: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) },
      { scaleY: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }) },
    ],
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {/* Moving notch - a bg-colored bite under the bubble */}
        <Animated.View style={[styles.notch, { transform: [{ translateX: centerX }] }]} pointerEvents="none" />

        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const meta = TAB_META[route.name] ?? { label: route.name, Icon: HomeIcon };
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.slot}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
            >
              {/* The active slot's inline icon + label hide - the icon rides in the bubble */}
              <Animated.View style={{ opacity: labelAnims[i] }}>
                <meta.Icon color={Colors.textLight} />
              </Animated.View>
              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.slotLabel,
                  {
                    opacity: labelAnims[i],
                    transform: [{ translateY: labelAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-2, 0] }) }],
                  },
                ]}
              >
                {meta.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* The bubble itself */}
      <Animated.View style={[styles.bubble, bubbleStyle]} pointerEvents="none">
        <LinearGradient
          colors={[Colors.secondaryDark, Colors.secondary]}
          style={styles.bubbleFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={{
              opacity: iconPop,
              transform: [{ scale: iconPop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
            }}
          >
            <ActiveIcon color={Colors.white} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <SlimeTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bg,
    paddingTop: RAISE,
    paddingHorizontal: H_MARGIN,
    paddingBottom: BOTTOM_GAP,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: 31,
    height: BAR_H,
    overflow: 'hidden',
    shadowColor: '#22303e',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  notch: {
    position: 'absolute',
    top: BUBBLE_CENTER - NOTCH / 2, // follows the bubble's center automatically
    left: -(NOTCH / 2),
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: Colors.bg,
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  slotLabel: { fontSize: 10, fontWeight: '600', color: Colors.textLight, letterSpacing: 0.2 },
  dot: {
    position: 'absolute',
    bottom: 8,
    left: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondaryDark,
  },
  bubble: {
    position: 'absolute',
    top: 0,
    left: H_MARGIN - BUBBLE / 2,
    width: BUBBLE,
    height: BUBBLE,
  },
  bubbleFill: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
