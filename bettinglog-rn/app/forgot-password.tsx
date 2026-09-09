import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { sendPasswordReset, friendlyAuthError } from '@/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (e: any) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#e8f4fd', '#f0f4f8', '#e8f0ee']} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.body}>
            <Text style={styles.headline}>{sent ? 'Check your email' : 'Reset password'}</Text>
            <Text style={styles.subheadline}>
              {sent
                ? `We sent a reset link to ${email.trim()}. Open it on this device to set a new password.`
                : "Enter your email and we'll send you a link to reset your password."}
            </Text>

            {!sent && (
              <View style={styles.form}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
                {error && <Text style={styles.error}>{error}</Text>}
                <LinearGradient
                  colors={loading ? [Colors.primaryLight, Colors.primaryLight] : [Colors.primaryDark, Colors.primary]}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TouchableOpacity onPress={handleSend} disabled={loading} style={styles.submitTouchable} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Send reset link">
                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Send reset link</Text>}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backWrap} hitSlop={8} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Back to login">
              <Text style={styles.backLink}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  body: { flex: 1, padding: 28, paddingTop: 60, justifyContent: 'flex-start' },
  headline: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 10, letterSpacing: -0.5 },
  subheadline: { fontSize: 15, color: Colors.textMuted, lineHeight: 22, marginBottom: 28 },
  form: { gap: 6 },
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
  error: { color: '#c0392b', fontSize: 13, marginTop: 6 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  submitTouchable: { paddingVertical: 17, alignItems: 'center' },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  backWrap: { marginTop: 24, alignSelf: 'center' },
  backLink: { fontSize: 14, color: Colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
