import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import {
  getEntryType,
  mergedParticipantNamesForRegistration,
  registrationDivisionTypeLabel,
} from '@/lib/entryType';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

type RegRow = Database['public']['Tables']['registrations']['Row'];

/** Scoring-style row: category is the dance/category label; division type never uses it. */
type ScoringEntryPreview = {
  id: string;
  competitor_name: string;
  studio_name: string | null;
  dance_type: string;
  group_members: string[];
  divisionType: string;
};

export default function ScoringInterface() {
  const [rows, setRows] = useState<RegRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [divisionFilter, setDivisionFilter] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data as RegRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const entriesPreview = useMemo((): ScoringEntryPreview[] => {
    return rows.map((r) => {
      const mergedNames = mergedParticipantNamesForRegistration(r, rows);
      const gm =
        mergedNames.length > 0
          ? mergedNames
          : (r.contestant_name?.trim() ? [r.contestant_name.trim()] : []);
      return {
        id: r.id,
        competitor_name: r.contestant_name,
        studio_name: r.studio_name,
        dance_type: r.category ?? '',
        group_members: gm,
        divisionType: registrationDivisionTypeLabel(r, rows),
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    return entriesPreview.filter((e) => {
      if (divisionFilter === 'all') return true;
      return e.divisionType === divisionFilter;
    });
  }, [entriesPreview, divisionFilter]);

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
          <h2 className="text-2xl font-bold text-white">Scoring entries preview</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Division type (Solo / Duo / Trio / …) is derived from merged participant names — same rule as the scoring app{' '}
            <code className="text-[#7EB8E8]">group_members</code>, not from category / dance style.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white text-sm h-9">
              <SelectValue placeholder="Filter by division type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white">All division types</SelectItem>
              {['Solo', 'Duo', 'Trio', 'Small Group', 'Large Group', 'Production'].map((t) => (
                <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
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
              <th className="px-4 py-3 font-semibold">Competitor</th>
              <th className="px-4 py-3 font-semibold">Studio</th>
              <th className="px-4 py-3 font-semibold">Category (dance type)</th>
              <th className="px-4 py-3 font-semibold">Group members</th>
              <th className="px-4 py-3 font-semibold">Division type</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">getEntryType(members)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No registrations match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-slate-800/80 hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-white font-medium">{e.competitor_name}</td>
                  <td className="px-4 py-3 text-slate-300">{e.studio_name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{e.dance_type || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate" title={e.group_members.join(', ')}>
                    {e.group_members.length ? e.group_members.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-[#2E75B6]/20 text-[#7EB8E8] px-2.5 py-0.5 text-xs font-bold">
                      {e.divisionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{getEntryType({ group_members: e.group_members })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
