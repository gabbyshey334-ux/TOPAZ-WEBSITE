import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEntriesSupabaseClient, supabase } from '@/lib/supabase';
import { useScoringCompetitionId } from '@/hooks/useScoringCompetitionId';
import {
  mergedParticipantNamesForRegistration,
  parseGroupMemberNames,
  type RegistrationRow,
} from '@/lib/entryType';
import type { Json } from '@/types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { parseEdgeFunctionFailure } from '@/lib/edgeFunctionError';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type EntryRow = {
  id: string;
  competition_id: string | null;
  entry_number: number | null;
  competitor_name: string | null;
  studio_name: string | null;
  dance_type: string | null;
  group_members: Json | null;
  division_type: string | null;
  website_registration_id: string | null;
  performance_id: string | null;
};

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
  const { resolvedCompetitionId, isLinked, loading: competitionIdLoading } =
    useScoringCompetitionId();
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [participantNamesByPerf, setParticipantNamesByPerf] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupPreview, setCleanupPreview] = useState<{
    orphanEntryCount: number;
    orphanPerformanceCount: number;
    orphanEntries: { entry_number: number | null; competitor_name: string | null }[];
    orphanPerformances: { entry_number: number | null; competitor_name: string | null }[];
  } | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupError, setCleanupError] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (competitionIdLoading) return;
    setLoading(true);
    setLoadError(null);
    const client = getEntriesSupabaseClient();

    const [entriesRes, regsRes] = await Promise.all([
      client
        .from('entries')
        .select(
          'id, competition_id, entry_number, competitor_name, studio_name, dance_type, group_members, division_type, website_registration_id, performance_id',
        )
        .eq('competition_id', resolvedCompetitionId)
        .order('entry_number', { ascending: true }),
      supabase
        .from('registrations')
        .select(
          'id, contestant_name, routine_name, group_link_code, group_size, participants_json, studio_name, category, status',
        ),
    ]);

    if (entriesRes.error) {
      console.error(entriesRes.error);
      setLoadError(entriesRes.error.message);
      setRows([]);
      setParticipantNamesByPerf(new Map());
    } else {
      const entryRows = (entriesRes.data as EntryRow[]) ?? [];
      setRows(entryRows);

      const perfIds = [
        ...new Set(
          entryRows.map((e) => e.performance_id).filter((id): id is string => Boolean(id)),
        ),
      ];
      const perfMap = new Map<string, string[]>();
      if (perfIds.length > 0) {
        const { data: parts } = await client
          .from('performance_participants')
          .select('performance_id, display_name, sort_order')
          .in('performance_id', perfIds)
          .order('sort_order', { ascending: true });
        for (const p of parts ?? []) {
          const pid = p.performance_id as string;
          const name = typeof p.display_name === 'string' ? p.display_name.trim() : '';
          if (!name) continue;
          const list = perfMap.get(pid) ?? [];
          list.push(name);
          perfMap.set(pid, list);
        }
      }
      setParticipantNamesByPerf(perfMap);
    }

    if (regsRes.error) {
      console.error(regsRes.error);
    } else {
      setRegistrations((regsRes.data as RegistrationRow[]) ?? []);
    }

    setLoading(false);
  }, [competitionIdLoading, resolvedCompetitionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const regById = useMemo(() => {
    const m = new Map<string, RegistrationRow>();
    for (const r of registrations) m.set(r.id, r);
    return m;
  }, [registrations]);

  const filtered = useMemo(() => {
    return rows.filter((entry) => matchesDivisionFilter(entry.division_type, divisionFilter));
  }, [rows, divisionFilter]);

  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of rows) {
      const key = e.division_type ?? 'Unknown';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  function resolveGroupMembers(entry: EntryRow): string[] {
    const fromJson = parseGroupMemberNames(entry.group_members);
    if (fromJson.length > 0) return fromJson;

    if (entry.performance_id) {
      const fromPerf = participantNamesByPerf.get(entry.performance_id);
      if (fromPerf && fromPerf.length > 0) return fromPerf;
    }

    const regId = entry.website_registration_id;
    if (regId) {
      const reg = regById.get(regId);
      if (reg) {
        const merged = mergedParticipantNamesForRegistration(reg, registrations);
        if (merged.length > 0) return merged;
      }
    }

    return [];
  }

  function linkedWebsiteNames(entry: EntryRow): string[] {
    const regId = entry.website_registration_id;
    if (!regId) return [];
    const reg = regById.get(regId);
    if (!reg) return [];
    return mergedParticipantNamesForRegistration(reg, registrations);
  }

  async function runCleanup(dryRun: boolean) {
    setCleanupLoading(true);
    setCleanupError(null);
    if (!dryRun) setCleanupResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-scoring-orphans', {
        body: { dryRun, competitionId: resolvedCompetitionId },
      });
      if (error) throw new Error(await parseEdgeFunctionFailure(error));
      if (data && typeof data === 'object' && data !== null && 'error' in data && (data as { error?: unknown }).error) {
        throw new Error(String((data as { error: unknown }).error));
      }
      const payload = data as {
        orphanEntryCount?: number;
        orphanPerformanceCount?: number;
        orphanEntries?: { entry_number: number | null; competitor_name: string | null }[];
        orphanPerformances?: { entry_number: number | null; competitor_name: string | null }[];
        deletedEntries?: number;
        deletedPerformances?: number;
      };
      if (dryRun) {
        setCleanupPreview({
          orphanEntryCount: payload.orphanEntryCount ?? 0,
          orphanPerformanceCount: payload.orphanPerformanceCount ?? 0,
          orphanEntries: payload.orphanEntries ?? [],
          orphanPerformances: payload.orphanPerformances ?? [],
        });
      } else {
        setCleanupOpen(false);
        setCleanupPreview(null);
        setCleanupResult(
          `Removed ${payload.deletedEntries ?? 0} orphan entries and ${payload.deletedPerformances ?? 0} orphan performances.`,
        );
        await load();
      }
    } catch (e) {
      setCleanupError(e instanceof Error ? e.message : String(e));
    } finally {
      setCleanupLoading(false);
    }
  }

  async function openCleanupDialog() {
    setCleanupOpen(true);
    setCleanupPreview(null);
    setCleanupError(null);
    await runCleanup(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
      </div>
    );
  }

  const countSummary = Object.entries(divisionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => `${label}: ${n}`)
    .join(' · ');

  return (
    <div className="space-y-6">
      {!isLinked && (
        <div className="rounded-xl border border-amber-700/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          No scoring competition is linked on the active event. Go to Admin → Events and paste the
          competition UUID from the scoring app so entries appear here.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Scoring entries</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Pulled from the scoring app <code className="text-[#7EB8E8]">entries</code> table for the
            linked competition. The scoring app shows <strong className="text-slate-300">all divisions</strong> at
            once — use the filter to match one division. Division type uses{' '}
            <code className="text-[#7EB8E8]">division_type</code>, not{' '}
            <code className="text-[#7EB8E8]">dance_type</code>.
            <span className="block text-slate-500 mt-1">
              {rows.length} total in scoring DB
              {countSummary ? ` (${countSummary})` : ''}.
              {divisionFilter !== 'all' && filtered.length !== rows.length
                ? ` Showing ${filtered.length} with filter "${divisionFilter}".`
                : ''}
            </span>
          </p>
          {loadError && (
            <p className="text-sm text-amber-400 mt-2">
              Could not load entries: {loadError}
            </p>
          )}
          {cleanupResult && (
            <p className="text-sm text-emerald-400 mt-2">{cleanupResult}</p>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => void openCleanupDialog()}
            className="border-amber-700/60 bg-slate-900 text-amber-200 hover:bg-amber-950/40 hover:text-amber-100 h-9 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clean orphans
          </Button>
        </div>
      </div>

      <AlertDialog open={cleanupOpen} onOpenChange={setCleanupOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Clean scoring orphans (TOPAZ 2026)</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-2">
              <span className="block">
                Removes scoring entries with no website registration, entries whose registration was
                deleted, and performances nothing points to. Does not remove valid synced entries.
              </span>
              {cleanupLoading && !cleanupPreview && (
                <span className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning…
                </span>
              )}
              {cleanupPreview && (
                <span className="block text-amber-200/90">
                  Found {cleanupPreview.orphanEntryCount} orphan entries and{' '}
                  {cleanupPreview.orphanPerformanceCount} orphan performances.
                  {(cleanupPreview.orphanEntries.length > 0 ||
                    cleanupPreview.orphanPerformances.length > 0) && (
                    <span className="block mt-2 text-xs text-slate-400 font-mono max-h-32 overflow-y-auto">
                      {[
                        ...cleanupPreview.orphanEntries.map(
                          (e) =>
                            `Entry #${e.entry_number ?? '?'} ${e.competitor_name ?? '—'}`,
                        ),
                        ...cleanupPreview.orphanPerformances.map(
                          (p) =>
                            `Perf #${p.entry_number ?? '?'} ${p.competitor_name ?? '—'}`,
                        ),
                      ].join('\n')}
                    </span>
                  )}
                </span>
              )}
              {cleanupError && (
                <span className="block text-red-400 text-sm">{cleanupError}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={
                cleanupLoading ||
                !cleanupPreview ||
                (cleanupPreview.orphanEntryCount === 0 &&
                  cleanupPreview.orphanPerformanceCount === 0)
              }
              onClick={() => void runCleanup(false)}
              className="bg-amber-700 hover:bg-amber-600 text-white"
            >
              {cleanupLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete orphans'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Competitor</th>
              <th className="px-4 py-3 font-semibold">Studio</th>
              <th className="px-4 py-3 font-semibold">Category (dance type)</th>
              <th className="px-4 py-3 font-semibold">Group members</th>
              <th className="px-4 py-3 font-semibold">Linked (website)</th>
              <th className="px-4 py-3 font-semibold">Division type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  {rows.length === 0 && !loadError
                    ? 'No entries yet. Sync registrations from the Registrations tab.'
                    : 'No entries match this division filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const members = resolveGroupMembers(e);
                const linked = linkedWebsiteNames(e);
                const linkedLabel =
                  linked.length > 0
                    ? linked.join(', ')
                    : e.website_registration_id
                      ? '—'
                      : 'Not linked';
                return (
                  <tr key={e.id} className="border-b border-slate-800/80 hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{e.entry_number ?? '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{e.competitor_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{e.studio_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{e.dance_type || '—'}</td>
                    <td
                      className="px-4 py-3 text-slate-300 max-w-[180px] truncate"
                      title={members.join(', ')}
                    >
                      {members.length ? members.join(', ') : '—'}
                    </td>
                    <td
                      className="px-4 py-3 text-slate-400 max-w-[180px] truncate text-xs"
                      title={linkedLabel}
                    >
                      {linkedLabel}
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
