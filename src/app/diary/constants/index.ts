import type { Mood } from '../types';

export const TOTAL_LEVELS = 30;

export const MOOD_MAP: Record<string, Mood> = {
  great: { emoji: '😄', label: 'Great', color: 'text-green-400' },
  good: { emoji: '🙂', label: 'Good', color: 'text-teal-400' },
  okay: { emoji: '😐', label: 'Okay', color: 'text-gray-400' },
  struggling: { emoji: '😔', label: 'Struggling', color: 'text-yellow-400' },
  tempted: { emoji: '😤', label: 'Tempted', color: 'text-orange-400' },
};
