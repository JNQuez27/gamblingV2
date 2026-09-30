import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import AppProvider, { useAppContext } from '@/providers/app-provider';
import { DialogProvider } from '@/components/ui/DialogProvider';
import OfflineBanner from '@/components/ui/OfflineBanner';

function AppScaffold() {
  const { isOffline } = useAppContext();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isOffline ? 'light' : 'dark'} />
      {/* Offline banner sits above the screens and takes the status-bar area. */}
      <OfflineBanner />
      {/* While the banner is shown it owns the top inset, so tell the screens
          below their top inset is 0 - they push down instead of being covered. */}
      <SafeAreaInsetsContext.Provider
        value={{ top: isOffline ? 0 : insets.top, bottom: insets.bottom, left: insets.left, right: insets.right }}
      >
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
      </SafeAreaInsetsContext.Provider>
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
