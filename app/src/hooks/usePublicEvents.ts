import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { CompetitionCardProps } from '@/components/CompetitionCard';

const FALLBACK_IMAGE = `${import.meta.env.BASE_URL}images/events/trophy-gold.jpg`;

export function usePublicEvents() {
  const [cards, setCards] = useState<CompetitionCardProps[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [usedDb, setUsedDb] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCards([]);
      setUsedDb(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (cancelled) return;
      if (error) {
        setCards([]);
        setUsedDb(false);
        setLoading(false);
        return;
      }

      setUsedDb(true);
      if (!data?.length) {
        setCards([]);
        setLoading(false);
        return;
      }

      const mapped: CompetitionCardProps[] = data.map((row) => {
        const d = new Date(row.date + 'T12:00:00');
        return {
          id: row.id,
          name: row.name,
          subtitle: 'TOPAZ 2.0 competition',
          date: format(d, 'EEEE, MMMM d, yyyy'),
          time: '8:00 AM – 12:00 PM',
          location: row.location.split(',')[0]?.trim() || row.location,
          address: row.location,
          registrationDeadline: 'July 30, 2026, 12:00 AM',
          status: 'open' as const,
          description: row.description ?? '',
          image: FALLBACK_IMAGE,
        };
      });
      setCards(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { cards, loading, usedDb };
}
