import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { beginPasswordRecovery, updatePassword } from '@/services/auth.service';

function EyeIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      {!open && <Path d="M4 4 L20 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />}
    </Svg>
  );
}

type Phase = 'verifying' | 'ready' | 'error' | 'done';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; access_token?: string; refresh_token?: string; error_description?: string }>();

  const [phase, setPhase] = useState<Phase>('verifying');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  // Establish the recovery session from the deep-link params once.
  useEffect(() => {
    (async () => {
      if (params.error_description) {
        setPhase('error');
        setMessage(String(params.error_description));
        return;
      }
      try {
        await beginPasswordRecovery({
          code: params.code ?? null,
          access_token: params.access_token ?? null,
          refresh_token: params.refresh_token ?? null,
        });
        setPhase('ready');
      } catch (e: any) {
        setPhase('error');
        setMessage(e?.message ?? 'This reset link is invalid or has expired.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await updatePassword(password);
      setPhase('done');
    } catch (e: any) {
      setMessage(e?.message ?? 'Could not update password. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#e8f4fd', '#f0f4f8', '#e8f0ee']} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.body}>
            {phase === 'verifying' && (
              <View style={styles.center}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.subheadline}>Verifying your reset link...</Text>
              </View>
            )}

            {phase === 'error' && (
              <>
                <Text style={styles.headline}>Link problem</Text>
                <Text style={styles.subheadline}>{message}</Text>
                <TouchableOpacity onPress={() => router.replace('/forgot-password')} style={styles.submitBtnPlain} activeOpacity={0.85} accessibilityRole="button">
                  <Text style={styles.backLink}>Request a new link</Text>
                </TouchableOpacity>
              </>
            )}

            {phase === 'done' && (
              <>
                <Text style={styles.headline}>Password updated</Text>
                <Text style={styles.subheadline}>Your password has been changed. You're all set.</Text>
                <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.submitTouchable} activeOpacity={0.85} accessibilityRole="button">
                    <Text style={styles.submitText}>Continue</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </>
            )}

            {phase === 'ready' && (
              <>
                <Text style={styles.headline}>Set a new password</Text>
                <Text style={styles.subheadline}>Choose a new password for your account.</Text>

                <Text style={styles.label}>NEW PASSWORD</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry={!showPass}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass((s) => !s)} hitSlop={10} accessibilityRole="button" accessibilityLabel={showPass ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showPass} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 14 }]}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showPass}
                />

                {!!message && <Text style={styles.error}>{message}</Text>}

                <LinearGradient colors={saving ? [Colors.primaryLight, Colors.primaryLight] : [Colors.primaryDark, Colors.primary]} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.submitTouchable} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Update password">
                    {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Update password</Text>}
                  </TouchableOpacity>
                </LinearGradient>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  body: { flex: 1, padding: 28, paddingTop: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  headline: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 10, letterSpacing: -0.5 },
  subheadline: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, letterSpacing: 1 },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontSize: 15,
    color: Colors.text,
  },
  passwordWrap: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 2 },
  error: { color: '#c0392b', fontSize: 13, marginTop: 10 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 20 },
  submitBtnPlain: { marginTop: 20, alignSelf: 'flex-start' },
  submitTouchable: { paddingVertical: 17, alignItems: 'center' },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  backLink: { fontSize: 14, color: Colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
