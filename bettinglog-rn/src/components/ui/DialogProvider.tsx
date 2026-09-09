import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Easing, BackHandler } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '@/constants/colors';

const DANGER = '#d64545';

export type DialogButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

// Same call shape as React Native's Alert.alert, so call sites are a drop-in
// rename. Renders a styled, animated dialog instead of the unstyleable OS one.
type ShowDialog = (title: string, message?: string, buttons?: DialogButton[]) => void;

const DialogContext = createContext<ShowDialog>(() => {});
export const useDialog = () => useContext(DialogContext);

type State = { title: string; message?: string; buttons: DialogButton[] } | null;

function DangerIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5 21 19H3L12 3.5z" stroke={DANGER} strokeWidth={2} strokeLinejoin="round" />
      <Line x1={12} y1={10} x2={12} y2={14} stroke={DANGER} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16.6} r={1.1} fill={DANGER} />
    </Svg>
  );
}
function InfoIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={Colors.primary} strokeWidth={2} />
      <Line x1={12} y1={11} x2={12} y2={16.5} stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={7.6} r={1.2} fill={Colors.primary} />
    </Svg>
  );
}

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<State>(null);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show: ShowDialog = useCallback((title, message, buttons) => {
    setState({ title, message, buttons: buttons && buttons.length ? buttons : [{ text: 'OK' }] });
  }, []);

  const hide = useCallback(() => setState(null), []);

  // Entrance animation whenever a dialog appears (or swaps to a nested one).
  useEffect(() => {
    if (!state) return;
    scale.setValue(0.9);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }),
      Animated.timing(opacity, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [state, scale, opacity]);

  // Android back dismisses like a cancel.
  useEffect(() => {
    if (!state) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      hide();
      return true;
    });
    return () => sub.remove();
  }, [state, hide]);

  const press = (b: DialogButton) => {
    hide();
    b.onPress?.();
  };

  const hasDanger = !!state?.buttons.some((b) => b.style === 'destructive');
  const actions = state?.buttons.filter((b) => b.style !== 'cancel') ?? [];
  const cancels = state?.buttons.filter((b) => b.style === 'cancel') ?? [];

  return (
    <DialogContext.Provider value={show}>
      {children}
      <Modal transparent visible={!!state} animationType="fade" onRequestClose={hide} statusBarTranslucent>
        <View style={styles.scrim}>
          <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
            <View style={[styles.iconWrap, { backgroundColor: hasDanger ? '#fdecec' : '#eaf2fb' }]}>
              {hasDanger ? <DangerIcon /> : <InfoIcon />}
            </View>

            {!!state?.title && <Text style={styles.title}>{state.title}</Text>}
            {!!state?.message && <Text style={styles.message}>{state.message}</Text>}

            <View style={styles.buttons}>
              {actions.map((b, i) => (
                <TouchableOpacity
                  key={`a${i}`}
                  onPress={() => press(b)}
                  activeOpacity={0.85}
                  style={[styles.btn, b.style === 'destructive' ? styles.btnDanger : styles.btnPrimary]}
                  accessibilityRole="button"
                >
                  <Text style={styles.btnFilledText}>{b.text}</Text>
                </TouchableOpacity>
              ))}
              {cancels.map((b, i) => (
                <TouchableOpacity key={`c${i}`} onPress={() => press(b)} activeOpacity={0.6} style={styles.btnGhost} accessibilityRole="button">
                  <Text style={styles.btnGhostText}>{b.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </DialogContext.Provider>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(17,24,39,0.5)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 19, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 },
  message: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 22 },
  buttons: { width: '100%', gap: 10 },
  btn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnDanger: { backgroundColor: DANGER },
  btnFilledText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  btnGhost: { borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  btnGhostText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
});
