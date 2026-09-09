import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { completeOAuthRedirect } from '@/services/auth.service';

// Handles the Google OAuth redirect (bettinglog:///auth?code=...). When the
// in-app auth session doesn't intercept the redirect, the OS delivers it here
// as a deep link; we finish the code exchange and route the user onward.
export default function AuthCallback() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { code, error, error_description } = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    (async () => {
      try {
        if (error || error_description) throw new Error(String(error_description || error));
        const { signedIn, isNewUser } = await completeOAuthRedirect(code ?? null);
        if (!signedIn) {
          router.replace('/login');
          return;
        }
        await refresh();
        router.replace(isNewUser ? '/onboarding/problem' : '/(tabs)/home');
      } catch {
        router.replace('/login');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
});
