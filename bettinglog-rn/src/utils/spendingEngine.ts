import type { SpendingLog, SpendingSummary } from '../types/spending';

// Pure spending math. Give it a limit and the logs, get back a summary the UI
// and the notification math-engine can both use. No Supabase, no side effects.

const CRITICAL_AT = 0.8; // warn once the user has used 80% of their limit

export function sumSpend(logs: SpendingLog[]): number {
  return logs.reduce((total, log) => total + log.amount, 0);
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
