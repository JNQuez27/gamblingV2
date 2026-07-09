import { buildSpendingSummary, sumSpend } from './spendingEngine';
import type { SpendingLog } from '../types/spending';

const log = (amount: number): SpendingLog => ({
  id: Math.random().toString(),
  amount,
  note: null,
  loggedAt: new Date().toISOString(),
});

describe('spendingEngine', () => {
  it('sums logged amounts', () => {
    expect(sumSpend([log(100), log(250), log(50)])).toBe(400);
  });

  it('flags critical at >= 80% of the limit', () => {
    const summary = buildSpendingSummary(1000, [log(800)]);
    expect(summary.percentUsed).toBe(80);
    expect(summary.isCritical).toBe(true);
    expect(summary.isOverLimit).toBe(false);
    expect(summary.remaining).toBe(200);
  });

  it('flags over-limit past 100%', () => {
    const summary = buildSpendingSummary(1000, [log(1200)]);
    expect(summary.isOverLimit).toBe(true);
    expect(summary.remaining).toBe(-200);
  });

  it('handles a zero limit without dividing by zero', () => {
    const summary = buildSpendingSummary(0, [log(500)]);
    expect(summary.percentUsed).toBe(0);
    expect(summary.isCritical).toBe(false);
  });
});
