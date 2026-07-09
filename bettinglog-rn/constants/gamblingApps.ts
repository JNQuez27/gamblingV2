// Preset gambling apps/sites common in the Philippines.
// Used to pre-fill the onboarding multi-select and to help classify
// self-reported free-text entries. The list is not exhaustive — users
// can always add a custom name.

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
}

export const GAMBLING_APP_PRESETS: GamblingAppPreset[] = [
  { name: 'BingoPlus', category: 'casino' },
  { name: 'ArenaPlus', category: 'sports' },
  { name: 'PhilWin', category: 'casino' },
  { name: 'Okada Manila Online', category: 'casino' },
  { name: 'MWPlay888', category: 'casino' },
  { name: 'PIGO / e-Sabong', category: 'e-sabong' },
  { name: 'PCSO / Lotto', category: 'lottery' },
  { name: 'Sports Betting', category: 'sports' },
  { name: 'Online Poker', category: 'poker' },
];

export const GAMBLING_CATEGORIES: GamblingCategory[] = [
  'casino',
  'sports',
  'e-sabong',
  'lottery',
  'poker',
  'other',
];
