import { buildSpendingSummary, sumSpend, weeklySpendByDay } from '@/utils/spendingEngine';
import type { SpendingLog } from '@/types/spending';

const log = (amount: number, loggedAt = new Date().toISOString()): SpendingLog => ({
  id: Math.random().toString(),
  amount,
  note: null,
  loggedAt,
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

  it('buckets this week Mon..Sun and sums same-day logs', () => {
    // 2026-07-16 is a Thursday; that week runs Mon 07-13 → Sun 07-19.
    const now = new Date('2026-07-16T12:00:00');
    const logs = [
      log(100, '2026-07-13T09:00:00'), // Monday
      log(40, '2026-07-16T10:00:00'),  // Thursday
      log(60, '2026-07-16T20:00:00'),  // Thursday again - should sum
      log(999, '2026-07-12T23:00:00'), // Sunday of the PREVIOUS week - excluded
      log(999, '2026-07-20T00:00:00'), // Monday of the NEXT week - excluded
    ];
    expect(weeklySpendByDay(logs, now)).toEqual([100, 0, 0, 100, 0, 0, 0]);
  });

  it('returns all zeros for no logs', () => {
    expect(weeklySpendByDay([], new Date('2026-07-16T12:00:00'))).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
