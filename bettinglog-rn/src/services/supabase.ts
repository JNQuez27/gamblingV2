import 'react-native-url-polyfill/auto';
import { Platform, AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Where Supabase keeps the auth session.
//
// On Android (the production target) tokens live in the device's encrypted
// SecureStore. SecureStore is native-only, so for the browser dev-preview
// (`npm run dev`) we fall back to localStorage - enough to click through the
// UI without crashing. Production is always Android.
//
// IMPORTANT: SecureStore rejects values larger than 2048 bytes on Android. A
// Supabase session (access-token JWT + refresh token + user object with
// user_metadata) easily exceeds that, so a plain setItemAsync fails silently
// and the session is never saved - which is why the app used to demand a fresh
// login on every launch. The adapter below transparently splits large values
// into <2048-byte chunks (key.0, key.1, ...) with a small header under the main
// key, and reassembles them on read.
const CHUNK_SIZE = 1800; // headroom under SecureStore's 2048-byte limit
const CHUNK_HEADER = '__sbchunks__:'; // marks a chunked value in the main key

const nativeAdapter = {
  getItem: async (key: string) => {
    const head = await SecureStore.getItemAsync(key);
    if (head == null) return null;
    // Legacy / small values were stored raw - return them untouched.
    if (!head.startsWith(CHUNK_HEADER)) return head;

    const count = parseInt(head.slice(CHUNK_HEADER.length), 10);
    if (!Number.isFinite(count) || count <= 0) return null;

    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null; // corrupt/partial write - treat as no session
      parts.push(part);
    }
    return parts.join('');
  },

  setItem: async (key: string, value: string) => {
    // Remove any chunks left over from a previous, larger value.
    const prevHead = await SecureStore.getItemAsync(key);
    if (prevHead?.startsWith(CHUNK_HEADER)) {
      const prevCount = parseInt(prevHead.slice(CHUNK_HEADER.length), 10) || 0;
      for (let i = 0; i < prevCount; i++) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
    }
    await SecureStore.setItemAsync(key, `${CHUNK_HEADER}${chunks.length}`);
  },

  removeItem: async (key: string) => {
    const head = await SecureStore.getItemAsync(key);
    if (head?.startsWith(CHUNK_HEADER)) {
      const count = parseInt(head.slice(CHUNK_HEADER.length), 10) || 0;
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }
    await SecureStore.deleteItemAsync(key);
  },
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
    detectSessionInUrl: false, // we handle the deep-link redirect ourselves
    flowType: 'pkce', // OAuth + password reset both use the code flow on native
  },
});

// React Native gotcha: autoRefreshToken only runs while we explicitly keep it
// running. Tie it to app foreground/background so the ~1h access token gets
// refreshed in time - without this, calls after the app sits idle fail with
// "JWT expired". (Supabase RN docs.)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
  supabase.auth.startAutoRefresh(); // kick it off for the current foreground session
}
