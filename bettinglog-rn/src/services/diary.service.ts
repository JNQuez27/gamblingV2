import { supabase } from './supabase';
import type { DiaryEntry } from '../types/diary';

// Supabase returns snake_case columns; the app uses camelCase. These two
// helpers are the only translation point.
function fromRow(row: any): DiaryEntry {
  return {
    id: row.id,
    mood: row.mood,
    note: row.note,
    date: row.entry_date,
    createdAt: row.created_at,
  };
}

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addDiaryEntry(
  userId: string,
  mood: string,
  note: string,
  date: string,
): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .insert({ user_id: userId, mood, note, entry_date: date })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const { error } = await supabase.from('diary_entries').delete().eq('id', id);
  if (error) throw error;
}
