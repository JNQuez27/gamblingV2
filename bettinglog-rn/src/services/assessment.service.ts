import { supabase } from './supabase';
import type { AssessmentScore } from '../types/psychology';

function fromRow(row: any): AssessmentScore {
  return {
    id: row.id,
    instrumentName: row.instrument_name ?? 'PGSI',
    instrumentVersion: row.instrument_version ?? '1.0',
    totalScore: row.total_score,
    riskLevel: row.risk_level,
    category: row.category,
    isBaseline: row.is_baseline,
    completedAt: row.completed_at,
  };
}

export async function getAssessments(): Promise<AssessmentScore[]> {
  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function submitAssessment(
  userId: string,
  instrumentId: string,
  totalScore: number,
  riskLevel: string,
  category: string,
  isBaseline = false,
): Promise<void> {
  const { error } = await supabase.from('assessment_sessions').insert({
    user_id: userId,
    instrument_id: instrumentId,
    total_score: totalScore,
    risk_level: riskLevel,
    category,
    is_baseline: isBaseline,
    started_at: new Date().toISOString(),
  });
  if (error) throw error;
}
