/** Admin account email (Nick). Compared case-insensitively to Supabase Auth email. */
export const ADMIN_EMAIL = 'topaz2.0@yahoo.com';

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
