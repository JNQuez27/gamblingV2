export type SpendingPeriod = 'weekly' | 'monthly';

export interface SpendingLimit {
  limitAmount: number;
  period: SpendingPeriod;
  currency: string;   // 'PHP'
}

export interface SpendingLog {
  id: string;
  amount: number;
  note: string | null;
  loggedAt: string;   // ISO timestamp
}

// Derived by src/utils/spendingEngine.ts — never stored.
export interface SpendingSummary {
  limit: number;
  current: number;
  remaining: number;
  percentUsed: number;   // 0–100+
  isCritical: boolean;   // >= 80%
  isOverLimit: boolean;  // > 100%
  currency: string;
}
