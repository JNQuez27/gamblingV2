import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GamblingMonitor from '../../modules/gambling-monitor';
import {
  GAMBLING_APP_PRESETS,
  GAMBLING_WEBSITE_DOMAINS,
} from '@/constants/gamblingApps';
export type ShieldMode = 'detect' | 'block';
import { sendImmediateAlert } from '@/services/notification.service';
import { logGamblingOpen } from '@/services/usage.service';
import { buildGamblingNudge } from '@/utils/nudgeEngine';
import { todayKey } from '@/utils/date';
import type { SpendingSummary } from '@/types/spending';

// ─────────────────────────────────────────────────────────────────────────────
// Background gambling-detection pipeline.
//
// IMPORTANT - what actually runs where:
//   The continuous "watch which app/website the user opens" part CANNOT be done
//   from JavaScript. It is done by the native `GamblingMonitor` Expo module
//   (modules/gambling-monitor): an Android foreground service polling
//   UsageStatsManager, which emits two events:
//       'GamblingAppDetected'  { package?: string; name?: string }
//       'GamblingSiteDetected' { url: string }   (Mechanism 3, not built yet)
//   See docs/BACKGROUND_DETECTION.md for the exact native contract & permissions.
//
//   This file is the JS half: the app/site catalog and matchers, the throttled
//   + quiet-hours-aware nudge, and the logging that keeps the reality
//   smart-math accurate. The native service is only started when the user has
//   consented AND enabled monitoring (MonitorPrefs) AND Usage Access is
//   granted. When the module is absent (Expo Go / web / no dev build) the
//   pipeline still works when fed by `reportGamblingOpen` (used by the in-app
//   "test nudge" button), and we log that background coverage is off.
// ─────────────────────────────────────────────────────────────────────────────

export interface DetectionMatch {
  name: string;
  category?: string;
  source: 'app' | 'website';
}

export interface MonitoringContext {
  userId: string | null;
  getSpendingSummary?: () => SpendingSummary | null;
  getStreak?: () => number;
  onDetected?: (match: DetectionMatch) => void;
}

// ── Consent + enabled prefs (on-device only) ─────────────────────
const PREFS_KEY = 'gambling-monitor-prefs';

export interface MonitorPrefs {
  // App-open monitoring (Mechanism 2 - Usage Access).
  consentGranted: boolean; // the user explicitly agreed to background monitoring
  enabled: boolean;        // monitoring is currently switched on
  // Website shield (Mechanism 3 - local VPN). Consent is SEPARATE and explicit
  // because a VPN is more intrusive than Usage Access.
  siteConsentGranted: boolean; // the user approved the local-VPN website shield
  siteEnabled: boolean;        // the shield is currently switched on
  blockMode: boolean;          // true = block matching sites, false = detect only
}
const DEFAULT_PREFS: MonitorPrefs = {
  consentGranted: false,
  enabled: false,
  siteConsentGranted: false,
  siteEnabled: false,
  blockMode: false,
};

export async function getMonitorPrefs(): Promise<MonitorPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

async function savePrefs(prefs: MonitorPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable (rare) - prefs simply won't persist across launches.
  }
}

export async function setConsentGranted(value: boolean): Promise<void> {
  await savePrefs({ ...(await getMonitorPrefs()), consentGranted: value });
}

export async function setMonitoringEnabled(value: boolean): Promise<void> {
  await savePrefs({ ...(await getMonitorPrefs()), enabled: value });
}

export async function setSiteConsentGranted(value: boolean): Promise<void> {
  await savePrefs({ ...(await getMonitorPrefs()), siteConsentGranted: value });
}

export async function setSiteEnabled(value: boolean): Promise<void> {
  await savePrefs({ ...(await getMonitorPrefs()), siteEnabled: value });
}

export async function setBlockMode(value: boolean): Promise<void> {
  await savePrefs({ ...(await getMonitorPrefs()), blockMode: value });
}

// ── Catalog matching ─────────────────────────────────────────────
export function matchGamblingUrl(url: string): DetectionMatch | null {
  const u = url.toLowerCase();
  for (const preset of GAMBLING_APP_PRESETS) {
    for (const domain of preset.domains ?? []) {
      if (u.includes(domain)) return { name: preset.name, category: preset.category, source: 'website' };
    }
  }
  for (const domain of GAMBLING_WEBSITE_DOMAINS) {
    if (u.includes(domain)) return { name: domain, source: 'website' };
  }
  return null;
}

export function matchGamblingPackage(pkg: string): DetectionMatch | null {
  const p = pkg.toLowerCase();
  const found = GAMBLING_APP_PRESETS.find(
    (x) => x.androidPackage && p === x.androidPackage.toLowerCase(),
  );
  return found ? { name: found.name, category: found.category, source: 'app' } : null;
}

// ── Native-module seam ───────────────────────────────────────────
// The GamblingMonitor Expo module (modules/gambling-monitor). null when not
// compiled in - requireOptionalNativeModule handles that, mirroring AppDetector.
const NativeMonitor = GamblingMonitor;

export function isNativeMonitorAvailable(): boolean {
  return !!NativeMonitor && Platform.OS === 'android';
}

// Every catalog entry with a known Android package - what the service watches.
function watchlistPackages(): string[] {
  return GAMBLING_APP_PRESETS
    .map((p) => p.androidPackage)
    .filter((pkg): pkg is string => Boolean(pkg));
}

// Every gambling domain the VPN shield inspects DNS lookups against: preset
// domains plus the well-known international list. Deduped, lowercased.
function blocklistDomains(): string[] {
  const all = [
    ...GAMBLING_APP_PRESETS.flatMap((p) => p.domains ?? []),
    ...GAMBLING_WEBSITE_DOMAINS,
  ].map((d) => d.toLowerCase());
  return [...new Set(all)];
}

// ── Throttling (so it is never annoying) ─────────────────────────
const NUDGE_COOLDOWN_MS = 45 * 60 * 1000; // at most one nudge per 45 minutes
const MAX_NUDGES_PER_DAY = 6;

let lastNudgeAt = 0;
let nudgesToday = 0;
let nudgeDayKey = '';

function canNudgeNow(): boolean {
  const today = todayKey();
  if (nudgeDayKey !== today) {
    nudgeDayKey = today;
    nudgesToday = 0;
  }
  if (nudgesToday >= MAX_NUDGES_PER_DAY) return false;
  return Date.now() - lastNudgeAt >= NUDGE_COOLDOWN_MS;
}

// ── Runtime state ────────────────────────────────────────────────
let ctx: MonitoringContext | null = null;
let nativeSub: { remove: () => void } | null = null;

// Core reaction to a detected gambling app/site.
export async function handleDetection(match: DetectionMatch): Promise<void> {
  // Always log the open - even when the nudge is throttled - so the smart-math
  // and usage bands stay accurate.
  if (ctx?.userId) {
    try {
      await logGamblingOpen(ctx.userId, match.name, todayKey());
    } catch {
      // offline / RLS - the nudge below still helps in the moment.
    }
  }
  ctx?.onDetected?.(match);

  if (!canNudgeNow()) return;

  const nudge = buildGamblingNudge({
    appName: match.name,
    source: match.source,
    spendingSummary: ctx?.getSpendingSummary?.() ?? null,
    streak: ctx?.getStreak?.() ?? 0,
  });

  // sendImmediateAlert already respects notification permission and is a no-op
  // on web. Quiet-hours are honoured by passing prefs when available.
  const sent = await sendImmediateAlert(nudge.title, nudge.body);
  if (sent) {
    lastNudgeAt = Date.now();
    nudgesToday += 1;
  }
}

// Public seam: the native module (or the in-app test button) reports an open.
export async function reportGamblingOpen(
  nameOrUrl: string,
  source: 'app' | 'website' = 'app',
): Promise<void> {
  const match =
    source === 'website'
      ? matchGamblingUrl(nameOrUrl) ?? { name: nameOrUrl, source }
      : { name: nameOrUrl, source };
  await handleDetection(match);
}

// Subscribe to the native events (idempotent - cheap and safe to call early).
function attachNativeListeners(): void {
  if (!NativeMonitor || nativeSub) return;
  const appListener = NativeMonitor.addListener(
    'GamblingAppDetected',
    (e: { package?: string; name?: string }) => {
      const m = e.package
        ? matchGamblingPackage(e.package)
        : e.name
          ? { name: e.name, source: 'app' as const }
          : null;
      if (m) handleDetection(m);
    },
  );
  const siteListener = NativeMonitor.addListener(
    'GamblingSiteDetected',
    (e: { url?: string }) => {
      const m = e.url ? matchGamblingUrl(e.url) : null;
      if (m) handleDetection(m);
    },
  );
  nativeSub = {
    remove: () => {
      appListener.remove();
      siteListener.remove();
    },
  };
}

// Start the native foreground service (watchlist first, so a service restart
// still knows what to watch). No-ops natively until Usage Access is granted.
function startNativeService(): void {
  if (!NativeMonitor) return;
  try {
    attachNativeListeners();
    NativeMonitor.setWatchlist(watchlistPackages());
    NativeMonitor.startMonitoring();
  } catch (err) {
    console.warn('[gamblingDetection] native monitor failed to start:', err);
  }
}

// Start the website-shield VPN (blocklist first). No-ops natively until VPN
// consent is granted. Returns whether the native start reported success.
function startShieldService(block: boolean): boolean {
  if (!NativeMonitor) return false;
  try {
    attachNativeListeners();
    NativeMonitor.setBlocklist(blocklistDomains(), block);
    return NativeMonitor.startWebsiteShield(block);
  } catch (err) {
    console.warn('[gamblingDetection] website shield failed to start:', err);
    return false;
  }
}

export async function startMonitoring(context: MonitoringContext): Promise<void> {
  ctx = context;

  if (!isNativeMonitorAvailable()) {
    // No native module: continuous background detection is not possible from JS.
    // The pipeline stays ready for reportGamblingOpen() (e.g. the test button).
    console.info(
      '[gamblingDetection] Native background monitor unavailable on this build - ' +
        'running in foreground-assist mode. See docs/BACKGROUND_DETECTION.md.',
    );
    return;
  }

  attachNativeListeners();

  // Consent gate: each mechanism only runs when the user explicitly enabled it.
  const prefs = await getMonitorPrefs();
  if (prefs.consentGranted && prefs.enabled) startNativeService();
  if (prefs.siteConsentGranted && prefs.siteEnabled) startShieldService(prefs.blockMode);
}

export function stopMonitoring(): void {
  if (isNativeMonitorAvailable()) {
    try {
      NativeMonitor!.stopMonitoring();
    } catch {
      // ignore - already stopped or module gone
    }
    try {
      NativeMonitor!.stopWebsiteShield();
    } catch {
      // ignore - already stopped or module gone
    }
  }
  nativeSub?.remove();
  nativeSub = null;
  ctx = null;
}

// Ask the native layer for the OS-level permissions it needs (Usage Access on
// Android). Returns false when there is no native module to grant them - the
// JS layer can't request these itself.
export async function requestBackgroundPermissions(): Promise<boolean> {
  if (isNativeMonitorAvailable()) {
    try {
      return await NativeMonitor!.requestPermissions();
    } catch {
      return false;
    }
  }
  return false;
}

// ── Settings-toggle API ──────────────────────────────────────────

// Turn background monitoring ON: request Usage Access (deep-links to the
// system settings screen), then record consent and start the service.
// Returns whether monitoring is actually running afterwards.
export async function enableBackgroundMonitoring(): Promise<boolean> {
  if (!isNativeMonitorAvailable()) return false;
  const granted = await requestBackgroundPermissions();
  if (!granted) return false;
  await setConsentGranted(true);
  await setMonitoringEnabled(true);
  startNativeService();
  return true;
}

// Turn background monitoring OFF: stop the service (clears its persistent
// notification) and remember the choice. Consent is kept - re-enabling later
// only re-asks for the OS permission if it was revoked.
export async function disableBackgroundMonitoring(): Promise<void> {
  await setMonitoringEnabled(false);
  if (isNativeMonitorAvailable()) {
    try {
      NativeMonitor!.stopMonitoring();
    } catch {
      // already stopped
    }
  }
}

// ── Website shield (Mechanism 3) toggle API ──────────────────────

// Turn the website shield ON: request VPN consent (its OWN system dialog,
// separate from Usage Access), then record consent and start the local DNS
// VPN in the chosen mode. Returns whether the shield is actually running.
export async function enableWebsiteShield(mode: ShieldMode): Promise<boolean> {
  if (!isNativeMonitorAvailable()) return false;
  let granted = false;
  try {
    granted = await NativeMonitor!.requestVpnConsent();
  } catch {
    granted = false;
  }
  if (!granted) return false;
  const block = mode === 'block';
  await setSiteConsentGranted(true);
  await setSiteEnabled(true);
  await setBlockMode(block);
  return startShieldService(block);
}

// Turn the website shield OFF: stop the VPN (clears the notification and the
// system VPN key icon) and remember the choice. Consent is kept.
export async function disableWebsiteShield(): Promise<void> {
  await setSiteEnabled(false);
  if (isNativeMonitorAvailable()) {
    try {
      NativeMonitor!.stopWebsiteShield();
    } catch {
      // already stopped
    }
  }
}
