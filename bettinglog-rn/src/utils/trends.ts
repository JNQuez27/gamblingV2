// Turns raw rows into simple { label, value } series the charts can render.
// Kept generic so spend, opens, and risk all reuse the same shape.

export interface TrendPoint {
  label: string;   // x-axis label (a date key or week key)
  value: number;   // y-axis value
}

// Group any dated rows into a series by summing a chosen numeric field per key.
export function seriesBySum<T>(
  rows: T[],
  getKey: (row: T) => string,
  getValue: (row: T) => number,
): TrendPoint[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = getKey(row);
    totals.set(key, (totals.get(key) ?? 0) + getValue(row));
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

// Latest-value-per-key series (used for risk score over time, where we want the
// score itself, not a sum). Assumes rows are already in chronological order.
export function seriesByLatest<T>(
  rows: T[],
  getKey: (row: T) => string,
  getValue: (row: T) => number,
): TrendPoint[] {
  const latest = new Map<string, number>();
  for (const row of rows) {
    latest.set(getKey(row), getValue(row));
  }
  return [...latest.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}
