import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';

// Launch gate. Waits for the persisted session to finish restoring, then routes:
// an already-signed-in user goes straight to the app, so closing and reopening
// no longer forces a fresh login. Only signed-out users see onboarding + login.
export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/home' : '/splash'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
});
