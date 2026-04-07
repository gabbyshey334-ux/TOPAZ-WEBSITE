const ADMIN_EMAIL = 'topaz2.0@yahoo.com';

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
