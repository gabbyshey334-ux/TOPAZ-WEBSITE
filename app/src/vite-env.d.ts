/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional override; defaults to Topaz2.0 scoring project. */
  readonly VITE_SCORING_SUPABASE_URL?: string;
  readonly VITE_SCORING_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
