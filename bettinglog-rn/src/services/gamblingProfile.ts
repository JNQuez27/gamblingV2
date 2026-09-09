import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMBLING_APP_PRESETS, type GamblingCategory } from '@/constants/gamblingApps';

// The apps the user self-reported in onboarding. Stored locally (no schema
// change) and read by the Learn screen to focus its materials on the kind of
// gambling the user actually does.
const KEY = 'chosen_gambling_apps_v1';
export const OTHERS = 'Others';

export async function saveChosenApps(names: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(names));
  } catch {
    // Non-fatal: Learn just falls back to its default (random) rotation.
  }
}

export async function getChosenApps(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// The gambling categories the chosen apps fall under. "Others" maps to 'other'
// (which the Learn screen treats as "no specific focus -> random").
export function categoriesFor(names: string[]): GamblingCategory[] {
  const byName = new Map(GAMBLING_APP_PRESETS.map((p) => [p.name, p.category]));
  const cats = new Set<GamblingCategory>();
  for (const n of names) {
    if (n === OTHERS) cats.add('other');
    else {
      const c = byName.get(n);
      if (c) cats.add(c);
    }
  }
  return [...cats];
}
