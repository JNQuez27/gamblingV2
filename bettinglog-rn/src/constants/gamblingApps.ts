// Preset gambling apps/sites common in the Philippines.
// Used to pre-fill the onboarding multi-select, to help classify
// self-reported free-text entries, and - via `androidPackage` / `domains` - to
// recognise a detected app or visited site once the native background monitor
// reports one (see src/services/gamblingDetection.service.ts). The list is not
// exhaustive - users can always add a custom name.

export type GamblingCategory =
  | 'casino'
  | 'sports'
  | 'e-sabong'
  | 'lottery'
  | 'poker'
  | 'other';

export interface GamblingAppPreset {
  name: string;
  category: GamblingCategory;
  // Best-effort detection identifiers, matched against what the native
  // background monitor reports. Update these as the real identifiers are
  // verified - detection degrades gracefully when they are wrong or missing.
  androidPackage?: string; // e.g. 'com.bingoplus.app' (matched against the reported foreground package)
  // Domains used to recognise the site when the background monitor reports a
  // visited URL (see src/services/gamblingDetection.service.ts). Substring
  // match, so keep them to the bare host (no scheme, no path).
  domains?: string[];
}

export const GAMBLING_APP_PRESETS: GamblingAppPreset[] = [
  { name: 'BingoPlus', category: 'casino', androidPackage: 'com.bingoplus.app', domains: ['bingoplus.com', 'bingoplus.ph'] },
  { name: 'ArenaPlus', category: 'sports', androidPackage: 'com.arenaplus.app', domains: ['arenaplus.ph', 'arenaplus.com'] },
  { name: 'PhilWin', category: 'casino', domains: ['philwin.com', 'philwin.ph'] },
  { name: 'Okada Manila Online', category: 'casino', domains: ['okadamanila.com'] },
  { name: 'MWPlay888', category: 'casino', domains: ['mwplay888.com', 'mwplay888.net'] },
  { name: 'PIGO / e-Sabong', category: 'e-sabong', domains: ['pitmasterlive', 'sw888', 'esabong'] },
  { name: 'PCSO / Lotto', category: 'lottery', domains: ['pcso.gov.ph'] },
  { name: 'Sports Betting', category: 'sports' },
  { name: 'Online Poker', category: 'poker' },
];

// Well-known international gambling domains, in addition to the PH presets
// above. Kept as bare hosts for substring matching against a reported URL.
export const GAMBLING_WEBSITE_DOMAINS: string[] = [
  'bet365.com',
  'stake.com',
  '1xbet.com',
  'pokerstars.com',
  '888casino.com',
  'betway.com',
  'melbet.com',
  'dafabet.com',
  'w88',
  'bk8',
  'me88',
  'sbobet.com',
  'pinnacle.com',
];

export const GAMBLING_CATEGORIES: GamblingCategory[] = [
  'casino',
  'sports',
  'e-sabong',
  'lottery',
  'poker',
  'other',
];
