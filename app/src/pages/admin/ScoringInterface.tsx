import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEntriesSupabaseClient } from '@/lib/supabase';
import type { Database, Json } from '@/types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

type EntryRow = Database['public']['Tables']['entries']['Row'];

function groupMembersToStrings(gm: Json | null): string[] {
  if (!Array.isArray(gm)) return [];
  return gm.filter((x): x is string => typeof x === 'string');
}

/** Filter by stored `division_type` on scoring `entries` (not category / dance_type). */
function matchesDivisionFilter(
  division_type: string | null | undefined,
  selectedDivision: string,
): boolean {
  if (
    !selectedDivision ||
    selectedDivision === 'all' ||
    selectedDivision === 'All Division Types'
  ) {
    return true;
  }
  return division_type === selectedDivision;
}

export default function ScoringInterface() {
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [divisionFilter, setDivisionFilter] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const client = getEntriesSupabaseClient();
    const { data, error } = await client
      .from('entries')
      .select(
        'id, competition_id, entry_number, competitor_name, studio_name, dance_type, group_members, division_type, website_registration_id',
      )
      .order('entry_number', { ascending: true });

    if (error) {
      console.error(error);
      setLoadError(error.message);
      setRows([]);
    } else {
      setRows((data as EntryRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((entry) => matchesDivisionFilter(entry.division_type, divisionFilter));
  }, [rows, divisionFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Scoring entries</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Pulled from the scoring app <code className="text-[#7EB8E8]">entries</code> table.{' '}
            Division type uses the <code className="text-[#7EB8E8]">division_type</code> column (Solo / Duo / Trio / …), not{' '}
            <code className="text-[#7EB8E8]">dance_type</code>.
          </p>
          {loadError && (
            <p className="text-sm text-amber-400 mt-2">
              Could not load entries: {loadError}
              {' '}
              If <code className="text-amber-200/90">entries</code> lives on another Supabase project, set{' '}
              <code className="text-amber-200/90">VITE_SCORING_SUPABASE_URL</code> and{' '}
              <code className="text-amber-200/90">VITE_SCORING_SUPABASE_ANON_KEY</code> in the site env.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700 text-white text-sm h-9">
              <SelectValue placeholder="Filter by division type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white">
                All Division Types
              </SelectItem>
              {['Solo', 'Duo', 'Trio', 'Small Group', 'Large Group', 'Production'].map((t) => (
                <SelectItem key={t} value={t} className="text-white">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:border-[#2E75B6] hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Competitor</th>
              <th className="px-4 py-3 font-semibold">Studio</th>
              <th className="px-4 py-3 font-semibold">Category (dance type)</th>
              <th className="px-4 py-3 font-semibold">Group members</th>
              <th className="px-4 py-3 font-semibold">Division type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {rows.length === 0 && !loadError
                    ? 'No entries yet. Sync registrations from the Registrations tab.'
                    : 'No entries match this division filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const members = groupMembersToStrings(e.group_members);
                return (
                  <tr key={e.id} className="border-b border-slate-800/80 hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{e.entry_number ?? '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{e.competitor_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{e.studio_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{e.dance_type || '—'}</td>
                    <td
                      className="px-4 py-3 text-slate-300 max-w-[200px] truncate"
                      title={members.join(', ')}
                    >
                      {members.length ? members.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#2E75B6]/20 text-[#7EB8E8] px-2.5 py-0.5 text-xs font-bold">
                        {e.division_type ?? '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
