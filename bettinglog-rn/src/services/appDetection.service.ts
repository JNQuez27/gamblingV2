import AppDetector from '../../modules/app-detector';
import {
  GAMBLING_APP_PRESETS,
  type GamblingAppPreset,
} from '@/constants/gamblingApps';

// Reports which known gambling apps are installed on this device, via the
// AppDetector native module (Android PackageManager). Each preset's
// `androidPackage` must also be listed in the manifest <queries> block
// (plugins/withGamblingAppQueries.js) to be visible on Android 11+ - no
// QUERY_ALL_PACKAGES needed.
//
// When the native module is unavailable (web, or JS running without the dev
// build) every preset comes back 'unknown'; self-report stays the source of
// truth and a negative result never removes an app from the flow.

export type DetectionState = 'detected' | 'not-detected' | 'unknown';

export interface AppDetectionResult {
  preset: GamblingAppPreset;
  state: DetectionState;
}

export async function detectInstalledGamblingApps(): Promise<AppDetectionResult[]> {
  const unknowns = GAMBLING_APP_PRESETS.map((preset) => ({
    preset,
    state: 'unknown' as const,
  }));
  if (!AppDetector) return unknowns;

  const candidates = GAMBLING_APP_PRESETS
    .map((p) => p.androidPackage)
    .filter((pkg): pkg is string => Boolean(pkg));

  let installed: Set<string>;
  try {
    installed = new Set(AppDetector.getInstalledPackages(candidates));
  } catch {
    return unknowns;
  }

  return GAMBLING_APP_PRESETS.map((preset) => {
    if (!preset.androidPackage) return { preset, state: 'unknown' as const };
    return {
      preset,
      state: installed.has(preset.androidPackage)
        ? ('detected' as const)
        : ('not-detected' as const),
    };
  });
}

// Just the names confirmed present - used to pre-select onboarding chips.
export async function detectedAppNames(): Promise<string[]> {
  const results = await detectInstalledGamblingApps();
  return results.filter((r) => r.state === 'detected').map((r) => r.preset.name);
}
