import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { rowsToSiteContentMap } from '@/constants/siteContentDefaults';

type SiteContentMap = Record<string, string | null>;

type SiteContentContextValue = {
  /** Latest map of every `site_content.key → value`. Empty object before first load. */
  map: SiteContentMap;
  /**
   * True once we've hydrated from either sessionStorage or the network at least once.
   * Pages that key off `ready` can defer the swap-in animation until content is stable.
   */
  ready: boolean;
  /** Force a re-fetch (e.g. after admin updates). */
  refresh: () => Promise<void>;
};

const STORAGE_KEY = 'topaz_site_content_v1';

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

/**
 * Read the cached `site_content` map written by the previous session. Returning
 * a populated object on the first render is what eliminates the "default image
 * flashes, then DB value swaps in" effect when navigating between pages.
 */
function readCachedMap(): SiteContentMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: SiteContentMap = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (v == null) out[k] = null;
        else if (typeof v === 'string') out[k] = v;
      }
      return out;
    }
  } catch {
    // Corrupt cache — ignore, fall back to empty
  }
  return {};
}

function writeCachedMap(map: SiteContentMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota / private mode — fail silently
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const cached = useMemo(() => readCachedMap(), []);
  const [map, setMap] = useState<SiteContentMap>(cached);
  // Treat a populated cache as "ready" so initial paint can use stable values
  const [ready, setReady] = useState(Object.keys(cached).length > 0);
  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .order('key');
    if (error) {
      setReady(true);
      return;
    }
    const next = rowsToSiteContentMap(
      data as { key: string; value: string | null }[] | null,
    );
    setMap(next);
    setReady(true);
    writeCachedMap(next);
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    // Inline `.then` form so the setState calls happen in a callback —
    // synchronous setState in an effect body trips react-hooks/set-state-in-effect.
    supabase
      .from('site_content')
      .select('key, value')
      .order('key')
      .then(({ data, error }) => {
        if (error) {
          setReady(true);
          return;
        }
        const next = rowsToSiteContentMap(
          data as { key: string; value: string | null }[] | null,
        );
        setMap(next);
        setReady(true);
        writeCachedMap(next);
      });
  }, []);

  const value = useMemo<SiteContentContextValue>(
    () => ({ map, ready, refresh }),
    [map, ready, refresh],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used inside <SiteContentProvider>');
  }
  return ctx;
}

/** Convenience: returns just the map. */
export function useSiteContentMap(): SiteContentMap {
  return useSiteContent().map;
}
