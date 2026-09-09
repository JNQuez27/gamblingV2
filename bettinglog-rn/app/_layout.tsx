import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppProvider from '@/providers/app-provider';
import { DialogProvider } from '@/components/ui/DialogProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <DialogProvider>
      <StatusBar style="dark" />
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
      </DialogProvider>
    </AppProvider>
  );
}
