import { supabase } from '@/services/supabase';
import { daysBetween, todayKey } from '@/utils/date';

// Bet-free streak persistence (streaks table). All "today" logic runs against
// the current device time via todayKey().

export interface StreakState {
  currentCount: number;
  markedToday: boolean;
  lastMarkedAt: string | null; // ISO timestamp
}

function markedDateKey(lastMarkedAt: string | null): string | null {
  if (!lastMarkedAt) return null;
  return todayKey(new Date(lastMarkedAt));
}

export async function getStreak(): Promise<StreakState> {
  const { data, error } = await supabase.from('streaks').select('*').maybeSingle();
  if (error) throw error;
  if (!data) return { currentCount: 0, markedToday: false, lastMarkedAt: null };
  return {
    currentCount: data.current_count ?? 0,
    markedToday: markedDateKey(data.last_marked_at) === todayKey(),
    lastMarkedAt: data.last_marked_at,
  };
}

// Mark today's outcome. clean=true extends the streak (or restarts it after a
// gap); clean=false (a slip) resets it to 0. Idempotent within a day.
export async function markStreakDay(userId: string, clean: boolean): Promise<StreakState> {
  const existing = await getStreak();
  const today = todayKey();
  const lastKey = markedDateKey(existing.lastMarkedAt);

  let nextCount: number;
  if (!clean) {
    nextCount = 0;
  } else if (lastKey === today) {
    nextCount = Math.max(existing.currentCount, 1); // already marked today
  } else if (lastKey && daysBetween(lastKey, today) === 1) {
    nextCount = existing.currentCount + 1;          // consecutive day
  } else {
    nextCount = 1;                                  // first mark or gap → restart
  }

  const { error } = await supabase.from('streaks').upsert({
    user_id: userId,
    current_count: nextCount,
    marked_today: true,
    last_marked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  return { currentCount: nextCount, markedToday: true, lastMarkedAt: new Date().toISOString() };
}
