// Small date helpers. All dates in the app are plain "YYYY-MM-DD" strings so
// they group cleanly and never carry a timezone surprise.

export function todayKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Monday-based start of the week that `d` falls in, as a "YYYY-MM-DD" key.
export function weekStartKey(d: Date = new Date()): string {
  const copy = new Date(d);
  const dayOfWeek = (copy.getDay() + 6) % 7; // 0 = Monday
  copy.setDate(copy.getDate() - dayOfWeek);
  return todayKey(copy);
}

// Whole days between two date keys (b - a). Negative if b is before a.
export function daysBetween(aKey: string, bKey: string): number {
  const a = new Date(aKey).getTime();
  const b = new Date(bKey).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// "July 9, 2026"
export function prettyDate(key: string): string {
  return new Date(key).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
