#!/usr/bin/env bash
# Deploy send-registration-confirmation to project tklkexenzewscgdszlrq.
# Run from repo root after: supabase login   OR   export SUPABASE_ACCESS_TOKEN='sbp_...'
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

exec supabase functions deploy send-registration-confirmation --project-ref tklkexenzewscgdszlrq
