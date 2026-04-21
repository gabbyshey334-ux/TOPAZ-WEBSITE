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
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Options for Add Manual dialog ────────────────────────────────────────────
const MANUAL_CATEGORIES = [
  'TAP',
  'BALLET',
  'JAZZ',
  'LYRICAL/CONTEMPORARY',
  'VOCAL',
  'ACTING',
  'HIP HOP',
  'VARIETY A (Song & Dance/Character/Combination of Performing Arts)',
  'VARIETY B (Dance with Prop)',
  'VARIETY C (Dance with Acrobatics)',
  'VARIETY D (Dance with Acrobatics & Prop)',
  'VARIETY E (Hip Hop)',
  'VARIETY F (Ballroom)',
  'VARIETY G (Line Dancing)',
  'PRODUCTION',
  'STUDENT CHOREOGRAPHY',
  'TEACHER/STUDENT',
] as const;

const MANUAL_GROUP_SIZES = [
  'Solo (2½ min limit)',
  'Duo (2½ min limit)',
  'Trio (3 min limit)',
  'Small Group 4–10 contestants (3 min limit)',
  'Large Group 11 or more (3½ min limit)',
  'Production 10 or more (8 min limit)',
] as const;

function defaultContestantCountFor(gs: string): number {
  if (gs.startsWith('Solo')) return 1;
  if (gs.startsWith('Duo')) return 2;
  if (gs.startsWith('Trio')) return 3;
  if (gs.startsWith('Small Group')) return 4;
  if (gs.startsWith('Large Group')) return 11;
  if (gs.startsWith('Production')) return 10;
  return 1;
}

function computeFeeFor(gs: string, count: number): number {
  if (gs.startsWith('Solo')) return 100;
  if (gs.startsWith('Duo')) return 80 * count;
  if (gs.startsWith('Trio')) return 70 * count;
  return 60 * count;
}

type RegRow = Database['public']['Tables']['registrations']['Row'];

// ── Sync status config ───────────────────────────────────────────────────────
// `stripe` is used for the colored left-border strip on each registration card.
const SYNC_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2; dot: string; stripe: string }> = {
  pending:  { label: 'Not Synced',  color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', icon: Clock,        dot: 'bg-[#f59e0b]', stripe: 'bg-[#f59e0b]' },
  synced:   { label: 'Synced',      color: 'text-[#10b981]', bg: 'bg-[#10b981]/10', icon: CheckCircle2, dot: 'bg-[#10b981]', stripe: 'bg-[#10b981]' },
  failed:   { label: 'Sync Failed', color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', icon: XCircle,      dot: 'bg-[#ef4444]', stripe: 'bg-[#ef4444]' },
  skipped:  { label: 'Skipped',     color: 'text-[#2E75B6]', bg: 'bg-[#2E75B6]/10', icon: SkipForward,  dot: 'bg-[#2E75B6]', stripe: 'bg-[#2E75B6]' },
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

// ── Inline expanded detail cell — label above, value below ──────────────────
function DetailCell({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string | null;
  capitalize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">{label}</span>
      <p className={cn('text-[#e5e7eb] font-medium mt-0.5 truncate', capitalize && 'capitalize')}>
        {value || '—'}
      </p>
    </div>
  );
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
  const [bulkResultError, setBulkResultError] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  // Manual add state
  const [showAddManual, setShowAddManual] = useState(false);
  const [addingManual, setAddingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [m_contestantName, setMContestantName] = useState('');
  const [m_groupSize, setMGroupSize] = useState<string>('');
  const [m_category, setMCategory] = useState<string>('');
  const [m_songTitle, setMSongTitle] = useState('');
  const [m_artistName, setMArtistName] = useState('');
  const [m_age, setMAge] = useState('');
  const [m_studioName, setMStudioName] = useState('');
  const [m_teacherName, setMTeacherName] = useState('');
  const [m_musicDeliveryMethod, setMMusicDeliveryMethod] = useState<'usb' | 'upload'>('usb');
  const [m_parentGuardianName, setMParentGuardianName] = useState('');
  const [m_email, setMEmail] = useState('');
  const [m_totalFee, setMTotalFee] = useState<string>('');

  function resetManualForm() {
    setMContestantName('');
    setMGroupSize('');
    setMCategory('');
    setMSongTitle('');
    setMArtistName('');
    setMAge('');
    setMStudioName('');
    setMTeacherName('');
    setMMusicDeliveryMethod('usb');
    setMParentGuardianName('');
    setMEmail('');
    setMTotalFee('');
    setManualError(null);
  }

  const m_ageNum = Number(m_age);
  const m_isMinor = m_age.trim() !== '' && !Number.isNaN(m_ageNum) && m_ageNum < 18;

  // Auto-suggest fee when group size or age changes, only if user hasn't set one
  useEffect(() => {
    if (!m_groupSize) return;
    const count = defaultContestantCountFor(m_groupSize);
    const suggested = computeFeeFor(m_groupSize, count);
    setMTotalFee((prev) => (prev === '' ? String(suggested) : prev));
  }, [m_groupSize]);

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
    setBulkResultError(failCount > 0 && successCount === 0);
    setBulkResult(
      `Bulk sync complete — ${successCount} succeeded, ${failCount} failed.`
    );
    setTimeout(() => setBulkResult(null), 8000);
  }

  async function submitManual() {
    setManualError(null);
    if (!m_contestantName.trim()) return setManualError('Dancer name is required.');
    if (!m_groupSize) return setManualError('Entry type is required.');
    if (!m_category) return setManualError('Category is required.');
    if (!m_songTitle.trim()) return setManualError('Song title is required.');
    if (!m_age.trim() || Number.isNaN(Number(m_age))) return setManualError('A valid age is required.');
    if (!m_studioName.trim()) return setManualError('Studio name is required.');
    if (!m_teacherName.trim()) return setManualError('Teacher name is required.');
    if (!m_email.trim() || !m_email.includes('@')) return setManualError('A valid email is required.');
    if (m_isMinor && !m_parentGuardianName.trim()) {
      return setManualError('Parent / guardian name is required for minors.');
    }
    const feeNum = Number(m_totalFee);
    if (m_totalFee.trim() === '' || Number.isNaN(feeNum) || feeNum < 0) {
      return setManualError('A valid fee amount is required.');
    }

    setAddingManual(true);
    try {
      const count = defaultContestantCountFor(m_groupSize);
      const row = {
        status: 'confirmed',
        contestant_name: m_contestantName.trim(),
        age: m_age.trim(),
        studio_name: m_studioName.trim(),
        teacher_name: m_teacherName.trim(),
        routine_name: m_songTitle.trim(),
        phone: '',
        email: m_email.trim().toLowerCase(),
        years_of_training: '',
        parent_guardian_name: m_parentGuardianName.trim() || null,
        category: m_category,
        age_division: '',
        ability_level: '',
        group_size: m_groupSize,
        contestant_count: count,
        total_fee: feeNum,
        payment_method: 'Manual Entry',
        song_title: m_songTitle.trim() || null,
        artist_name: m_artistName.trim() || null,
        music_delivery_method: m_musicDeliveryMethod,
        participants_json: [],
        disclaimer_accepted: true,
        scoring_app_sync_status: 'pending',
      };

      const { data: insData, error: insErr } = await supabase
        .from('registrations')
        .insert(row)
        .select('*')
        .single();

      if (insErr || !insData) {
        throw new Error(insErr?.message ?? 'Insert failed');
      }

      // Add to list immediately
      setRows((prev) => [insData as RegRow, ...prev]);

      // Trigger sync-to-scoring-app Edge Function
      let syncMsg = '';
      let syncError = false;
      try {
        const { data: syncData, error: syncErr } = await supabase.functions.invoke(
          'sync-to-scoring-app',
          { body: { registrationId: (insData as RegRow).id } }
        );
        if (syncErr) throw new Error(syncErr.message);
        if (syncData?.alreadySynced) {
          syncMsg = 'Registration added — already synced to scoring app.';
        } else if (syncData?.skipped) {
          syncMsg = `Registration added — sync skipped: ${syncData.reason ?? 'duplicate'}.`;
        } else {
          syncMsg = `Registration added and synced! Entry #${syncData?.entryNumber ?? '—'} in scoring app.`;
        }
      } catch (e) {
        syncError = true;
        syncMsg = `Registration added, but sync failed: ${e instanceof Error ? e.message : String(e)}`;
      }

      // Refresh sync columns from DB
      const { data: fresh } = await supabase
        .from('registrations')
        .select('scoring_app_sync_status, scoring_app_contestant_id, scoring_app_synced_at, scoring_app_sync_error')
        .eq('id', (insData as RegRow).id)
        .single();
      if (fresh) handleSyncComplete((insData as RegRow).id, fresh as Partial<RegRow>);

      setBulkResultError(syncError);
      setBulkResult(syncMsg);
      setTimeout(() => setBulkResult(null), 8000);

      setShowAddManual(false);
      resetManualForm();
    } catch (e) {
      setManualError(`Failed to add registration: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAddingManual(false);
    }
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
      {/* Bulk sync / manual add result banner */}
      {bulkResult && (
        <div className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
          bulkResultError
            ? 'bg-red-950/40 border border-red-900/50 text-red-300'
            : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-300'
        )}>
          {bulkResultError ? (
            <XCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
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

      {/* ── Page header — title left, actions pinned top-right ─────────────── */}
      <header>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between mb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Registrations</h1>
            <p className="text-sm text-[#6b7280] mt-1 font-medium">
              {filtered.length} of {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
              {activeFilters.length > 0 && ` · filtered by ${activeFilters.join(', ')}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold"
              onClick={() => { resetManualForm(); setShowAddManual(true); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manual
            </Button>
            {unsyncedCount > 0 && !bulkSyncing && (
              <Button
                variant="outline"
                className="border-[#2E75B6]/40 bg-[#2E75B6]/10 text-[#2E75B6] hover:bg-[#2E75B6]/20 hover:text-[#7EB8E8] font-bold"
                onClick={() => setShowBulkConfirm(true)}
                disabled={bulkSyncing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All ({unsyncedCount})
              </Button>
            )}
            <Button
              variant="outline"
              className="border-[#2a2a2a] bg-[#111111] text-[#e5e7eb] hover:bg-[#1a1a1a]"
              onClick={exportCsv}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-[#2E75B6]/30 via-[#1e1e1e] to-transparent" />
      </header>

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

      {/* ── Registration cards ────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#1e1e1e] rounded-xl h-24 animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-[#1e1e1e] rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1e1e1e] flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-[#6b7280]" />
          </div>
          <p className="text-[#e5e7eb] font-bold mb-1">No registrations yet</p>
          <p className="text-[#6b7280] text-sm">
            {rows.length === 0
              ? 'New entries will appear here as they come in.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const cfg = statusCfg(r.status);
            const sc = syncCfg(r.scoring_app_sync_status ?? 'pending');
            const SyncIcon = sc.icon;
            const isExpanded = expandedId === r.id;
            return (
              <div
                key={r.id}
                className={cn(
                  'relative bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden transition-colors',
                  'hover:border-[#2a2a2a]'
                )}
              >
                {/* Colored left-border strip indicating sync status */}
                <div
                  className={cn('absolute left-0 top-0 bottom-0 w-1', sc.stripe)}
                  aria-hidden
                />

                {/* Card main row */}
                <div className="flex items-start gap-3 p-4 pl-5">
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold text-white text-base leading-tight truncate">
                        {r.contestant_name}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2E75B6]/15 text-[#7EB8E8]">
                        {entryType(r.group_size)}
                      </span>
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.color, 'bg-[#1a1a1a] border border-[#2a2a2a]')}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#e5e7eb] truncate font-medium">{r.studio_name}</p>
                    <p className="text-[11px] text-[#6b7280] mt-0.5 truncate">{r.category}</p>
                  </div>

                  {/* Right: fee + date + sync badge */}
                  <div className="shrink-0 text-right space-y-1.5">
                    <p className="text-base font-black text-white tabular-nums">
                      ${Number(r.total_fee).toFixed(0)}
                    </p>
                    <p className="text-[10px] text-[#6b7280] tabular-nums">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full', sc.color, sc.bg)}>
                      <SyncIcon className="w-2.5 h-2.5" />
                      {sc.label}
                    </span>
                  </div>

                  {/* Expand chevron */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-[#1e1e1e] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75B6]/40"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-300 ease-out motion-reduce:transition-none',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                </div>

                {/* Smoothly-expanding inline details */}
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-[#1e1e1e] px-5 py-4 bg-[#0a0a0a]/40">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs mb-4">
                        <DetailCell label="Email"          value={r.email} />
                        <DetailCell label="Phone"          value={r.phone} />
                        <DetailCell label="Teacher"        value={r.teacher_name} />
                        <DetailCell label="Routine"        value={r.routine_name} />
                        {r.song_title && (
                          <div className="col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Song</span>
                            <p className="text-[#e5e7eb] font-medium mt-0.5">
                              {r.song_title}
                              {r.artist_name ? ` — ${r.artist_name}` : ''}
                            </p>
                          </div>
                        )}
                        <DetailCell label="Music delivery" value={r.music_delivery_method} capitalize />
                        <DetailCell label="Age division"   value={r.age_division} />
                        <DetailCell label="Ability"        value={r.ability_level} />
                        <DetailCell label="Payment"        value={r.payment_method} />
                        {r.parent_guardian_name && (
                          <div className="col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Parent / Guardian</span>
                            <p className="text-[#e5e7eb] font-medium mt-0.5">{r.parent_guardian_name}</p>
                          </div>
                        )}
                      </div>

                      {/* Action strip: status + sync now + view + delete — lives in expanded area */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1e1e1e]">
                        <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                          <SelectTrigger className="h-8 w-[140px] bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                            {STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value} className={cn('text-xs', s.color)}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 border-[#2a2a2a] bg-[#1a1a1a] text-[#e5e7eb] hover:bg-[#111111] text-xs"
                          onClick={() => setDetail(r)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Full Details
                        </Button>

                        <div className="ml-auto">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10 text-xs font-bold"
                            onClick={() => setDeleteTarget(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* Add manual registration dialog */}
      <Dialog
        open={showAddManual}
        onOpenChange={(v) => {
          if (!addingManual) {
            setShowAddManual(v);
            if (!v) resetManualForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#7EB8E8]">
              <Plus className="w-5 h-5" />
              Add Manual Registration
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 space-y-4">
            {manualError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-900/50 px-3 py-2 text-sm text-red-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Dancer Name *
                </label>
                <Input
                  value={m_contestantName}
                  onChange={(e) => setMContestantName(e.target.value)}
                  placeholder="First and last name"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Entry Type *
                </label>
                <Select value={m_groupSize} onValueChange={setMGroupSize}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {MANUAL_GROUP_SIZES.map((g) => (
                      <SelectItem key={g} value={g} className="text-white">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Category *
                </label>
                <Select value={m_category} onValueChange={setMCategory}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 max-h-[280px]">
                    {MANUAL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-white">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Song Title *
                </label>
                <Input
                  value={m_songTitle}
                  onChange={(e) => setMSongTitle(e.target.value)}
                  placeholder="E.g. Bohemian Rhapsody"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Artist Name
                </label>
                <Input
                  value={m_artistName}
                  onChange={(e) => setMArtistName(e.target.value)}
                  placeholder="E.g. Queen"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Age *
                </label>
                <Input
                  type="number"
                  min={0}
                  value={m_age}
                  onChange={(e) => setMAge(e.target.value)}
                  placeholder="Age on competition day"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Studio *
                </label>
                <Input
                  value={m_studioName}
                  onChange={(e) => setMStudioName(e.target.value)}
                  placeholder="Studio name"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Teacher *
                </label>
                <Input
                  value={m_teacherName}
                  onChange={(e) => setMTeacherName(e.target.value)}
                  placeholder="Teacher / instructor name"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Music Delivery *
                </label>
                <Select
                  value={m_musicDeliveryMethod}
                  onValueChange={(v) => setMMusicDeliveryMethod(v as 'usb' | 'upload')}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="usb" className="text-white">USB on competition day</SelectItem>
                    <SelectItem value="upload" className="text-white">Digital upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Fee Amount *
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={m_totalFee}
                  onChange={(e) => setMTotalFee(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  Email *
                </label>
                <Input
                  type="email"
                  value={m_email}
                  onChange={(e) => setMEmail(e.target.value)}
                  placeholder="dancer@example.com"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              {m_isMinor && (
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-1 block">
                    Parent / Guardian Name * (required for minors)
                  </label>
                  <Input
                    value={m_parentGuardianName}
                    onChange={(e) => setMParentGuardianName(e.target.value)}
                    placeholder="Full legal name"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => { setShowAddManual(false); resetManualForm(); }}
              disabled={addingManual}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2E75B6] hover:bg-[#1e5a96] text-white"
              onClick={submitManual}
              disabled={addingManual}
            >
              {addingManual ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Adding & syncing…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add & Sync
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
