import { requireOptionalNativeModule } from 'expo-modules-core';

interface AppDetectorModule {
  // Returns the subset of `candidates` that are installed on this device.
  // Only packages listed in the manifest <queries> block are visible.
  getInstalledPackages(candidates: string[]): string[];
}

// null when the native module isn't compiled in (web, or a JS-only run) —
// callers must treat that as "unknown", never as "not installed".
export default requireOptionalNativeModule<AppDetectorModule>('AppDetector');
