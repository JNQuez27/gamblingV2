import { supabase } from './supabase';
import type { TBPStep, TBPStatus } from '../types/psychology';

function fromRow(row: any): TBPStep {
  return {
    id: row.id,
    stepNumber: row.step_number,
    title: row.title,
    description: row.description,
    status: row.status,
    targetDate: row.target_date ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function getTBPSteps(): Promise<TBPStep[]> {
  const { data, error } = await supabase
    .from('tbp_steps')
    .select('*')
    .order('step_number', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addTBPStep(
  userId: string,
  step: Omit<TBPStep, 'id' | 'createdAt'>,
): Promise<void> {
  const { error } = await supabase.from('tbp_steps').insert({
    user_id: userId,
    step_number: step.stepNumber,
    title: step.title,
    description: step.description,
    status: step.status,
    target_date: step.targetDate ?? null,
  });
  if (error) throw error;
}

export async function updateTBPStepStatus(id: string, status: TBPStatus): Promise<void> {
  const { error } = await supabase
    .from('tbp_steps')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) throw error;
}
