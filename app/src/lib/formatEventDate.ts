import { format } from 'date-fns';

function parseEventDateInput(dateStr: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T12:00:00` : dateStr;
}

/** e.g. August 22, 2026 — used on homepage tour strip */
export function formatEventDateLabel(dateStr: string | undefined | null, fallback: string): string {
  if (!dateStr) return fallback;
  try {
    return format(new Date(parseEventDateInput(dateStr)), 'MMMM d, yyyy');
  } catch {
    return fallback;
  }
}

/** e.g. Saturday, August 22, 2026 — used on schedule competition cards */
export function formatEventDateSchedule(dateStr: string | undefined | null, fallback: string): string {
  if (!dateStr) return fallback;
  try {
    return format(new Date(parseEventDateInput(dateStr)), 'EEEE, MMMM d, yyyy');
  } catch {
    return fallback;
  }
}
