import { supabase } from './supabase';
import type { AuthUser } from '../types/auth';

// Maps a Supabase auth user + profile row into the app's AuthUser shape.
function toAuthUser(id: string, email: string, profile: any): AuthUser {
  return {
    id,
    email,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
    .single();

  return toAuthUser(session.user.id, session.user.email ?? '', profile);
}
