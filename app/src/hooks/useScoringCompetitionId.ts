import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** Legacy fallback when active event has no linked scoring competition. */
export const LEGACY_SCORING_COMPETITION_ID = '60874ab6-341e-4e21-9e62-7fe686530607';

/**
 * Scoring competition UUID from the active website event (`events.scoring_competition_id`).
 * Used by admin scoring UI and registration sync invokes.
 */
export function useScoringCompetitionId() {
  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('scoring_competition_id')
      .eq('is_active', true)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    const id =
      typeof data?.scoring_competition_id === 'string' && data.scoring_competition_id.trim()
        ? data.scoring_competition_id.trim()
        : null;
    setCompetitionId(id);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    competitionId,
    loading,
    refresh: load,
    /** Resolved ID for queries (legacy fallback when event not linked). */
    resolvedCompetitionId: competitionId ?? LEGACY_SCORING_COMPETITION_ID,
    isLinked: Boolean(competitionId),
  };
}
