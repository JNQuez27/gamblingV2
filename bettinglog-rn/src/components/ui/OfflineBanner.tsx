import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAppContext } from '@/hooks/useAppContext';

// A thin bar at the very top of the app, shown only while the device has no
// internet. It sits above the screen header (e.g. above "Good morning") and
// takes the status-bar area; the layout below is told top-inset is 0 so nothing
// is covered (see app/_layout.tsx).
export default function OfflineBanner() {
  const { isOffline } = useAppContext();
  const insets = useSafeAreaInsets();
  if (!isOffline) return null;
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]} accessibilityRole="alert">
      <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <Path d="M12 20h.01" />
        <Path d="M2 2l20 20" />
      </Svg>
      <Text style={styles.text}>No internet connection · Connect to Internet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#c9433f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  text: { color: '#fff', fontSize: 12.5, fontWeight: '700', letterSpacing: 0.2 },
});
