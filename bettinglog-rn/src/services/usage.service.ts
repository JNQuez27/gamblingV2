import { supabase } from './supabase';
import type { GamblingUsageLog } from '../types/usage';

function fromRow(row: any): GamblingUsageLog {
  return {
    id: row.id,
    appName: row.app_name,
    category: row.category ?? undefined,
    openCount: row.open_count,
    timeSpent: row.time_spent,
    loggedDate: row.logged_date,
    createdAt: row.created_at,
  };
}

export async function getUsageLogs(): Promise<GamblingUsageLog[]> {
  const { data, error } = await supabase
    .from('gambling_usage_logs')
    .select('*')
    .order('logged_date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

// Record one "I opened a gambling app" event for today.
export async function logGamblingOpen(
  userId: string,
  appName: string,
  date: string,
  timeSpent = 0,
): Promise<void> {
  const { error } = await supabase.from('gambling_usage_logs').insert({
    user_id: userId,
    app_name: appName,
    open_count: 1,
    time_spent: timeSpent,
    logged_date: date,
  });
  if (error) throw error;
}
