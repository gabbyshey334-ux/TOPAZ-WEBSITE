import { useMemo } from 'react';
import { usePublishedEvents } from '@/hooks/usePublishedEvents';
import type { Database } from '@/types/database';
import { getEventRegistrationStatus } from '@/lib/eventRegistrationStatus';

export type EventRow = Database['public']['Tables']['events']['Row'];

/**
 * Primary event for simple UIs (members area, legacy hooks).
 * Prefers the first event with open registration, else soonest upcoming published event.
 */
export function useActiveEvent() {
  const { events, loading, refresh } = usePublishedEvents();

  const event = useMemo(() => {
    const open = events.filter((e) => getEventRegistrationStatus(e) === 'open');
    if (open.length > 0) return open[0];
    const upcoming = events.filter((e) => getEventRegistrationStatus(e) === 'coming');
    if (upcoming.length > 0) return upcoming[0];
    return events[0] ?? null;
  }, [events]);

  return { event, events, loading, refresh };
}
