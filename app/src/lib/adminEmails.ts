/** Built-in staff email; also seeded in Supabase `admin_emails`. */
const BUILTIN_ADMIN_EMAILS = ['topaz2.0@yahoo.com'];

/** Comma-separated extra staff emails, e.g. VITE_ADMIN_EMAILS=nick@example.com,other@example.com */
function extraAdminEmailsFromEnv(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmailAllowlist(): string[] {
  return [...new Set([...BUILTIN_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...extraAdminEmailsFromEnv()])];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailAllowlist().includes(email.trim().toLowerCase());
}
