// App-influence measurement (README §10.4): a weekly snapshot of the three
// tracked metrics, and the derived comparison of "first week vs now".

// The three metrics captured each week. Lower is better for all of them.
export interface InfluenceMetrics {
  pgsiScore: number | null;      // latest PGSI total (null until assessed)
  weeklySpend: number | null;    // ₱ logged that week
  weeklyOpenCount: number | null; // gambling-app opens that week
}

// One row of `influence_snapshots` - the week's numbers, stocked in the DB.
export interface InfluenceSnapshot extends InfluenceMetrics {
  id: string;
  snapshotDate: string;          // Monday of the week, "YYYY-MM-DD"
  createdAt: string;
}

// Derived by src/utils/influence.ts - never stored.
export interface InfluenceResult {
  pgsiPct: number | null;        // % improvement per metric (negative = worse)
  spendPct: number | null;
  opensPct: number | null;
  metricsUsed: number;           // how many metrics had data on both sides
  index: number | null;          // average % improvement, null = not enough data
}
