import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const scoringUrl = import.meta.env.VITE_SCORING_SUPABASE_URL ?? '';
const scoringAnonKey = import.meta.env.VITE_SCORING_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(url && anonKey);

if (import.meta.env.PROD && typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.error(
    '[TOPAZ] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add both in Vercel → Settings → Environment Variables (names must start with VITE_) and redeploy. Until then, Supabase will not connect.'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(url || 'https://placeholder.supabase.co', anonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Supabase client for the scoring app DB (`entries`, judges, etc.).
 * When unset, falls back to the main site client (use if `entries` exists on the same project).
 */
export const scoringSupabase: SupabaseClient<Database> | null =
  scoringUrl && scoringAnonKey
    ? createClient<Database>(scoringUrl, scoringAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null;

export function getEntriesSupabaseClient(): SupabaseClient<Database> {
  return scoringSupabase ?? supabase;
}

const ADMIN_EMAIL = 'topaz2.0@yahoo.com';

/** Returns true if the email is the site admin account. */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
