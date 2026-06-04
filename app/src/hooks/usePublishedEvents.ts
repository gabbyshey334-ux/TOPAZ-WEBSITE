import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { EventRow } from '@/hooks/useActiveEvent';

/** All events marked "Show on public website" (`is_active`), ordered by competition date. */
export function usePublishedEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(
        'id, created_at, name, date, location, description, is_active, registration_open_date, registration_close_date, scoring_competition_id, image_url',
      )
      .eq('is_active', true)
      .order('date', { ascending: true });
    if (error) {
      console.error('[usePublishedEvents] Failed to load events:', error.message);
      setEvents([]);
    } else {
      setEvents((data as EventRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { events, loading, refresh: load };
}
