#!/usr/bin/env bash
# Deploy cleanup-scoring-orphans (removes scoring rows with no live website registration).
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli" >&2
  exit 1
fi
exec supabase functions deploy cleanup-scoring-orphans --project-ref tklkexenzewscgdszlrq
