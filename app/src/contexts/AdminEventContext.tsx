import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type AdminEventRow = Database['public']['Tables']['events']['Row'];

const STORAGE_KEY = 'topaz-admin-selected-event-id';

type AdminEventContextValue = {
  events: AdminEventRow[];
  selectedEventId: string | null;
  selectedEvent: AdminEventRow | null;
  loading: boolean;
  setSelectedEventId: (id: string | null) => void;
  refresh: () => Promise<void>;
};

const AdminEventContext = createContext<AdminEventContextValue | null>(null);

export function AdminEventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [selectedEventId, setSelectedEventIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    const list = (data as AdminEventRow[]) ?? [];
    setEvents(list);
    setLoading(false);

    if (list.length === 0) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const stillValid = stored && list.some((e) => e.id === stored);
    if (stillValid) return;
    const active = list.find((e) => e.is_active) ?? list[0];
    setSelectedEventIdState(active.id);
    localStorage.setItem(STORAGE_KEY, active.id);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setSelectedEventId = useCallback((id: string | null) => {
    setSelectedEventIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const value = useMemo(
    () => ({
      events,
      selectedEventId,
      selectedEvent,
      loading,
      setSelectedEventId,
      refresh: load,
    }),
    [events, selectedEventId, selectedEvent, loading, setSelectedEventId, load],
  );

  return <AdminEventContext.Provider value={value}>{children}</AdminEventContext.Provider>;
}

export function useAdminEvent() {
  const ctx = useContext(AdminEventContext);
  if (!ctx) {
    throw new Error('useAdminEvent must be used within AdminEventProvider');
  }
  return ctx;
}

/** For tabs outside the event-scoped views (e.g. Events) that should refresh the switcher list. */
export function useAdminEventOptional() {
  return useContext(AdminEventContext);
}
