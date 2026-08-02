// The recurring weekly questionnaire. Five short items scored 0–3 each
// (total 0–15), adapted from the PGSI's core loss-of-control constructs plus
// one mood item that ties gambling behavior to mental health. Saved to the
// `weekly_checkins` table; the summary score drives the alert logic below.

export interface WeeklyCheckinItem {
  key: string;
  prompt: string;
}

export const WEEKLY_CHECKIN_ITEMS: WeeklyCheckinItem[] = [
  { key: 'bet_more', prompt: 'This week, did you bet more than you could really afford to lose?' },
  { key: 'chased', prompt: 'Did you go back another day to try to win back money you lost?' },
  { key: 'urges', prompt: 'How often did you feel a strong urge to gamble?' },
  { key: 'mood', prompt: 'Did gambling (or the urge to) cause you stress, guilt, or anxiety?' },
  { key: 'hidden', prompt: 'Did you hide or downplay your gambling from people close to you?' },
];

// Shared 0–3 response scale (same anchors as the PGSI).
export const WEEKLY_CHECKIN_SCALE = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Sometimes' },
  { value: 2, label: 'Most of the time' },
  { value: 3, label: 'Almost always' },
];

export type WeeklyBand = 'steady' | 'elevated' | 'high';

// Bands over the 0–15 total. 'high' triggers the alarm notification and a
// suggestion to open a consultation.
export function weeklyBand(totalScore: number): WeeklyBand {
  if (totalScore >= 8) return 'high';
  if (totalScore >= 3) return 'elevated';
  return 'steady';
}

export function weeklyBandMessage(band: WeeklyBand): string {
  switch (band) {
    case 'steady':
      return 'Steady week. Whatever you are doing is working - keep the routine.';
    case 'elevated':
      return 'Some warning signs this week. Worth reading your diary and watching the triggers.';
    case 'high':
      return 'This was a hard week. Please consider a consultation - talking it through helps.';
  }
}
