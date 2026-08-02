import type { InfluenceMetrics, InfluenceResult } from '@/types/influence';

// The "is the app actually working?" measure (README §10.4). Compares the
// user's first tracked week against now across three metrics - PGSI score,
// weekly spend, weekly app-opens - all of which go DOWN if the app is helping.

// % improvement for one metric, clamped to ±100. null when the metric can't
// be compared (no data on either side, or a zero baseline to divide by).
function pctImprovement(baseline: number | null, current: number | null): number | null {
  if (baseline == null || current == null || baseline <= 0) return null;
  const pct = ((baseline - current) / baseline) * 100;
  return Math.max(-100, Math.min(100, Math.round(pct)));
}

// The influence index is signed on purpose: a user doing worse than their
// first week sees a negative number, not a flattering zero.
export function computeInfluence(
  baseline: InfluenceMetrics,
  current: InfluenceMetrics,
): InfluenceResult {
  const pgsiPct = pctImprovement(baseline.pgsiScore, current.pgsiScore);
  const spendPct = pctImprovement(baseline.weeklySpend, current.weeklySpend);
  const opensPct = pctImprovement(baseline.weeklyOpenCount, current.weeklyOpenCount);

  const parts = [pgsiPct, spendPct, opensPct].filter((p): p is number => p !== null);
  return {
    pgsiPct,
    spendPct,
    opensPct,
    metricsUsed: parts.length,
    index: parts.length ? Math.round(parts.reduce((sum, p) => sum + p, 0) / parts.length) : null,
  };
}
