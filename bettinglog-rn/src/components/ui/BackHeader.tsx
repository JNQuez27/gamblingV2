// src/components/ui/BackHeader.tsx
//
// Shared back-button header for stacked sub-screens (settings pages etc.),
// so every pushed screen has an obvious way back.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

export default function BackHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.btn}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M15 18l-6-6 6-6" />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 20 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
});
