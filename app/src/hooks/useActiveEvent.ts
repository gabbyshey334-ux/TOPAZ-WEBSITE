import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type EventRow = Database['public']['Tables']['events']['Row'];

export function useActiveEvent() {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Only one event should be is_active=true (enforced in admin Events tab).
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    setEvent(data != null ? (data as EventRow) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { event, loading, refresh: load };
}
