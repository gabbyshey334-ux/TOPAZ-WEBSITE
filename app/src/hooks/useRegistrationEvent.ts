import { useMemo } from 'react';
import { usePublishedEvents } from '@/hooks/usePublishedEvents';
import type { EventRow } from '@/hooks/useActiveEvent';
import { getEventRegistrationStatus } from '@/lib/eventRegistrationStatus';

/**
 * Resolves which competition the registration form is for.
 * - `?event=<uuid>` in the URL selects a specific published event.
 * - With no param: auto-select if exactly one event has open registration; otherwise show a picker.
 */
export function useRegistrationEvent(eventIdParam: string | null) {
  const { events, loading } = usePublishedEvents();

  const openEvents = useMemo(
    () => events.filter((e) => getEventRegistrationStatus(e) === 'open'),
    [events],
  );

  const event = useMemo((): EventRow | null => {
    if (eventIdParam) {
      return events.find((e) => e.id === eventIdParam) ?? null;
    }
    if (openEvents.length === 1) return openEvents[0];
    return null;
  }, [events, eventIdParam, openEvents]);

  const needsPicker = !eventIdParam && openEvents.length > 1;
  const notFound = Boolean(eventIdParam) && !loading && !event;

  return { event, events, openEvents, loading, needsPicker, notFound };
}
