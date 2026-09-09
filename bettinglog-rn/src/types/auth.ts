// The signed-in user. Identity comes from Supabase Auth; the extra
// profile fields (name, avatar, demographics) live in the `profiles` table.
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null; // full name, for anything that wants one string
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthdate: string | null;   // ISO date 'YYYY-MM-DD'
  gender: string | null;      // 'male' | 'female' | 'prefer_not'
  avatarUrl: string | null;
  createdAt: string | null;   // account creation (Supabase Auth), ISO timestamp
}
