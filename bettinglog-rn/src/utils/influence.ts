// The "is the app actually working?" measure. It compares a baseline snapshot
// (captured at onboarding) against the latest one across three metrics, all of
// which should go DOWN if the app is helping.

export interface InfluenceSnapshot {
  pgsiScore: number;
  weeklySpend: number;
  weeklyOpenCount: number;
}

export interface InfluenceDelta {
  metric: 'pgsi' | 'spend' | 'opens';
  baseline: number;
  current: number;
  percentChange: number;   // negative = improvement
  improved: boolean;
}

function percentChange(baseline: number, current: number): number {
  if (baseline === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - baseline) / baseline) * 100);
}

export function computeDeltas(
  baseline: InfluenceSnapshot,
  current: InfluenceSnapshot,
): InfluenceDelta[] {
  const build = (
    metric: InfluenceDelta['metric'],
    b: number,
    c: number,
  ): InfluenceDelta => {
    const change = percentChange(b, c);
    return { metric, baseline: b, current: c, percentChange: change, improved: c < b };
  };

  return [
    build('pgsi', baseline.pgsiScore, current.pgsiScore),
    build('spend', baseline.weeklySpend, current.weeklySpend),
    build('opens', baseline.weeklyOpenCount, current.weeklyOpenCount),
  ];
}

// A single 0–100 "influence index": the average improvement across the three
// metrics, clamped to 0. Higher means the app moved the user further.
export function influenceIndex(
  baseline: InfluenceSnapshot,
  current: InfluenceSnapshot,
): number {
  const improvements = computeDeltas(baseline, current).map((d) =>
    Math.max(0, -d.percentChange),
  );
  const avg = improvements.reduce((a, b) => a + b, 0) / improvements.length;
  return Math.min(100, Math.round(avg));
}
