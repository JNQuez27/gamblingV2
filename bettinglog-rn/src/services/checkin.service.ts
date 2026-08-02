import { supabase } from '@/services/supabase';
import { weekStartKey } from '@/utils/date';

// Weekly check-in persistence (weekly_checkins table). "Due" is computed from
// the current date: one check-in per Monday-based week.

export interface WeeklyCheckin {
  id: string;
  weekStart: string;              // "YYYY-MM-DD" (Monday)
  responses: Record<string, number>;
  summaryScore: number;
  createdAt: string;
}

function fromRow(row: any): WeeklyCheckin {
  return {
    id: row.id,
    weekStart: row.week_start,
    responses: row.responses ?? {},
    summaryScore: row.summary_score ?? 0,
    createdAt: row.created_at,
  };
}

export async function getWeeklyCheckins(): Promise<WeeklyCheckin[]> {
  const { data, error } = await supabase
    .from('weekly_checkins')
    .select('*')
    .order('week_start', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function submitWeeklyCheckin(
  userId: string,
  responses: Record<string, number>,
  summaryScore: number,
): Promise<void> {
  const { error } = await supabase.from('weekly_checkins').insert({
    user_id: userId,
    week_start: weekStartKey(),
    responses,
    summary_score: summaryScore,
  });
  if (error) throw error;
}

// True when no check-in exists for the week containing "now".
export async function isCheckinDue(): Promise<boolean> {
  const { data, error } = await supabase
    .from('weekly_checkins')
    .select('id')
    .eq('week_start', weekStartKey())
    .maybeSingle();
  if (error) throw error;
  return !data;
}
