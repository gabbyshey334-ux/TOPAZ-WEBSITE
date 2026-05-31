import type { EventRow } from '@/hooks/useActiveEvent';
import { getEventRegistrationStatus } from '@/lib/eventRegistrationStatus';

/** Direct registration URL for a specific website event. */
export function registrationPathForEvent(eventId: string): string {
  return `/registration?event=${encodeURIComponent(eventId)}`;
}

/** Full public registration URL (for admin copy/paste). */
export function publicRegistrationUrl(eventId: string, origin = ''): string {
  const base = origin.replace(/\/$/, '');
  return `${base}${registrationPathForEvent(eventId)}`;
}

/**
 * Best default registration entry from the navbar/home/footer.
 * One open event → direct link; several → picker on /registration.
 */
export function registrationEntryPath(events: EventRow[]): string {
  const open = events.filter((e) => getEventRegistrationStatus(e) === 'open');
  if (open.length === 1) return registrationPathForEvent(open[0].id);
  return '/registration';
}
