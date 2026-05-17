import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Competition entries (`entries` table) live on the Topaz2.0 scoring Supabase project,
 * not the website project. Override via VITE_SCORING_* in Vercel if needed.
 */
const SCORING_SUPABASE_URL_DEFAULT = 'https://iyoxdgqrxaqpnpzhkfuv.supabase.co';
const SCORING_SUPABASE_ANON_KEY_DEFAULT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3hkZ3FyeGFxcG5wemhrZnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0OTg3NzIsImV4cCI6MjA4MzA3NDc3Mn0.wjLzcZAD0JhN9La1NB0mnL8SRdSJjMK6YlIYf4PAB20';

const scoringUrl =
  import.meta.env.VITE_SCORING_SUPABASE_URL?.trim() || SCORING_SUPABASE_URL_DEFAULT;
const scoringAnonKey =
  import.meta.env.VITE_SCORING_SUPABASE_ANON_KEY?.trim() || SCORING_SUPABASE_ANON_KEY_DEFAULT;

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

/** Supabase client for the scoring app DB (`entries`, performances, etc.). */
export const scoringSupabase: SupabaseClient<Database> = createClient<Database>(
  scoringUrl,
  scoringAnonKey,
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  },
);

/** Always use the scoring project — `public.entries` is not on the website database. */
export function getEntriesSupabaseClient(): SupabaseClient<Database> {
  return scoringSupabase;
}

const ADMIN_EMAIL = 'topaz2.0@yahoo.com';

/** Returns true if the email is the site admin account. */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
