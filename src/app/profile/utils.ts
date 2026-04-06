export function moodColor(score: number): string {
  if (score >= 4) return "#4ade80";
  if (score === 3) return "#facc15";
  return "#f87171";
}
