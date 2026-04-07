import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

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
