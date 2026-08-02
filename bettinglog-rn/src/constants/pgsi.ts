import { SEED_IDS } from '@/constants/seedIds';

// The full 9-item PGSI (Problem Gambling Severity Index).
//
// Prompts and order mirror supabase/migrations/0002_seed.sql exactly (same
// pattern as gamblingApps.ts mirroring its seed rows) - item i here maps to
// SEED_IDS.pgsiItems[i] when saving assessment_responses.
export interface PGSIItem {
  id: string;
  prompt: string;
}

const PROMPTS = [
  'Have you bet more than you could really afford to lose?',
  'Have you needed to gamble with larger amounts of money to get the same feeling of excitement?',
  'When you gambled, did you go back another day to try to win back the money you lost?',
  'Have you borrowed money or sold anything to get money to gamble?',
  'Have you felt that you might have a problem with gambling?',
  'Has gambling caused you any health problems, including stress or anxiety?',
  'Have people criticized your betting or told you that you had a gambling problem, whether or not you thought it was true?',
  'Has your gambling caused any financial problems for you or your household?',
  'Have you felt guilty about the way you gamble or what happens when you gamble?',
];

export const PGSI_ITEMS: PGSIItem[] = PROMPTS.map((prompt, i) => ({
  id: SEED_IDS.pgsiItems[i],
  prompt,
}));

// Standard PGSI response scale, shared by all 9 items.
export const PGSI_SCALE = [
  { label: 'Never', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Most of the time', value: 2 },
  { label: 'Almost always', value: 3 },
];
