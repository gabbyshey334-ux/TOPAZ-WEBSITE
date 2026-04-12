import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database, RegistrationParticipant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Download,
  Eye,
  Trash2,
  Music,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  SkipForward,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RegRow = Database['public']['Tables']['registrations']['Row'];

// ── Sync status config ───────────────────────────────────────────────────────
const SYNC_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2; dot: string }> = {
  pending:  { label: 'Not Synced', color: 'text-slate-400',   bg: 'bg-slate-400/10',   icon: Clock,         dot: 'bg-slate-400' },
  synced:   { label: 'Synced',     color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2,  dot: 'bg-emerald-400' },
  failed:   { label: 'Sync Failed',color: 'text-red-400',     bg: 'bg-red-400/10',     icon: XCircle,       dot: 'bg-red-400' },
  skipped:  { label: 'Skipped',    color: 'text-blue-400',    bg: 'bg-blue-400/10',    icon: SkipForward,   dot: 'bg-blue-400' },
};

function syncCfg(s: string) {
  return SYNC_CONFIG[s] ?? SYNC_CONFIG['pending'];
}

// ── Status config ────────────────────────────────────────────────────────────
const STATUSES: { value: string; label: string; color: string; dot: string }[] = [
  { value: 'pending',    label: 'Pending',    color: 'text-amber-400',   dot: 'bg-amber-400' },
  { value: 'confirmed',  label: 'Confirmed',  color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { value: 'waitlisted', label: 'Waitlisted', color: 'text-blue-400',    dot: 'bg-blue-400' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'text-red-400',     dot: 'bg-red-400' },
];

function statusCfg(s: string) {
  return STATUSES.find((x) => x.value === s) ?? STATUSES[0];
}

// ── Entry type label (short) ─────────────────────────────────────────────────
function entryType(groupSize: string): string {
  if (groupSize.startsWith('Solo'))        return 'Solo';
  if (groupSize.startsWith('Duo'))         return 'Duo';
  if (groupSize.startsWith('Trio'))        return 'Trio';
  if (groupSize.startsWith('Small Group')) return 'Small Group';
  if (groupSize.startsWith('Large Group')) return 'Large Group';
  if (groupSize.startsWith('Production'))  return 'Production';
  return groupSize;
}

// ── Detail field row helper ──────────────────────────────────────────────────
function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-slate-800 last:border-0">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-200 font-medium">{value}</p>
    </div>
  );
}

// ── Registration detail dialog ───────────────────────────────────────────────
function DetailDialog({
  row,
  onClose,
  onStatusChange,
  onSyncComplete,
}: {
  row: RegRow | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onSyncComplete: (id: string, updated: Partial<RegRow>) => void;
}) {
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!row?.music_file_url) { setMusicUrl(null); return; }
    setLoadingMusic(true);
    supabase.storage
      .from('music-uploads')
      .createSignedUrl(row.music_file_url, 3600)
      .then(({ data }) => {
        setMusicUrl(data?.signedUrl ?? null);
        setLoadingMusic(false);
      });
  }, [row?.music_file_url]);

  async function handleStatusChange(status: string) {
    if (!row) return;
    setStatusSaving(true);
    await onStatusChange(row.id, status);
    setStatusSaving(false);
  }

  async function handleSyncNow() {
    if (!row) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke('sync-to-scoring-app', {
        body: { registrationId: row.id },
      });
      if (error) throw new Error(error.message);
      if (data?.alreadySynced) {
        setSyncMsg('Already synced — no action needed.');
      } else if (data?.skipped) {
        setSyncMsg(`Skipped: ${data.reason ?? 'duplicate found in scoring app'}`);
      } else {
        setSyncMsg(`Synced successfully! Entry #${data?.entryNumber ?? '—'} in the scoring app.`);
      }
      // Refresh this row's sync columns from DB
      const { data: fresh } = await supabase
        .from('registrations')
        .select('scoring_app_sync_status, scoring_app_contestant_id, scoring_app_synced_at, scoring_app_sync_error')
        .eq('id', row.id)
        .single();
      if (fresh) onSyncComplete(row.id, fresh as Partial<RegRow>);
    } catch (e) {
      setSyncMsg(`Sync failed: ${e instanceof Error ? e.message : String(e)}`);
      const { data: fresh } = await supabase
        .from('registrations')
        .select('scoring_app_sync_status, scoring_app_contestant_id, scoring_app_synced_at, scoring_app_sync_error')
        .eq('id', row.id)
        .single();
      if (fresh) onSyncComplete(row.id, fresh as Partial<RegRow>);
    } finally {
      setSyncing(false);
    }
  }

  if (!row) return null;

  const participants = row.participants_json as RegistrationParticipant[] | null;
  const cfg = statusCfg(row.status);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-white">{row.contestant_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} bg-slate-800`}>
              {cfg.label}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Status changer */}
          <div className="bg-slate-900 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Change status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={statusSaving}
                  onClick={() => handleStatusChange(s.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    row.status === s.value
                      ? `border-transparent bg-slate-700 ${s.color}`
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                  )}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dancer info */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Dancer Information</p>
            <div className="space-y-0">
              <Field label="Full Name"            value={row.contestant_name} />
              <Field label="Date of Birth"         value={row.date_of_birth ?? undefined} />
              <Field label="Age (competition day)" value={row.age} />
              <Field label="Studio"               value={row.studio_name} />
              <Field label="Teacher / Instructor"  value={row.teacher_name} />
              <Field label="Years of Training"     value={row.years_of_training} />
              <Field label="Parent / Guardian"     value={row.parent_guardian_name ?? undefined} />
            </div>
          </div>

          {/* Contact info */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Contact</p>
            <div className="space-y-0">
              <Field label="Email"   value={row.email} />
              <Field label="Phone"   value={row.phone} />
              <Field label="Address" value={[row.soloist_address, row.city, row.state, row.zip].filter(Boolean).join(', ') || undefined} />
            </div>
          </div>

          {/* Competition entry */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Competition Entry</p>
            <div className="space-y-0">
              <Field label="Routine Name"  value={row.routine_name} />
              <Field label="Category"      value={row.category} />
              <Field label="Entry Type"    value={row.group_size} />
              <Field label="Age Division"  value={row.age_division} />
              <Field label="Ability Level" value={row.ability_level} />
            </div>
          </div>

          {/* Music */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Music</p>
            <div className="space-y-0">
              <Field label="Song Title"    value={row.song_title ?? undefined} />
              <Field label="Artist / Composer" value={row.artist_name ?? undefined} />
              <Field label="Delivery"      value={row.music_delivery_method === 'upload' ? 'Digital upload' : 'USB on competition day'} />
            </div>
            {row.music_file_url && (
              <div className="mt-3">
                {loadingMusic ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                    Loading music file…
                  </div>
                ) : musicUrl ? (
                  <div className="space-y-2">
                    <audio controls src={musicUrl} className="w-full h-10" />
                    <a
                      href={musicUrl}
                      download
                      className="inline-flex items-center gap-2 text-xs text-[#7EB8E8] hover:text-white transition-colors"
                    >
                      <Music className="w-3.5 h-3.5" />
                      Download music file
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Music file unavailable.</p>
                )}
              </div>
            )}
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Payment</p>
            <div className="space-y-0">
              <Field label="Entry Fee"       value={`$${Number(row.total_fee).toFixed(2)}`} />
              <Field label="Payment Method"  value={row.payment_method} />
              <Field label="Contestant Count" value={String(row.contestant_count)} />
            </div>
          </div>

          {/* Participants */}
          {participants && participants.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">
                Participants ({participants.length})
              </p>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="bg-slate-900 rounded-lg px-4 py-3">
                    <p className="text-sm font-medium text-white">
                      {i + 1}. {p.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Age: {p.age}
                      {p.signature_confirmed && ' · Signature confirmed'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scoring App Sync */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Scoring App</p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-3">
              {/* Status row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const sc = syncCfg(row.scoring_app_sync_status ?? 'pending');
                    const Icon = sc.icon;
                    return (
                      <>
                        <Icon className={`w-4 h-4 ${sc.color}`} />
                        <span className={`text-sm font-medium ${sc.color}`}>{sc.label}</span>
                      </>
                    );
                  })()}
                </div>
                {(row.scoring_app_sync_status === 'failed' || row.scoring_app_sync_status === 'pending') && (
                  <Button
                    size="sm"
                    className="h-7 px-3 bg-[#2E75B6] hover:bg-[#1e5a96] text-white text-xs"
                    onClick={handleSyncNow}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    )}
                    {syncing ? 'Syncing…' : 'Sync Now'}
                  </Button>
                )}
              </div>

              {/* Details */}
              {row.scoring_app_contestant_id && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Entry ID in Scoring App</p>
                  <p className="text-xs text-slate-300 font-mono break-all">{row.scoring_app_contestant_id}</p>
                </div>
              )}
              {row.scoring_app_synced_at && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Synced At</p>
                  <p className="text-xs text-slate-300">{new Date(row.scoring_app_synced_at).toLocaleString()}</p>
                </div>
              )}
              {row.scoring_app_sync_error && (
                <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-red-400 mb-0.5">Error</p>
                  <p className="text-xs text-red-300">{row.scoring_app_sync_error}</p>
                </div>
              )}
              {syncMsg && (
                <div className={cn(
                  'rounded-lg px-3 py-2 text-xs',
                  syncMsg.startsWith('Sync failed') || syncMsg.startsWith('Failed')
                    ? 'bg-red-950/40 border border-red-900/50 text-red-300'
                    : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-300'
                )}>
                  {syncMsg}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-800 space-y-1">
            <p>Submitted: {new Date(row.created_at).toLocaleString()}</p>
            <p>ID: {row.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RegistrationsAdmin() {
  const [rows, setRows] = useState<RegRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [detail, setDetail] = useState<RegRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Bulk sync state
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    setRows((data as RegRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const s = new Set(rows.map((r) => r.category));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q
        || r.contestant_name.toLowerCase().includes(q)
        || r.studio_name.toLowerCase().includes(q)
        || r.email.toLowerCase().includes(q);
      const matchStatus    = statusFilter === 'all'    || r.status === statusFilter;
      const matchEntry     = entryTypeFilter === 'all' || entryType(r.group_size) === entryTypeFilter;
      const matchCategory  = categoryFilter === 'all'  || r.category === categoryFilter;
      return matchSearch && matchStatus && matchEntry && matchCategory;
    });
  }, [rows, search, statusFilter, entryTypeFilter, categoryFilter]);

  async function setStatus(id: string, status: string) {
    await supabase.from('registrations').update({ status }).eq('id', id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (detail?.id === id) setDetail((d) => d ? { ...d, status } : d);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('registrations').delete().eq('id', deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  }

  function handleSyncComplete(id: string, updated: Partial<RegRow>) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...updated } : r));
    setDetail((d) => d?.id === id ? { ...d, ...updated } : d);
  }

  async function runBulkSync() {
    setShowBulkConfirm(false);
    const targets = rows.filter((r) =>
      r.scoring_app_sync_status === 'pending' || r.scoring_app_sync_status === 'failed'
    );
    if (targets.length === 0) return;
    setBulkSyncing(true);
    setBulkProgress({ done: 0, total: targets.length });
    setBulkResult(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const reg = targets[i];
      try {
        const { error } = await supabase.functions.invoke('sync-to-scoring-app', {
          body: { registrationId: reg.id },
        });
        if (error) { failCount++; } else { successCount++; }
      } catch { failCount++; }

      // Refresh this row from DB
      const { data: fresh } = await supabase
        .from('registrations')
        .select('scoring_app_sync_status, scoring_app_contestant_id, scoring_app_synced_at, scoring_app_sync_error')
        .eq('id', reg.id)
        .single();
      if (fresh) handleSyncComplete(reg.id, fresh as Partial<RegRow>);

      setBulkProgress({ done: i + 1, total: targets.length });

      // 500ms delay between calls
      if (i < targets.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setBulkSyncing(false);
    setBulkProgress(null);
    setBulkResult(
      `Bulk sync complete — ${successCount} succeeded, ${failCount} failed.`
    );
    setTimeout(() => setBulkResult(null), 8000);
  }

  function exportCsv() {
    const cols = [
      'id', 'created_at', 'status',
      'contestant_name', 'age', 'date_of_birth',
      'studio_name', 'teacher_name', 'routine_name',
      'email', 'phone', 'years_of_training',
      'parent_guardian_name',
      'soloist_address', 'city', 'state', 'zip',
      'studio_address', 'studio_city', 'studio_state', 'studio_zip',
      'category', 'age_division', 'ability_level', 'group_size',
      'song_title', 'artist_name', 'music_delivery_method',
      'contestant_count', 'total_fee', 'payment_method',
      'disclaimer_accepted',
    ] as const;

    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const lines = [
      cols.join(','),
      ...filtered.map((r) => cols.map((c) => esc(r[c as keyof RegRow])).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `topaz-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const activeFilters = [
    statusFilter !== 'all' ? statusFilter : null,
    entryTypeFilter !== 'all' ? entryTypeFilter : null,
    categoryFilter !== 'all' ? categoryFilter : null,
  ].filter(Boolean);

  const unsyncedCount = useMemo(
    () => rows.filter((r) => r.scoring_app_sync_status === 'pending' || r.scoring_app_sync_status === 'failed').length,
    [rows]
  );

  return (
    <div className="space-y-6">
      {/* Bulk sync result banner */}
      {bulkResult && (
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/50 rounded-xl px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {bulkResult}
        </div>
      )}

      {/* Bulk sync progress banner */}
      {bulkSyncing && bulkProgress && (
        <div className="flex items-center gap-3 bg-[#2E75B6]/10 border border-[#2E75B6]/30 rounded-xl px-4 py-3 text-sm text-[#7EB8E8]">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Syncing {bulkProgress.done} of {bulkProgress.total}…
          <div className="flex-1 bg-slate-800 rounded-full h-1.5 ml-2">
            <div
              className="bg-[#2E75B6] h-1.5 rounded-full transition-all"
              style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Registrations</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {filtered.length} of {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
            {activeFilters.length > 0 && ` · filtered by ${activeFilters.join(', ')}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {unsyncedCount > 0 && !bulkSyncing && (
            <Button
              className="bg-[#2E75B6] hover:bg-[#1e5a96] text-white"
              onClick={() => setShowBulkConfirm(true)}
              disabled={bulkSyncing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All Unsync'd ({unsyncedCount})
            </Button>
          )}
          <Button
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800"
            onClick={exportCsv}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by dancer name, studio, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#2E75B6]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-slate-900 border-slate-700 text-white text-sm h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className={`${s.color}`}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Entry type filter */}
          <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
            <SelectTrigger className="w-[150px] bg-slate-900 border-slate-700 text-white text-sm h-9">
              <SelectValue placeholder="Entry type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white">All entry types</SelectItem>
              {['Solo', 'Duo', 'Trio', 'Small Group', 'Large Group', 'Production'].map((t) => (
                <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700 text-white text-sm h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-white">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-slate-400 hover:text-white"
              onClick={() => { setStatusFilter('all'); setEntryTypeFilter('all'); setCategoryFilter('all'); }}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Registration cards (mobile-first, no horizontal scroll needed) */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No registrations match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const cfg = statusCfg(r.status);
            const isExpanded = expandedId === r.id;
            return (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
              >
                {/* Card main row */}
                <div className="flex items-start gap-3 p-4">
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <p className="font-bold text-white text-sm leading-tight">{r.contestant_name}</p>
                      <span className="text-xs text-slate-500">{entryType(r.group_size)}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{r.studio_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{r.category}</p>
                  </div>

                  {/* Right side: fee + date + sync badge */}
                  <div className="shrink-0 text-right space-y-1">
                    <p className="text-sm font-bold text-white">${Number(r.total_fee).toFixed(0)}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {(() => {
                      const sc = syncCfg(r.scoring_app_sync_status ?? 'pending');
                      const Icon = sc.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${sc.color} ${sc.bg}`}>
                          <Icon className="w-2.5 h-2.5" />
                          {sc.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Action strip */}
                <div className="border-t border-slate-800 px-4 py-2 flex items-center gap-2">
                  {/* Status selector */}
                  <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                    <SelectTrigger className="h-7 w-[130px] bg-slate-800 border-slate-600 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value} className={`text-xs ${s.color}`}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 ml-auto">
                    {/* View detail */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={() => setDetail(r)}
                      title="View full details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {/* Expand inline */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      title={isExpanded ? 'Collapse' : 'Quick view'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-500 hover:text-red-400 hover:bg-red-950/30"
                      onClick={() => setDeleteTarget(r.id)}
                      title="Delete registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Inline expanded view */}
                {isExpanded && (
                  <div className="border-t border-slate-800 px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-slate-900/50">
                    <div><span className="text-slate-500">Email</span><p className="text-white truncate">{r.email}</p></div>
                    <div><span className="text-slate-500">Phone</span><p className="text-white">{r.phone}</p></div>
                    <div><span className="text-slate-500">Teacher</span><p className="text-white">{r.teacher_name}</p></div>
                    <div><span className="text-slate-500">Routine</span><p className="text-white truncate">{r.routine_name}</p></div>
                    {r.song_title && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Song</span>
                        <p className="text-white">{r.song_title}{r.artist_name ? ` — ${r.artist_name}` : ''}</p>
                      </div>
                    )}
                    <div><span className="text-slate-500">Music delivery</span><p className="text-white capitalize">{r.music_delivery_method}</p></div>
                    <div><span className="text-slate-500">Age division</span><p className="text-white">{r.age_division}</p></div>
                    <div><span className="text-slate-500">Ability</span><p className="text-white">{r.ability_level}</p></div>
                    <div><span className="text-slate-500">Payment</span><p className="text-white">{r.payment_method}</p></div>
                    {r.parent_guardian_name && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Parent / Guardian</span>
                        <p className="text-white">{r.parent_guardian_name}</p>
                      </div>
                    )}
                    <div className="col-span-2 pt-1">
                      <button
                        type="button"
                        className="text-[#7EB8E8] hover:text-white"
                        onClick={() => setDetail(r)}
                      >
                        Open full detail →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full detail dialog */}
      <DetailDialog
        row={detail}
        onClose={() => setDetail(null)}
        onStatusChange={setStatus}
        onSyncComplete={handleSyncComplete}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete Registration
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            {deleteTarget && (() => {
              const r = rows.find((x) => x.id === deleteTarget);
              return r ? (
                <p className="text-slate-300">
                  Are you sure you want to permanently delete the registration for{' '}
                  <strong className="text-white">{r.contestant_name}</strong>?
                  {r.studio_name && <> ({r.studio_name})</>}
                </p>
              ) : null;
            })()}
            <p className="text-sm text-red-400 mt-3 font-medium">This cannot be undone.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting…
                </span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk sync confirm dialog */}
      <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#7EB8E8]">
              <RefreshCw className="w-5 h-5" />
              Sync to Scoring App
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-slate-300">
              Sync <strong className="text-white">{unsyncedCount} registration{unsyncedCount !== 1 ? 's' : ''}</strong> to the scoring app?
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Each registration will be synced sequentially. This may take a minute. You can close this dialog — sync will continue in the background.
            </p>
            <div className="mt-3 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                The TOPAZ 2.0 competition must already exist in the scoring app. If it doesn't, registrations will fail with a clear error message.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => setShowBulkConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2E75B6] hover:bg-[#1e5a96] text-white"
              onClick={runBulkSync}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Sync {unsyncedCount} Registration{unsyncedCount !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
