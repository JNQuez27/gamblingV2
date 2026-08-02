import { supabase } from '@/services/supabase';
import type { AuthUser } from '@/types/auth';

// Maps a Supabase auth user + profile row into the app's AuthUser shape.
function toAuthUser(id: string, email: string, profile: any, createdAt: string | null): AuthUser {
  return {
    id,
    email,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    createdAt,
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Stored on the auth user so the username is available immediately, even
    // before a profiles row exists.
    options: username ? { data: { display_name: username.trim() } } : undefined,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Theory-driven profile fields (readiness stage + Kohlberg level) for the
// signed-in user. Falls back to the schema defaults when no row exists yet.
export async function getTheoryProfile(): Promise<{
  readinessStage: string;
  moralReasoningLevel: string;
} | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const { data } = await supabase
    .from('profiles')
    .select('readiness_stage, moral_reasoning_level')
    .eq('id', sessionData.session.user.id)
    .maybeSingle();

  return {
    readinessStage: data?.readiness_stage ?? 'contemplation',
    moralReasoningLevel: data?.moral_reasoning_level ?? 'pre-conventional',
  };
}

// The currently signed-in user with their profile fields, or null.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', session.user.id)
    .maybeSingle();

  // Prefer the profiles row; fall back to the username captured at sign-up
  // (stored in auth user_metadata) so it shows without a profiles row.
  const merged = {
    display_name: profile?.display_name ?? session.user.user_metadata?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
  };
  return toAuthUser(session.user.id, session.user.email ?? '', merged, session.user.created_at ?? null);
}
