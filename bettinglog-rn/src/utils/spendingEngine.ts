import type { SpendingLog, SpendingSummary } from '@/types/spending';
import { todayKey, weekStartKey, daysBetween } from '@/utils/date';

// Pure spending math. Give it a limit and the logs, get back a summary the UI
// and the notification math-engine can both use. No Supabase, no side effects.

const CRITICAL_AT = 0.8; // warn once the user has used 80% of their limit

export function sumSpend(logs: SpendingLog[]): number {
  return logs.reduce((total, log) => total + log.amount, 0);
}

// ₱ spent per day of the current Monday-based week: 7 entries, Mon..Sun.
// Days with no logs stay 0 - the UI renders those as bet-free.
export function weeklySpendByDay(logs: SpendingLog[], now: Date = new Date()): number[] {
  const weekStart = weekStartKey(now);
  const bars = Array(7).fill(0);
  for (const log of logs) {
    const offset = daysBetween(weekStart, todayKey(new Date(log.loggedAt)));
    if (offset >= 0 && offset < 7) bars[offset] += log.amount;
  }
  return bars;
}

export function buildSpendingSummary(
  limit: number,
  logs: SpendingLog[],
  currency = 'PHP',
): SpendingSummary {
  const current = sumSpend(logs);
  const remaining = limit - current;
  const percentUsed = limit > 0 ? Math.round((current / limit) * 100) : 0;

  return {
    limit,
    current,
    remaining,
    percentUsed,
    isCritical: limit > 0 && current >= limit * CRITICAL_AT,
    isOverLimit: limit > 0 && current > limit,
    currency,
  };
}
