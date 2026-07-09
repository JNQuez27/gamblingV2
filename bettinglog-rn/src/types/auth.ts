// The signed-in user. Identity comes from Supabase Auth; the extra
// profile fields (display name, avatar) live in the `profiles` table.
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}
