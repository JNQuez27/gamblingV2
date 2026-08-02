import { supabase } from '@/services/supabase';
import type { InfluenceSnapshot } from '@/types/influence';

function fromRow(row: any): InfluenceSnapshot {
  return {
    id: row.id,
    snapshotDate: row.snapshot_date,
    pgsiScore: row.pgsi_score,
    weeklySpend: row.weekly_spend == null ? null : Number(row.weekly_spend),
    weeklyOpenCount: row.weekly_open_count,
    createdAt: row.created_at,
  };
}

// Oldest first - snapshots[0] is the user's first tracked week (the baseline).
export async function getInfluenceSnapshots(): Promise<InfluenceSnapshot[]> {
  const { data, error } = await supabase
    .from('influence_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

// Stock this week's numbers. One row per user per week (0003 unique index);
// re-running within the same week just refreshes the values.
export async function upsertInfluenceSnapshot(
  userId: string,
  snapshotDate: string,
  pgsiScore: number | null,
  weeklySpend: number,
  weeklyOpenCount: number,
): Promise<void> {
  const { error } = await supabase.from('influence_snapshots').upsert(
    {
      user_id: userId,
      snapshot_date: snapshotDate,
      pgsi_score: pgsiScore,
      weekly_spend: weeklySpend,
      weekly_open_count: weeklyOpenCount,
    },
    { onConflict: 'user_id,snapshot_date' },
  );
  if (error) throw error;
}
