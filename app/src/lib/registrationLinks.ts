import type { EventRow } from '@/hooks/useActiveEvent';

/** Public site origin for admin copy links (production domain). */
export const PUBLIC_SITE_ORIGIN =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://dancetopaz.com';

/** Direct registration URL for a specific website event. */
export function registrationPathForEvent(eventId: string): string {
  return `/registration?event=${encodeURIComponent(eventId)}`;
}

/** Full public registration URL (for admin copy/paste). */
export function publicRegistrationUrl(
  eventId: string,
  origin: string = PUBLIC_SITE_ORIGIN,
): string {
  const base = origin.replace(/\/$/, '');
  return `${base}${registrationPathForEvent(eventId)}`;
}

/**
 * Navbar / home / footer Register buttons — always Events first so visitors pick a competition,
 * then use that event's card to register (same flow for every event).
 */
export function registrationEntryPath(_events?: EventRow[]): string {
  return '/schedule';
}
