#!/usr/bin/env bash
# Deploy delete-from-scoring-app (removes scoring entries when admin deletes a registration).
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli" >&2
  exit 1
fi
exec supabase functions deploy delete-from-scoring-app --project-ref tklkexenzewscgdszlrq
