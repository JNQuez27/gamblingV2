// ── Theory-driven profile fields ────────────────────────────────

// Stages of Change ladder (operationalizes Thorndike's Law of Readiness).
export type ReadinessStage =
  | 'pre-contemplation'
  | 'contemplation'
  | 'preparation'
  | 'action'
  | 'maintenance';

// Kohlberg's levels of moral reasoning. Admin-set in Phase 1.
export type MoralReasoningLevel =
  | 'pre-conventional'
  | 'conventional'
  | 'post-conventional';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

// ── Assessment ──────────────────────────────────────────────────

export interface AssessmentScore {
  id: string;
  instrumentName: string;
  instrumentVersion: string;
  totalScore: number;
  riskLevel: RiskLevel;
  category: string;
  isBaseline: boolean;   // first run — used by the influence measure
  completedAt: string;
}

// ── Theoretical Behavior Plan ───────────────────────────────────

export type TBPStatus = 'pending' | 'in-progress' | 'completed';

export interface TBPStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: TBPStatus;
  targetDate?: string;
  createdAt: string;
  completedAt?: string;
}
