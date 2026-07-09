import type { GamblingUsageLog, RankedApp } from '../types/usage';

// Rolls up usage logs per app and returns the most-used apps, highest first.
// The UI shows the top 3 so intervention focuses where the habit is strongest.

export function rankApps(logs: GamblingUsageLog[], topN = 3): RankedApp[] {
  const totals = new Map<string, { opens: number; minutes: number }>();

  for (const log of logs) {
    const entry = totals.get(log.appName) ?? { opens: 0, minutes: 0 };
    entry.opens += log.openCount;
    entry.minutes += log.timeSpent;
    totals.set(log.appName, entry);
  }

  return [...totals.entries()]
    .map(([appName, t]) => ({ appName, totalOpens: t.opens, totalMinutes: t.minutes }))
    .sort((a, b) => b.totalOpens - a.totalOpens)
    .slice(0, topN)
    .map((app, i) => ({ ...app, rank: i + 1 }));
}
