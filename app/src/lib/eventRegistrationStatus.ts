import { format } from 'date-fns';
import type { EventRow } from '@/hooks/useActiveEvent';

export type EventRegStatus = 'open' | 'coming' | 'closed';

function parseDateStart(dateStr: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T00:00:00` : dateStr);
}

function parseDateEnd(dateStr: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T23:59:59.999` : dateStr);
}

/** Whether registration is open, not yet open, or closed for this event. */
export function getEventRegistrationStatus(
  event: Pick<EventRow, 'date' | 'registration_open_date' | 'registration_close_date'>,
  now: Date = new Date(),
): EventRegStatus {
  const open = event.registration_open_date
    ? parseDateStart(event.registration_open_date)
    : null;
  const close = event.registration_close_date
    ? parseDateEnd(event.registration_close_date)
    : null;

  if (close && now > close) return 'closed';
  if (open && now < open) return 'coming';
  if (open && (!close || now <= close)) return 'open';

  const comp = event.date ? parseDateStart(event.date) : null;
  if (comp && now > parseDateEnd(event.date)) return 'closed';
  if (comp) return 'open';
  return 'coming';
}

export function formatRegistrationDeadline(
  event: Pick<EventRow, 'registration_close_date' | 'registration_open_date' | 'date'>,
  fallback: string,
): string {
  if (event.registration_close_date) {
    try {
      return format(parseDateStart(event.registration_close_date), 'MMMM d, yyyy');
    } catch {
      return fallback;
    }
  }
  if (event.date) {
    try {
      return format(parseDateStart(event.date), 'MMMM d, yyyy');
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function registrationOpenDate(event: EventRow): Date {
  if (event.registration_open_date) return parseDateStart(event.registration_open_date);
  return parseDateStart(event.date);
}

export function registrationCloseDate(event: EventRow): Date {
  if (event.registration_close_date) return parseDateEnd(event.registration_close_date);
  if (event.date) return parseDateEnd(event.date);
  return parseDateEnd(event.date);
}
