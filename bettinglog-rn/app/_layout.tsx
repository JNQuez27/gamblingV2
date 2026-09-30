import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import AppProvider, { useAppContext } from '@/providers/app-provider';
import { DialogProvider } from '@/components/ui/DialogProvider';
import OfflineBanner from '@/components/ui/OfflineBanner';

function AppNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="visit-logs" options={{ presentation: 'card' }} />
      <Stack.Screen name="weekly-checkin" options={{ presentation: 'card' }} />
      <Stack.Screen name="assessment" options={{ presentation: 'card' }} />
      <Stack.Screen name="consultation" options={{ presentation: 'card' }} />
    </Stack>
  );
}

function AppScaffold() {
  const { isOffline } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isOffline ? 'light' : 'dark'} />
      {/* Offline banner takes the status-bar area at the very top. */}
      <OfflineBanner />
      {/* The screens live in their OWN SafeAreaProvider so they re-measure the
          top inset from where they actually sit: below the banner (inset 0) when
          offline, or at the very top (normal inset) when online. This avoids the
          double-inset gap that a shared provider produced with native
          <SafeAreaView> screens. */}
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppNav />
        </SafeAreaProvider>
      </View>
    </View>
  );
}

export default function RootLayout() {
  // Brand wordmark font (BettingLog logo). Render regardless; the logo falls
  // back to the system font for the one frame before it loads.
  useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold });

  return (
    <SafeAreaProvider>
      <AppProvider>
        <DialogProvider>
          <AppScaffold />
        </DialogProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
