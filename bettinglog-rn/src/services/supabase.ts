import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Where Supabase keeps the auth session.
//
// On Android (the production target) tokens live in the device's encrypted
// SecureStore. SecureStore is native-only, so for the browser dev-preview
// (`npm run dev`) we fall back to localStorage — enough to click through the
// UI without crashing. Production is always Android.
const nativeAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const webAdapter = {
  getItem: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
  removeItem: async (key: string) => globalThis.localStorage?.removeItem(key),
};

const storageAdapter = Platform.OS === 'web' ? webAdapter : nativeAdapter;

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly in dev instead of silently talking to "undefined".
  console.warn('Supabase env vars are missing. Copy .env.example to .env.local.');
}

// The ONE Supabase client. Everything else imports services, never this file
// directly (see README §9).
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // no web redirect flow on Android
  },
});
