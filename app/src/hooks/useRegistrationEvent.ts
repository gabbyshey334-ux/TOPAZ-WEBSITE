import { useEffect, useMemo, useState } from 'react';
import { usePublishedEvents } from '@/hooks/usePublishedEvents';
import type { EventRow } from '@/hooks/useActiveEvent';
import { getEventRegistrationStatus } from '@/lib/eventRegistrationStatus';
import { supabase } from '@/lib/supabase';

/**
 * Resolves which competition the registration form is for.
 * - `?event=<uuid>` loads that event directly (works before it is published — for admin preview links).
 * - With no param: auto-select if exactly one event has open registration; otherwise show a picker.
 */
export function useRegistrationEvent(eventIdParam: string | null) {
  const { events, loading: publishedLoading } = usePublishedEvents();
  const [directEvent, setDirectEvent] = useState<EventRow | null>(null);
  const [directLoading, setDirectLoading] = useState(false);

  useEffect(() => {
    if (!eventIdParam) {
      setDirectEvent(null);
      setDirectLoading(false);
      return;
    }

    let cancelled = false;
    setDirectLoading(true);
    void supabase
      .from('events')
      .select('*')
      .eq('id', eventIdParam)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setDirectEvent(null);
        } else {
          setDirectEvent((data as EventRow | null) ?? null);
        }
        setDirectLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventIdParam]);

  const openEvents = useMemo(
    () => events.filter((e) => getEventRegistrationStatus(e) === 'open'),
    [events],
  );

  const event = useMemo((): EventRow | null => {
    if (eventIdParam) {
      return directEvent ?? events.find((e) => e.id === eventIdParam) ?? null;
    }
    if (openEvents.length === 1) return openEvents[0];
    return null;
  }, [events, eventIdParam, openEvents, directEvent]);

  const loading = publishedLoading || (Boolean(eventIdParam) && directLoading);
  const needsPicker = !eventIdParam && openEvents.length > 1;
  const notFound = Boolean(eventIdParam) && !loading && !event;

  return { event, events, openEvents, loading, needsPicker, notFound };
}
