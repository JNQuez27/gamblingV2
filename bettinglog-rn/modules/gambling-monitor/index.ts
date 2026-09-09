import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';

// Events emitted by the native monitor:
//   GamblingAppDetected — app foregrounded (Mechanism 2, UsageStatsManager)
//   GamblingSiteDetected — gambling DNS lookup (Mechanism 3, local VPN)
export type GamblingMonitorEvents = {
  GamblingAppDetected(event: { package?: string; name?: string }): void;
  GamblingSiteDetected(event: { url: string }): void;
};

declare class GamblingMonitorModule extends NativeModule<GamblingMonitorEvents> {
  // ── App-open monitor (Mechanism 2) ──
  // Persists the gambling package list the foreground service watches.
  // Call before startMonitoring(); survives service restarts.
  setWatchlist(packages: string[]): void;
  // Starts the foreground service (no-op until Usage Access is granted).
  startMonitoring(): void;
  // Stops the service and clears its persistent notification.
  stopMonitoring(): void;
  // The installed app's launcher icon as a PNG data-URI (on-device, no network),
  // or null if the package isn't installed/visible.
  getAppIcon(pkg: string): string | null;
  // Opens Settings → Usage Access if needed; resolves to whether access is
  // granted once the user returns to the app.
  requestPermissions(): Promise<boolean>;

  // ── Website shield (Mechanism 3 — local DNS VPN) ──
  // Persists the gambling domain list + block/detect mode the VPN inspects.
  setBlocklist(domains: string[], block: boolean): void;
  // Shows the system VPN consent dialog if needed; resolves to whether VPN
  // consent is granted. Distinct from Usage Access — the VPN is intrusive.
  requestVpnConsent(): Promise<boolean>;
  // Starts the DNS-inspecting VPN in block/detect mode. Returns false if VPN
  // consent isn't granted yet (call requestVpnConsent first).
  startWebsiteShield(block: boolean): boolean;
  // Stops the VPN and clears its persistent notification + the VPN key icon.
  stopWebsiteShield(): void;
}

// null when the native module isn't compiled in (web, or a JS-only run) —
// the detection pipeline then runs in foreground-assist mode.
export default requireOptionalNativeModule<GamblingMonitorModule>('GamblingMonitor');
