import type { RiskLevel } from '../types/psychology';

// PGSI (Problem Gambling Severity Index) scoring. The PGSI is a validated
// 9-item instrument; each item scores 0–3, so the total runs 0–27.

export interface ScoredResult {
  totalScore: number;
  riskLevel: RiskLevel;
  category: string;
}

export function sumResponses(pointValues: number[]): number {
  return pointValues.reduce((total, v) => total + v, 0);
}

// Standard PGSI bands.
export function pgsiRisk(totalScore: number): { riskLevel: RiskLevel; category: string } {
  if (totalScore >= 8) return { riskLevel: 'severe', category: 'Problem gambling' };
  if (totalScore >= 3) return { riskLevel: 'moderate', category: 'Moderate risk' };
  if (totalScore >= 1) return { riskLevel: 'low', category: 'Low risk' };
  return { riskLevel: 'low', category: 'Non-problem' };
}

export function scorePGSI(pointValues: number[]): ScoredResult {
  const totalScore = sumResponses(pointValues);
  return { totalScore, ...pgsiRisk(totalScore) };
}
