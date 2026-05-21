-- Link website events to scoring-app competitions for registration sync.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS scoring_competition_id uuid;

COMMENT ON COLUMN public.events.scoring_competition_id IS
  'UUID of the competition in the scoring Supabase project; required for sync when is_active.';

-- Point the active event at the current scoring competition.
UPDATE public.events
SET scoring_competition_id = '7ff3a278-916d-4835-9fb0-37b003900429'
WHERE is_active = true
  AND scoring_competition_id IS NULL;
