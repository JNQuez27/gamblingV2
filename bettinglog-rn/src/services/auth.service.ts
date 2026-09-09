import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase';
import { pickAuthParams } from '@/services/authUrl';
import type { AuthUser } from '@/types/auth';

// Lets the redirect back from the OAuth browser tab dismiss the tab cleanly.
WebBrowser.maybeCompleteAuthSession();

// Joins the name parts into one string, or null if there's nothing.
export function fullName(first?: string | null, middle?: string | null, last?: string | null): string | null {
  return [first, middle, last].map((s) => s?.trim()).filter(Boolean).join(' ') || null;
}

// Maps a Supabase auth user + profile row into the app's AuthUser shape.
// `p` is the merged profile-row-or-metadata bag (snake_case keys).
function toAuthUser(id: string, email: string, createdAt: string | null, p: any): AuthUser {
  const first = p.first_name ?? null;
  const middle = p.middle_name ?? null;
  const last = p.last_name ?? null;
  return {
    id,
    email,
    firstName: first,
    middleName: middle,
    lastName: last,
    displayName: p.display_name ?? fullName(first, middle, last),
    birthdate: p.birthdate ?? null,
    gender: p.gender ?? null,
    avatarUrl: p.avatar_url ?? null,
    createdAt,
  };
}

// Turns raw auth/network errors into a message a person can act on. A dropped
// connection surfaces as "Network request failed" from fetch - unhelpful, so we
// translate it into a clear "check your connection" prompt.
export function friendlyAuthError(e: any): string {
  const msg = (e?.message ?? '').toString();
  if (/network request failed|failed to fetch|network error|timed? ?out|unable to resolve host|connection/i.test(msg)) {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  if (/invalid login credentials/i.test(msg)) {
    return 'Wrong email or password. Please try again.';
  }
  return msg || 'Something went wrong. Please try again.';
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export interface SignUpNames {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export async function signUpWithEmail(email: string, password: string, names?: SignUpNames) {
  // Stored on the auth user so the name is available immediately, even before
  // the app writes the profiles row.
  const meta = names
    ? {
        first_name: names.firstName.trim(),
        middle_name: names.middleName?.trim() || null,
        last_name: names.lastName.trim(),
        display_name: fullName(names.firstName, names.middleName, names.lastName),
      }
    : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: meta ? { data: meta } : undefined,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export type GoogleSignInResult = { signedIn: boolean; isNewUser: boolean };

// A first-ever sign-in has created_at == last_sign_in_at (both stamped in the
// same flow); on later sign-ins last_sign_in_at moves far ahead. 10s of slack
// covers clock skew between the two writes.
function isFirstSignIn(user: { created_at?: string; last_sign_in_at?: string } | null): boolean {
  if (!user?.created_at) return false;
  const created = Date.parse(user.created_at);
  const last = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : created;
  return Math.abs(last - created) < 10_000;
}

// Google OAuth via an in-app browser tab. `signedIn` is false if the user
// cancels; `isNewUser` flags a freshly-created account so the caller can send
// them through onboarding. Requires Google enabled in Supabase Auth and the
// redirect below allow-listed.
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const redirectTo = Linking.createURL('auth'); // bettinglog://auth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      // Always show the Google account chooser (and its consent/T&C screen for
      // accounts that haven't authorized the app yet) instead of silently
      // reusing the last signed-in account.
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Could not start Google sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { signedIn: false, isNewUser: false };

  const { code, error: cbError } = pickAuthParams(result.url);
  if (cbError) throw new Error(cbError);
  if (!code) throw new Error('No authorization code returned.');

  const { data: exData, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exErr) throw exErr;
  return { signedIn: true, isNewUser: isFirstSignIn(exData.user) };
}

// Completes a Google sign-in whose redirect landed in the router as a deep link
// (bettinglog:///auth?code=...) instead of returning through the in-app auth
// session. Idempotent: if a session already exists (the in-session path won the
// race), it just reports it rather than re-exchanging the now-spent code.
export async function completeOAuthRedirect(code: string | null): Promise<GoogleSignInResult> {
  const { data: sess } = await supabase.auth.getSession();
  if (sess.session) return { signedIn: true, isNewUser: isFirstSignIn(sess.session.user) };
  if (!code) return { signedIn: false, isNewUser: false };
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return { signedIn: true, isNewUser: isFirstSignIn(data.user) };
}

// Emails a password-reset link that deep-links back to the reset-password
// screen. Supabase returns success even for unknown emails (no user enumeration).
export async function sendPasswordReset(email: string) {
  const redirectTo = Linking.createURL('reset-password'); // bettinglog://reset-password
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw error;
}

// Establishes the recovery session from the params in the reset deep link.
export async function beginPasswordRecovery(params: {
  code?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
}) {
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
  } else if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
  } else {
    throw new Error('This reset link is invalid or has expired.');
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// Permanently deletes the signed-in user's account. The delete_user() RPC
// (see supabase/migrations/0004_delete_user.sql) removes the auth.users row,
// which cascades to all their data. Then clears the now-invalid local session.
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_user');
  if (error) throw error;
  await supabase.auth.signOut().catch(() => {});
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

  // If migration 0005 hasn't run yet, the new columns don't exist and this
  // select errors - fall back to null so names still come from auth metadata
  // and the app keeps working instead of bouncing the user to login.
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('first_name, middle_name, last_name, display_name, avatar_url, birthdate, gender')
    .eq('id', session.user.id)
    .maybeSingle();
  const profile = profileErr ? null : profileData;

  // Prefer the profiles row; fall back to what sign-up stored, then to the
  // single name Google/OAuth supplies (full_name / name), split as a last resort.
  const meta = session.user.user_metadata ?? {};
  const oauthName: string | null = meta.full_name ?? meta.name ?? null;
  const oauthParts = oauthName ? oauthName.trim().split(/\s+/) : [];
  const oauthFirst = oauthParts[0] ?? null;
  const oauthLast = oauthParts.length > 1 ? oauthParts[oauthParts.length - 1] : null;

  const merged = {
    first_name: profile?.first_name ?? meta.first_name ?? oauthFirst,
    middle_name: profile?.middle_name ?? meta.middle_name ?? null,
    last_name: profile?.last_name ?? meta.last_name ?? oauthLast,
    display_name: profile?.display_name ?? meta.display_name ?? oauthName,
    birthdate: profile?.birthdate ?? null,
    gender: profile?.gender ?? null,
    avatar_url: profile?.avatar_url ?? meta.avatar_url ?? meta.picture ?? null,
  };
  return toAuthUser(session.user.id, session.user.email ?? '', session.user.created_at ?? null, merged);
}

// The free-text bio isn't part of AuthUser; Edit Profile fetches it directly.
export async function getMyBio(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return '';
  const { data } = await supabase.from('profiles').select('bio').eq('id', uid).maybeSingle();
  return data?.bio ?? '';
}

export interface ProfileUpdate {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  birthdate?: string | null; // 'YYYY-MM-DD'
  gender?: string | null;
  bio?: string | null;
}

// Writes profile fields for the signed-in user. Only provided keys are touched.
export async function updateProfile(u: ProfileUpdate): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) throw new Error('Not signed in.');

  const row: Record<string, unknown> = { id: uid, updated_at: new Date().toISOString() };
  if (u.firstName !== undefined) row.first_name = u.firstName.trim();
  if (u.middleName !== undefined) row.middle_name = u.middleName?.trim() || null;
  if (u.lastName !== undefined) row.last_name = u.lastName.trim();
  if (u.birthdate !== undefined) row.birthdate = u.birthdate;
  if (u.gender !== undefined) row.gender = u.gender;
  if (u.bio !== undefined) row.bio = u.bio;
  // Keep display_name in sync whenever the name is edited (all parts supplied).
  if (u.firstName !== undefined) row.display_name = fullName(u.firstName, u.middleName, u.lastName);

  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) throw error;
}
