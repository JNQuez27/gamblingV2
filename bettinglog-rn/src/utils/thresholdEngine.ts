import type { UsageBand } from '@/types/usage';

// Answers the core question: "when is it too much?" (kanus-a sobra na?).
// It classifies how often a user opens gambling apps into a band. The rule is
// average opens-per-day, and the cut-offs are configurable so a validator can
// finalize them later (see README §10.2 / §13.2).

export interface ThresholdConfig {
  elevatedAt: number;  // avg opens/day to reach "elevated"
  highAt: number;      // ... "high"
  severeAt: number;    // ... "severe"
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  elevatedAt: 2,
  highAt: 5,
  severeAt: 10,
};

export function averageOpensPerDay(totalOpens: number, days: number): number {
  if (days <= 0) return 0;
  return totalOpens / days;
}

export function classifyUsage(
  avgOpensPerDay: number,
  config: ThresholdConfig = DEFAULT_THRESHOLDS,
): UsageBand {
  if (avgOpensPerDay >= config.severeAt) return 'severe';
  if (avgOpensPerDay >= config.highAt) return 'high';
  if (avgOpensPerDay >= config.elevatedAt) return 'elevated';
  return 'controlled';
}

// Heuristic risk for a single logged visit. Late-night opens and long
// sessions are the classic danger signs; the cut-offs are provisional in the
// same way DEFAULT_THRESHOLDS is (README §10.2 - a validator can tune them).
export function visitRiskLevel(
  createdAt: string,
  timeSpentMinutes: number,
): 'low' | 'medium' | 'high' {
  const hour = new Date(createdAt).getHours();
  const lateNight = hour >= 22 || hour < 4;
  if (lateNight || timeSpentMinutes >= 30) return 'high';
  if (hour >= 18 || timeSpentMinutes >= 10) return 'medium';
  return 'low';
}

// Plain-language reason shown to the user, so the number never feels arbitrary.
export function explainBand(band: UsageBand): string {
  switch (band) {
    case 'controlled':
      return 'The habit is not being reinforced. Keep it up.';
    case 'elevated':
      return 'Repetition is building. Each open strengthens the habit loop.';
    case 'high':
      return 'Strong reinforcement - the habit is getting easier to trigger.';
    case 'severe':
      return 'This looks like a compulsive pattern. Consider a consultation.';
  }
}
