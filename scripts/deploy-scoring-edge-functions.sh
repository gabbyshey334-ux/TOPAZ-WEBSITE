#!/usr/bin/env bash
# Deploy all website → scoring edge functions (sync, delete, orphan cleanup).
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI and run: supabase login" >&2
  exit 1
fi
REF=tklkexenzewscgdszlrq
for fn in sync-to-scoring-app delete-from-scoring-app cleanup-scoring-orphans; do
  echo "Deploying $fn…"
  supabase functions deploy "$fn" --project-ref "$REF"
done
echo "Done. Ensure SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY are set for each function in the dashboard."
