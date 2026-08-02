import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppProvider from '@/providers/app-provider';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="visit-logs" options={{ presentation: 'card' }} />
        <Stack.Screen name="weekly-checkin" options={{ presentation: 'card' }} />
        <Stack.Screen name="assessment" options={{ presentation: 'card' }} />
        <Stack.Screen name="consultation" options={{ presentation: 'card' }} />
      </Stack>
    </AppProvider>
  );
}
