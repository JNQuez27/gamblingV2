// Pulls auth params out of a redirect URL, whether they arrive in the query
// (?code=, PKCE) or the fragment (#access_token=, implicit/recovery). Pure so
// it's unit-testable without RN. URL/URLSearchParams come from the
// react-native-url-polyfill already loaded by the supabase client.
export interface AuthParams {
  code: string | null;
  access_token: string | null;
  refresh_token: string | null;
  error: string | null;
}

export function pickAuthParams(url: string): AuthParams {
  const u = new URL(url);
  const q = u.searchParams;
  const hash = new URLSearchParams(u.hash.replace(/^#/, ''));
  const get = (k: string) => q.get(k) ?? hash.get(k);
  return {
    code: get('code'),
    access_token: get('access_token'),
    refresh_token: get('refresh_token'),
    error: get('error_description') ?? get('error'),
  };
}
