import { useMemo } from 'react';
import { usePublishedEvents } from '@/hooks/usePublishedEvents';
import { registrationEntryPath } from '@/lib/registrationLinks';

/** Smart `/registration` href for nav CTAs (direct event when only one is open). */
export function useRegistrationEntryPath() {
  const { events, loading } = usePublishedEvents();
  const href = useMemo(() => registrationEntryPath(events), [events]);
  return { href, loading };
}
