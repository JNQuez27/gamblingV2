import { computeInfluence } from '@/utils/influence';

describe('influence', () => {
  it('averages improvement across all three metrics', () => {
    const result = computeInfluence(
      { pgsiScore: 10, weeklySpend: 1000, weeklyOpenCount: 20 },
      { pgsiScore: 5, weeklySpend: 500, weeklyOpenCount: 10 },
    );
    expect(result.pgsiPct).toBe(50);
    expect(result.spendPct).toBe(50);
    expect(result.opensPct).toBe(50);
    expect(result.metricsUsed).toBe(3);
    expect(result.index).toBe(50);
  });

  it('goes negative when the user is doing worse', () => {
    const result = computeInfluence(
      { pgsiScore: 4, weeklySpend: 200, weeklyOpenCount: 5 },
      { pgsiScore: 8, weeklySpend: 400, weeklyOpenCount: 10 },
    );
    expect(result.index).toBe(-100);
  });

  it('skips metrics without data instead of faking them', () => {
    const result = computeInfluence(
      { pgsiScore: null, weeklySpend: 1000, weeklyOpenCount: 0 },
      { pgsiScore: 5, weeklySpend: 250, weeklyOpenCount: 3 },
    );
    expect(result.pgsiPct).toBeNull();   // no baseline PGSI
    expect(result.opensPct).toBeNull();  // zero baseline - nothing to divide by
    expect(result.spendPct).toBe(75);
    expect(result.metricsUsed).toBe(1);
    expect(result.index).toBe(75);
  });

  it('returns a null index when nothing is comparable', () => {
    const result = computeInfluence(
      { pgsiScore: null, weeklySpend: 0, weeklyOpenCount: 0 },
      { pgsiScore: 5, weeklySpend: 100, weeklyOpenCount: 2 },
    );
    expect(result.metricsUsed).toBe(0);
    expect(result.index).toBeNull();
  });

  it('clamps runaway changes to ±100', () => {
    const result = computeInfluence(
      { pgsiScore: 1, weeklySpend: 10, weeklyOpenCount: 1 },
      { pgsiScore: 27, weeklySpend: 5000, weeklyOpenCount: 40 },
    );
    expect(result.index).toBe(-100);
  });
});
