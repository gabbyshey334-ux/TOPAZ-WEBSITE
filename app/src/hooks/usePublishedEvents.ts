import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { EventRow } from '@/hooks/useActiveEvent';

/** All events marked "Show on public website" (`is_active`), ordered by competition date. */
export function usePublishedEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true });
    setEvents((data as EventRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { events, loading, refresh: load };
}
