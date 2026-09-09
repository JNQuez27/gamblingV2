// The Kessler Psychological Distress Scale (K10) - the standardized, validated
// instrument named in the research paper (Kessler et al., 2002, Psychological
// Medicine 32(6):959-976). Adopted as-is: 10 items, each on the standard 1-5
// frequency scale, total 10-50. Do NOT reword the items - the paper relies on
// the instrument being used without re-validation.
//
// This is the app's recurring distress check-in (saved to the `weekly_checkins`
// table, keyed by the item `key`s below). Administered at baseline and again at
// follow-up; the summary score drives the alert logic at the bottom.

export interface K10Item {
  key: string;
  prompt: string;
}

// Standard K10 stem: "In the past 4 weeks, about how often did you feel…"
export const K10_ITEMS: K10Item[] = [
  { key: 'k10_1', prompt: 'tired out for no good reason?' },
  { key: 'k10_2', prompt: 'nervous?' },
  { key: 'k10_3', prompt: 'so nervous that nothing could calm you down?' },
  { key: 'k10_4', prompt: 'hopeless?' },
  { key: 'k10_5', prompt: 'restless or fidgety?' },
  { key: 'k10_6', prompt: 'so restless you could not sit still?' },
  { key: 'k10_7', prompt: 'depressed?' },
  { key: 'k10_8', prompt: 'that everything was an effort?' },
  { key: 'k10_9', prompt: 'so sad that nothing could cheer you up?' },
  { key: 'k10_10', prompt: 'worthless?' },
];

// The standard K10 stem shown once above the items.
export const K10_STEM = 'In the past 4 weeks, about how often did you feel…';

// Standard K10 response scale (1-5, so the total runs 10-50, never 0).
export const K10_SCALE = [
  { value: 1, label: 'None of the time' },
  { value: 2, label: 'A little of the time' },
  { value: 3, label: 'Some of the time' },
  { value: 4, label: 'Most of the time' },
  { value: 5, label: 'All of the time' },
];

export const K10_MIN = 10;
export const K10_MAX = 50;

export type K10Band = 'well' | 'mild' | 'moderate' | 'severe';

// Standard K10 severity bands over the 10-50 total (Andrews & Slade, 2001).
// 'severe' triggers the alarm notification and a consultation prompt.
export function k10Band(totalScore: number): K10Band {
  if (totalScore >= 30) return 'severe';
  if (totalScore >= 25) return 'moderate';
  if (totalScore >= 20) return 'mild';
  return 'well';
}

export function k10BandMessage(band: K10Band): string {
  switch (band) {
    case 'well':
      return 'Likely well - little or no psychological distress this period. Keep the routine that is working.';
    case 'mild':
      return 'Mild distress this period. Worth reading your diary and watching the triggers.';
    case 'moderate':
      return 'Moderate distress. Be gentle with yourself - consider talking it through with someone you trust.';
    case 'severe':
      return 'This points to severe distress. Please consider a consultation - talking it through helps.';
  }
}
