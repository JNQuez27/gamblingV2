import { supabase } from './supabase';
import type { SpendingLimit, SpendingLog } from '../types/spending';

export async function getSpendingLimit(): Promise<SpendingLimit | null> {
  const { data, error } = await supabase
    .from('spending_limits')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { limitAmount: Number(data.limit_amount), period: data.period, currency: data.currency };
}

export async function setSpendingLimit(
  userId: string,
  limit: SpendingLimit,
): Promise<void> {
  const { error } = await supabase.from('spending_limits').upsert({
    user_id: userId,
    limit_amount: limit.limitAmount,
    period: limit.period,
    currency: limit.currency,
  });
  if (error) throw error;
}

export async function getSpendingLogs(): Promise<SpendingLog[]> {
  const { data, error } = await supabase
    .from('spending_logs')
    .select('*')
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    amount: Number(row.amount),
    note: row.note,
    loggedAt: row.logged_at,
  }));
}

export async function logSpend(
  userId: string,
  amount: number,
  note?: string,
): Promise<void> {
  const { error } = await supabase
    .from('spending_logs')
    .insert({ user_id: userId, amount, note: note ?? null });
  if (error) throw error;
}
