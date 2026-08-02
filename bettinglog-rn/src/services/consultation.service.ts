import { supabase } from '@/services/supabase';

// Consultation chat persistence (consultation_sessions + consultation_messages).
// The "app" side of the conversation is generated locally by
// src/utils/consultationEngine.ts - this file only stores and retrieves.

export type ConsultationSender = 'user' | 'app';

export interface ConsultationMessage {
  id: string;
  sessionId: string;
  sender: ConsultationSender;
  content: string;
  createdAt: string;
}

export interface ConsultationSession {
  id: string;
  topic: string | null;
  createdAt: string;
}

export async function startConsultation(
  userId: string,
  topic?: string,
): Promise<ConsultationSession> {
  const { data, error } = await supabase
    .from('consultation_sessions')
    .insert({ user_id: userId, topic: topic ?? null })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, topic: data.topic, createdAt: data.created_at };
}

export async function getLatestSession(): Promise<ConsultationSession | null> {
  const { data, error } = await supabase
    .from('consultation_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, topic: data.topic, createdAt: data.created_at };
}

export async function getMessages(sessionId: string): Promise<ConsultationMessage[]> {
  const { data, error } = await supabase
    .from('consultation_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    sessionId: row.session_id,
    sender: row.sender,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function sendMessage(
  sessionId: string,
  sender: ConsultationSender,
  content: string,
): Promise<ConsultationMessage> {
  const { data, error } = await supabase
    .from('consultation_messages')
    .insert({ session_id: sessionId, sender, content })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    sessionId: data.session_id,
    sender: data.sender,
    content: data.content,
    createdAt: data.created_at,
  };
}
