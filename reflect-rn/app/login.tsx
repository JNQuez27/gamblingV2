import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  const handleOAuth = async (_provider: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <LinearGradient colors={['#e8f4fd', '#f0f4f8', '#e8f0ee']} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={[Colors.primaryDark, Colors.secondary]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
                  <Circle cx="15" cy="15" r="12" stroke="white" strokeWidth="2" fill="none" />
                  <Path d="M10 15 Q12.5 10 15 15 Q17.5 20 20 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </Svg>
              </LinearGradient>
              <Text style={styles.headline}>{mode === 'login' ? 'Welcome back' : 'Create your space'}</Text>
              <Text style={styles.subheadline}>
                {mode === 'login' ? 'Your reflections are waiting for you.' : 'A calm place for self-awareness starts here.'}
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {/* Mode toggle */}
              <View style={styles.toggle}>
                {(['login', 'signup'] as AuthMode[]).map((m) => (
                  <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                      {m === 'login' ? 'Log In' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* OAuth */}
              <View style={styles.oauthGroup}>
                <TouchableOpacity onPress={() => handleOAuth('google')} disabled={loading} style={styles.oauthBtn}>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </Svg>
                  <Text style={styles.oauthText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleOAuth('facebook')} disabled={loading} style={styles.oauthBtnFacebook}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M15.12 8.5h1.97V5.7c-.34-.05-1.5-.16-2.86-.16-2.83 0-4.77 1.73-4.77 4.9v2.2H6.4v3.1h3.06V22h3.66v-6.26h2.88l.46-3.1h-3.34v-1.9c0-.9.25-1.5 1.54-1.5z"
                      fill="#ffffff"
                    />
                  </Svg>
                  <Text style={styles.oauthFacebookText}>Continue with Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <View style={styles.form}>
                {mode === 'signup' && (
                  <View style={styles.field}>
                    <Text style={styles.label}>FULL NAME</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      placeholderTextColor={Colors.textLight}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.field}>
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
                  />
                </View>

                <View style={styles.field}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.label}>PASSWORD</Text>
                    {mode === 'login' && (
                      <TouchableOpacity>
                        <Text style={styles.forgot}>Forgot?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry
                  />
                </View>

                <LinearGradient
                  colors={loading ? [Colors.primaryLight, Colors.primaryLight] : [Colors.primaryDark, Colors.primary]}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitTouchable}>
                    {loading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.submitText}>{mode === 'login' ? 'Log In' : 'Create Account'}</Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {mode === 'signup' && (
                <Text style={styles.terms}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { padding: 28, paddingTop: 20, alignItems: 'center' },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headline: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 6, letterSpacing: -0.5 },
  subheadline: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  toggleText: { fontSize: 14, color: Colors.textMuted },
  toggleTextActive: { fontWeight: '600', color: Colors.text },
  oauthGroup: { gap: 12, marginBottom: 20 },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  oauthText: { fontSize: 15, fontWeight: '500', color: Colors.text },
  oauthBtnFacebook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1877F2',
  },
  oauthFacebookText: { fontSize: 15, fontWeight: '500', color: Colors.white },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textLight },
  form: { gap: 14 },
  field: {},
  label: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, letterSpacing: 1 },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    fontSize: 15,
    color: Colors.text,
  },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgot: { fontSize: 12, color: Colors.primary },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitTouchable: { paddingVertical: 17, alignItems: 'center' },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  terms: { textAlign: 'center', fontSize: 12, color: Colors.textLight, marginTop: 16, lineHeight: 20 },
  termsLink: { color: Colors.primary },
});
