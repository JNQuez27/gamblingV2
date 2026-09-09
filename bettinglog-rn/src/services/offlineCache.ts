import AsyncStorage from '@react-native-async-storage/async-storage';

// Last-known app state, persisted per user so the app is fully viewable offline.
// We cache the DERIVED display snapshot (exactly what the provider sets into
// state), so hydrating is a plain setState with no network and no re-derivation.
const PREFIX = 'app-snapshot:v1:';

export async function saveSnapshot(userId: string, snapshot: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + userId, JSON.stringify(snapshot));
  } catch {
    // Storage full/unavailable - caching is best-effort; the app still works online.
  }
}

export async function loadSnapshot<T>(userId: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + userId);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function clearSnapshot(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + userId);
  } catch {
    // ignore
  }
}
