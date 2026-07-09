import { useAppContext } from '../providers/app-provider';

// Spending slice: the limit, current total, derived summary, and mutations.
export function useSpending() {
  const { spendingLimit, currentSpend, spendingSummary, updateSpendingLimit, logSpend } =
    useAppContext();
  return { spendingLimit, currentSpend, spendingSummary, updateSpendingLimit, logSpend };
}
