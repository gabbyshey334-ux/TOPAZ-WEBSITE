import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useAdminEvent } from '@/contexts/AdminEventContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminEventSwitcher() {
  const { events, selectedEventId, setSelectedEventId, loading, selectedEvent } = useAdminEvent();

  if (loading) {
    return (
      <div className="text-xs text-slate-500 animate-pulse">Loading events…</div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-xs text-amber-400">
        No events yet — create one in the Events tab.
      </p>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 pb-6 border-b border-slate-800">
      <div className="flex items-center gap-2 text-slate-400 shrink-0">
        <Calendar className="w-4 h-4 text-[#2E75B6]" />
        <span className="text-xs font-semibold uppercase tracking-wider">Viewing event</span>
      </div>
      <Select value={selectedEventId ?? undefined} onValueChange={setSelectedEventId}>
        <SelectTrigger className="w-full sm:w-[min(100%,28rem)] bg-slate-900 border-slate-600 text-white">
          <SelectValue placeholder="Select an event" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-600 text-white max-h-72">
          {events.map((ev) => {
            const dateLabel = ev.date
              ? format(parseISO(`${ev.date}T12:00:00`), 'MMM d, yyyy')
              : 'No date';
            return (
              <SelectItem key={ev.id} value={ev.id} className="text-white focus:bg-slate-800">
                {ev.name} · {dateLabel}
                {ev.is_active ? ' (on website)' : ''}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selectedEvent && (
        <p className="text-[10px] text-slate-500 sm:max-w-xs">
          Registrations, overview stats, and scoring sync use this event.
          {selectedEvent.is_active ? ' Shown on the public Events page.' : ' Hidden from the public website.'}
        </p>
      )}
    </div>
  );
}
