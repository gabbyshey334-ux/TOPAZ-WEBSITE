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
  Plus,
  Mail,
  MailCheck,
  MailWarning,
  Send,
  Users,
  Link2,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Sync error classification ────────────────────────────────────────────────
// When the scoring app doesn't have the TOPAZ competition yet, the edge
// function returns an error containing "No matching competition". We surface
// this as a clear, human-readable banner so Nick knows exactly what to do.
const MISSING_COMPETITION_HINT =
  "No competition found in the scoring app. Please create 'The Return of TOPAZ 2.0' in the scoring app first, then try syncing again.";

function isMissingCompetitionError(err: string | null | undefined): boolean {
  if (!err) return false;
  const lower = err.toLowerCase();
  return (
    lower.includes('no matching competition') ||
    lower.includes('no competition found') ||
    lower.includes("'the return of topaz 2.0'")
  );
}

function friendlySyncError(err: string | null | undefined): string | null {
  if (!err) return null;
  if (isMissingCompetitionError(err)) return MISSING_COMPETITION_HINT;
  return err;
}

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

// ── Routine/link normalization + linked-row finder ───────────────────────────
// Normalizes a routine_name / group_link_code into the lookup key we use for
// grouping and for detecting linked entries. Trims + lowercases; returns '' when
// the underlying value is missing, which means "no key" (cannot be linked by
// that field).
function normalizeKey(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

function findLinkedRegistrations(row: RegRow, all: RegRow[]): RegRow[] {
  const routineKey = normalizeKey(row.routine_name);
  const codeKey = normalizeKey(row.group_link_code);
  if (!routineKey && !codeKey) return [];
  return all.filter((r) => {
    if (r.id === row.id) return false;
    const rRoutine = normalizeKey(r.routine_name);
    const rCode = normalizeKey(r.group_link_code);
    return (
      (routineKey !== '' && rRoutine === routineKey) ||
      (codeKey !== '' && rCode === codeKey)
    );
  });
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
  allRows,
  onClose,
  onStatusChange,
  onSyncComplete,
  onOpenRelated,
}: {
  row: RegRow | null;
  allRows: RegRow[];
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onSyncComplete: (id: string, updated: Partial<RegRow>) => void;
  onOpenRelated: (row: RegRow) => void;
}) {
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  // Resend email state
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMsg, setResendMsg] = useState<{ text: string; error: boolean } | null>(null);

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

  async function handleResendEmail() {
    if (!row) return;
    setResendingEmail(true);
    setResendMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-registration-confirmation', {
        body: { registrationId: row.id },
      });
      if (error) throw new Error(error.message);
      if (data?.warning) {
        setResendMsg({ text: data.warning, error: true });
      } else {
        setResendMsg({ text: `Confirmation email sent to ${row.email}.`, error: false });
      }
      // Refresh email status columns from DB
      const { data: fresh } = await supabase
        .from('registrations')
        .select('confirmation_email_sent_at, confirmation_email_error')
        .eq('id', row.id)
        .single();
      if (fresh) onSyncComplete(row.id, fresh as Partial<RegRow>);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResendMsg({ text: `Failed to send: ${msg}`, error: true });
      const { data: fresh } = await supabase
        .from('registrations')
        .select('confirmation_email_sent_at, confirmation_email_error')
        .eq('id', row.id)
        .single();
      if (fresh) onSyncComplete(row.id, fresh as Partial<RegRow>);
    } finally {
      setResendingEmail(false);
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
              <Field label="Routine Name"    value={row.routine_name} />
              <Field label="Group Link Code" value={row.group_link_code ?? undefined} />
              <Field label="Category"        value={row.category} />
              <Field label="Entry Type"      value={row.group_size} />
              <Field label="Age Division"    value={row.age_division} />
              <Field label="Ability Level"   value={row.ability_level} />
            </div>
          </div>

          {/* Linked entries — other registrations sharing routine_name or group_link_code */}
          {(() => {
            const linked = findLinkedRegistrations(row, allRows);
            if (linked.length === 0) {
              // Still show the section for group entries so Nick knows the
              // linking mechanism exists and that nobody else is linked yet.
              if (row.group_size.startsWith('Solo')) return null;
              return (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5" />
                    Linked Entries
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 text-xs text-slate-400">
                    No other registrations share this routine name
                    {row.group_link_code ? ' or group link code' : ''} yet.
                  </div>
                </div>
              );
            }
            const linkedTotal = linked.reduce((sum, r) => sum + Number(r.total_fee || 0), 0);
            return (
              <div>
                <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5" />
                  Linked Entries ({linked.length})
                </p>
                <div className="bg-slate-900 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 px-1">
                    Same routine "{row.routine_name}"
                    {row.group_link_code ? ` · code ${row.group_link_code}` : ''} — group total ${(Number(row.total_fee || 0) + linkedTotal).toFixed(2)}
                  </p>
                  <div className="space-y-1.5">
                    {linked.map((lr) => {
                      const lcfg = statusCfg(lr.status);
                      const matchRoutine = normalizeKey(lr.routine_name) === normalizeKey(row.routine_name) && normalizeKey(row.routine_name) !== '';
                      const matchCode = normalizeKey(lr.group_link_code) === normalizeKey(row.group_link_code) && normalizeKey(row.group_link_code) !== '';
                      return (
                        <button
                          key={lr.id}
                          type="button"
                          onClick={() => onOpenRelated(lr)}
                          className="w-full text-left bg-slate-800/70 hover:bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-3 transition-colors group"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${lcfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-[#7EB8E8] transition-colors">
                              {lr.contestant_name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {entryType(lr.group_size)} · {lr.studio_name || '—'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-semibold text-white">${Number(lr.total_fee).toFixed(0)}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                              {matchRoutine && <span title="Matches routine name">name</span>}
                              {matchRoutine && matchCode && <span>·</span>}
                              {matchCode && <span title="Matches group link code">code</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

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
              {row.scoring_app_sync_error && (() => {
                const friendly = friendlySyncError(row.scoring_app_sync_error);
                const isMissing = isMissingCompetitionError(row.scoring_app_sync_error);
                return (
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 border',
                      isMissing
                        ? 'bg-amber-950/40 border-amber-800/60'
                        : 'bg-red-950/40 border-red-900/50'
                    )}
                  >
                    <p
                      className={cn(
                        'text-[10px] uppercase tracking-wider mb-0.5',
                        isMissing ? 'text-amber-400' : 'text-red-400'
                      )}
                    >
                      {isMissing ? 'Action needed' : 'Error'}
                    </p>
                    <p className={cn('text-xs', isMissing ? 'text-amber-200' : 'text-red-300')}>
                      {friendly}
                    </p>
                  </div>
                );
              })()}
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

          {/* Email Status */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7EB8E8] mb-3 font-semibold">Confirmation Email</p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {row.confirmation_email_sent_at ? (
                    <>
                      <MailCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Sent</span>
                    </>
                  ) : row.confirmation_email_error ? (
                    <>
                      <MailWarning className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Delivery Failed</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Not sent yet</span>
                    </>
                  )}
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3 bg-[#2E75B6] hover:bg-[#1e5a96] text-white text-xs"
                  onClick={handleResendEmail}
                  disabled={resendingEmail || !row.email}
                  title={!row.email ? 'No email on file' : 'Resend confirmation email'}
                >
                  {resendingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Send className="w-3.5 h-3.5 mr-1" />
                  )}
                  {resendingEmail ? 'Sending…' : 'Resend Confirmation Email'}
                </Button>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Recipient</p>
                <p className="text-xs text-slate-300 font-mono break-all">{row.email || '—'}</p>
              </div>

              {row.confirmation_email_sent_at && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Sent At</p>
                  <p className="text-xs text-slate-300">{new Date(row.confirmation_email_sent_at).toLocaleString()}</p>
                </div>
              )}

              {row.confirmation_email_error && (
                <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-red-400 mb-0.5">Last Error</p>
                  <p className="text-xs text-red-300 break-words">{row.confirmation_email_error}</p>
                </div>
              )}

              {resendMsg && (
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs',
                    resendMsg.error
                      ? 'bg-red-950/40 border border-red-900/50 text-red-300'
                      : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-300'
                  )}
                >
                  {resendMsg.text}
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
  const [viewMode, setViewMode] = useState<'all' | 'groups'>('all');
  const [detail, setDetail] = useState<RegRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Bulk sync state
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    successCount: number;
    failCount: number;
    failures: { name: string; error: string }[];
  } | null>(null);
  const [bulkResultText, setBulkResultText] = useState<{ text: string; error: boolean } | null>(null);
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
        || r.email.toLowerCase().includes(q)
        || (r.routine_name ?? '').toLowerCase().includes(q)
        || (r.group_link_code ?? '').toLowerCase().includes(q);
      const matchStatus    = statusFilter === 'all'    || r.status === statusFilter;
      const matchEntry     = entryTypeFilter === 'all' || entryType(r.group_size) === entryTypeFilter;
      const matchCategory  = categoryFilter === 'all'  || r.category === categoryFilter;
      return matchSearch && matchStatus && matchEntry && matchCategory;
    });
  }, [rows, search, statusFilter, entryTypeFilter, categoryFilter]);

  // Grouped-by-routine-name view.
  // Grouping key = lowercased/trimmed routine_name. Rows missing a routine name
  // fall into a single catch-all bucket so Nick can still see them.
  type RoutineGroup = {
    key: string;
    routineName: string;
    rows: RegRow[];
    totalFee: number;
    hasLinkCodeMismatch: boolean;
  };
  const groups = useMemo<RoutineGroup[]>(() => {
    const map = new Map<string, RoutineGroup>();
    for (const r of filtered) {
      const key = normalizeKey(r.routine_name) || '__no_routine__';
      const g = map.get(key);
      if (g) {
        g.rows.push(r);
        g.totalFee += Number(r.total_fee || 0);
      } else {
        map.set(key, {
          key,
          routineName: key === '__no_routine__' ? '(No routine name)' : r.routine_name,
          rows: [r],
          totalFee: Number(r.total_fee || 0),
          hasLinkCodeMismatch: false,
        });
      }
    }
    // Flag groups where dancers disagree on the group_link_code (a likely
    // data-entry error that Nick should notice).
    for (const g of map.values()) {
      const codes = new Set(
        g.rows.map((r) => normalizeKey(r.group_link_code)).filter((c) => c !== '')
      );
      g.hasLinkCodeMismatch = codes.size > 1;
    }
    return Array.from(map.values()).sort((a, b) => {
      if (b.rows.length !== a.rows.length) return b.rows.length - a.rows.length;
      return a.routineName.localeCompare(b.routineName);
    });
  }, [filtered]);

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
    setBulkResultText(null);

    let successCount = 0;
    const failures: { name: string; error: string }[] = [];

    for (let i = 0; i < targets.length; i++) {
      const reg = targets[i];
      let thisError: string | null = null;
      try {
        const { data, error } = await supabase.functions.invoke('sync-to-scoring-app', {
          body: { registrationId: reg.id },
        });
        if (error) {
          thisError = error.message || 'Unknown error';
        } else if (data && typeof data === 'object' && 'error' in data && data.error) {
          thisError = String((data as { error: unknown }).error);
        } else {
          successCount++;
        }
      } catch (e) {
        thisError = e instanceof Error ? e.message : String(e);
      }

      // Refresh this row from DB so we pick up the authoritative server-side error
      const { data: fresh } = await supabase
        .from('registrations')
        .select('scoring_app_sync_status, scoring_app_contestant_id, scoring_app_synced_at, scoring_app_sync_error')
        .eq('id', reg.id)
        .single();
      if (fresh) handleSyncComplete(reg.id, fresh as Partial<RegRow>);

      // Prefer the DB-persisted sync error (set by the edge function) over the
      // client-side error, because the edge function has richer context.
      if (thisError || (fresh && (fresh as { scoring_app_sync_status?: string }).scoring_app_sync_status === 'failed')) {
        const dbError = (fresh as { scoring_app_sync_error?: string | null } | null)?.scoring_app_sync_error;
        failures.push({
          name: reg.contestant_name,
          error: dbError || thisError || 'Unknown error',
        });
      }

      setBulkProgress({ done: i + 1, total: targets.length });

      // 500ms delay between calls
      if (i < targets.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setBulkSyncing(false);
    setBulkProgress(null);
    setBulkResult({ successCount, failCount: failures.length, failures });
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

      setBulkResultText({ text: syncMsg, error: syncError });
      setTimeout(() => setBulkResultText(null), 8000);

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

  // Rows that are currently stuck on "No matching competition" — they need
  // Nick to create the competition in the scoring app before any sync can work.
  const missingCompetitionRows = useMemo(
    () => rows.filter(
      (r) =>
        r.scoring_app_sync_status === 'failed' &&
        isMissingCompetitionError(r.scoring_app_sync_error)
    ),
    [rows]
  );

  return (
    <div className="space-y-6">
      {/* Missing-competition warning banner — shown whenever any failed sync
          is due to the scoring app not having the competition configured. */}
      {missingCompetitionRows.length > 0 && (
        <div className="rounded-xl border border-amber-700/60 bg-amber-950/40 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-200">
                {missingCompetitionRows.length} registration{missingCompetitionRows.length !== 1 ? 's' : ''} can't sync yet
              </p>
              <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
                {MISSING_COMPETITION_HINT}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual add / transient result banner */}
      {bulkResultText && (
        <div className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
          bulkResultText.error
            ? 'bg-red-950/40 border border-red-900/50 text-red-300'
            : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-300'
        )}>
          {bulkResultText.error ? (
            <XCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          {bulkResultText.text}
        </div>
      )}

      {/* Bulk sync completion summary with per-failure detail */}
      {bulkResult && (
        <div
          className={cn(
            'rounded-xl px-4 py-3 border text-sm',
            bulkResult.failCount === 0
              ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
              : bulkResult.successCount === 0
                ? 'bg-red-950/40 border-red-900/50 text-red-300'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
          )}
        >
          <div className="flex items-start gap-2">
            {bulkResult.failCount === 0 ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold">
                Bulk sync complete — {bulkResult.successCount} succeeded, {bulkResult.failCount} failed.
              </p>
              {bulkResult.failures.length > 0 && (
                <ul className="mt-2 space-y-1.5 text-xs">
                  {bulkResult.failures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span className="flex-1 min-w-0">
                        <span className="font-semibold text-white">{f.name}:</span>{' '}
                        <span className="text-amber-100/90">{friendlySyncError(f.error)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => setBulkResult(null)}
                className="text-[11px] underline text-slate-400 hover:text-white mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
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
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => { resetManualForm(); setShowAddManual(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manual Registration
          </Button>
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

      {/* View mode toggle — All Registrations vs grouped By Group (routine_name) */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setViewMode('all')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            viewMode === 'all'
              ? 'bg-[#2E75B6] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <List className="w-3.5 h-3.5" />
          All Registrations
          <span className={cn(
            'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
            viewMode === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
          )}>
            {filtered.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('groups')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            viewMode === 'groups'
              ? 'bg-[#2E75B6] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          By Group
          <span className={cn(
            'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
            viewMode === 'groups' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
          )}>
            {groups.length}
          </span>
        </button>
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
      ) : viewMode === 'groups' ? (
        <div className="space-y-5">
          {groups.map((g) => {
            const isMultiDancer = g.rows.length > 1;
            // Display an indicator of the entry type family (e.g. Duo/Trio) so
            // Nick can spot groups where dancers disagree on their group_size.
            const entryTypes = Array.from(new Set(g.rows.map((r) => entryType(r.group_size))));
            const entryTypeBadge = entryTypes.join(' · ');
            return (
              <div
                key={g.key}
                className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
              >
                {/* Group header */}
                <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isMultiDancer ? 'bg-[#2E75B6]/20 text-[#7EB8E8]' : 'bg-slate-800 text-slate-400'
                  )}>
                    {isMultiDancer ? <Users className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm leading-tight truncate">
                      {g.routineName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {g.rows.length} registration{g.rows.length === 1 ? '' : 's'} · {entryTypeBadge} · ${g.totalFee.toFixed(2)} total
                    </p>
                    {g.hasLinkCodeMismatch && (
                      <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Group link codes don't match — verify with dancers.
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-white tabular-nums">${g.totalFee.toFixed(0)}</p>
                    <p className="text-[10px] text-slate-500">total fees</p>
                  </div>
                </div>

                {/* Group body: each dancer */}
                <div className="divide-y divide-slate-800">
                  {g.rows.map((r) => {
                    const cfg = statusCfg(r.status);
                    const sc = syncCfg(r.scoring_app_sync_status ?? 'pending');
                    const SyncIcon = sc.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setDetail(r)}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{r.contestant_name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {r.studio_name} · {r.category}
                          </p>
                        </div>
                        <div className="shrink-0 text-right flex items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full',
                            sc.color, sc.bg
                          )}>
                            <SyncIcon className="w-2.5 h-2.5" />
                            {sc.label}
                          </span>
                          <span className="text-xs font-semibold text-white tabular-nums w-12 text-right">
                            ${Number(r.total_fee).toFixed(0)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
        allRows={rows}
        onClose={() => setDetail(null)}
        onStatusChange={setStatus}
        onSyncComplete={handleSyncComplete}
        onOpenRelated={(r) => setDetail(r)}
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
