import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  CalendarCheck,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RegRow = Database['public']['Tables']['registrations']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type TabId = 'overview' | 'registrations' | 'gallery' | 'events' | 'shop' | 'settings';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  pending:    { label: 'Pending',    color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'text-[#10b981]', bg: 'bg-[#10b981]/10', icon: CheckCircle2 },
  waitlisted: { label: 'Waitlisted', color: 'text-[#2E75B6]', bg: 'bg-[#2E75B6]/10', icon: AlertCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', icon: XCircle },
};

function entryLabel(groupSize: string): string {
  if (groupSize.startsWith('Solo'))        return 'Solo';
  if (groupSize.startsWith('Duo'))         return 'Duo';
  if (groupSize.startsWith('Trio'))        return 'Trio';
  if (groupSize.startsWith('Small Group')) return 'Small Group';
  if (groupSize.startsWith('Large Group')) return 'Large Group';
  if (groupSize.startsWith('Production'))  return 'Production';
  return groupSize;
}

// ── Stat card: icon in colored rounded square on left, number on right ────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  onClick,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof ClipboardList;
  accent: 'blue' | 'amber' | 'green' | 'slate';
  onClick?: () => void;
  hint?: string;
}) {
  const accents: Record<typeof accent, { bg: string; text: string }> = {
    blue:  { bg: 'bg-[#2E75B6]/15', text: 'text-[#2E75B6]' },
    amber: { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]' },
    green: { bg: 'bg-[#10b981]/15', text: 'text-[#10b981]' },
    slate: { bg: 'bg-[#1e1e1e]',    text: 'text-[#e5e7eb]' },
  } as const;
  const a = accents[accent];

  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group w-full text-left bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4 transition-all',
        onClick && 'hover:border-[#2E75B6]/40 hover:bg-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75B6]/40'
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', a.bg)}>
        <Icon className={cn('w-5 h-5', a.text)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-black text-white tabular-nums leading-none">{value}</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280] mt-1.5 truncate">
          {label}
        </p>
        {hint && (
          <p className="text-[10px] text-[#6b7280] mt-0.5 truncate">{hint}</p>
        )}
      </div>
      {onClick && (
        <ArrowUpRight className="w-4 h-4 text-[#6b7280] group-hover:text-[#2E75B6] transition-colors shrink-0" />
      )}
    </Tag>
  );
}

// ── Skeleton card matching StatCard shape ─────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4 animate-pulse motion-reduce:animate-none">
      <div className="w-11 h-11 rounded-xl bg-[#1e1e1e] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#1e1e1e] rounded w-12" />
        <div className="h-3 bg-[#1e1e1e] rounded w-20" />
      </div>
    </div>
  );
}

export default function OverviewTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const [regs, setRegs] = useState<RegRow[]>([]);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: regData }, { data: evData }] = await Promise.all([
      supabase.from('registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').eq('is_active', true).order('date').limit(1),
    ]);
    setRegs((regData as RegRow[]) ?? []);
    setEvent(evData?.[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalRegs = regs.length;
  const totalFee = regs.reduce((s, r) => s + Number(r.total_fee), 0);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    regs.forEach((r) => { map[r.status] = (map[r.status] ?? 0) + 1; });
    return map;
  }, [regs]);

  const byEntryType = useMemo(() => {
    const map: Record<string, number> = {};
    regs.forEach((r) => {
      const label = entryLabel(r.group_size);
      map[label] = (map[label] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [regs]);

  const recentRegs = useMemo(() => regs.slice(0, 5), [regs]);

  const syncStats = useMemo(() => ({
    synced:  regs.filter((r) => r.scoring_app_sync_status === 'synced').length,
    pending: regs.filter((r) => r.scoring_app_sync_status === 'pending').length,
    failed:  regs.filter((r) => r.scoring_app_sync_status === 'failed').length,
    skipped: regs.filter((r) => r.scoring_app_sync_status === 'skipped').length,
  }), [regs]);

  const regStatus = useMemo(() => {
    if (!event) return null;
    const now = new Date();
    const open  = event.registration_open_date  ? new Date(event.registration_open_date)  : null;
    const close = event.registration_close_date ? new Date(event.registration_close_date) : null;
    if (open && now < open)    return { open: false, label: `Opens ${open.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    if (close && now >= close) return { open: false, label: `Closed ${close.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    if (close) return { open: true, label: `Open · closes ${close.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    return { open: true, label: 'Open' };
  }, [event]);

  const maxEntryCount = byEntryType[0]?.[1] ?? 1;

  return (
    <div className="space-y-8">
      {/* ── Page header with subtle gradient separator ──────────────────────── */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-[#6b7280] mt-1 font-medium">
              {event
                ? `${event.name} · ${new Date(event.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}`
                : 'TOPAZ 2.0 Admin'}
            </p>
          </div>
          {regStatus && (
            <div
              className={cn(
                'inline-flex items-center gap-2.5 rounded-lg px-4 py-2.5 border text-xs shrink-0',
                regStatus.open
                  ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                  : 'bg-[#1e1e1e] border-[#2a2a2a] text-[#e5e7eb]'
              )}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <div className="leading-tight">
                <p className="font-bold uppercase tracking-wider">
                  Registration {regStatus.open ? 'Open' : 'Closed'}
                </p>
                <p className="text-[10px] opacity-70 font-medium">{regStatus.label}</p>
              </div>
            </div>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-[#2E75B6]/30 via-[#1e1e1e] to-transparent" />
      </header>

      {/* ── Top stat cards row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Registrations"
              value={totalRegs}
              icon={ClipboardList}
              accent="blue"
              onClick={() => onNavigate('registrations')}
              hint="View all"
            />
            <StatCard
              label="Pending Review"
              value={byStatus['pending'] ?? 0}
              icon={Clock}
              accent="amber"
            />
            <StatCard
              label="Confirmed"
              value={byStatus['confirmed'] ?? 0}
              icon={CheckCircle2}
              accent="green"
            />
            <StatCard
              label="Total Entry Fees"
              value={`$${totalFee.toLocaleString()}`}
              icon={DollarSign}
              accent="blue"
            />
          </>
        )}
      </div>

      {/* ── Scoring App Sync card ───────────────────────────────────────────── */}
      {!loading && totalRegs > 0 && (
        <div
          className={cn(
            'border rounded-xl p-5',
            syncStats.failed > 0
              ? 'bg-[#f59e0b]/5 border-[#f59e0b]/30'
              : 'bg-[#111111] border-[#1e1e1e]'
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  syncStats.failed > 0 ? 'bg-[#f59e0b]/15' : 'bg-[#2E75B6]/15'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', syncStats.failed > 0 ? 'text-[#f59e0b]' : 'text-[#2E75B6]')} />
              </div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Scoring App Sync</h3>
            </div>
            {syncStats.failed > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('registrations')}
                className="text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors font-bold uppercase tracking-wider"
              >
                View Failed →
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SyncStat label="Synced"  value={syncStats.synced}  color="text-[#10b981]" />
            <SyncStat label="Pending" value={syncStats.pending} color="text-[#6b7280]" />
            <SyncStat label="Failed"  value={syncStats.failed}  color={syncStats.failed > 0 ? 'text-[#ef4444]' : 'text-[#374151]'} />
            <SyncStat label="Skipped" value={syncStats.skipped} color="text-[#2E75B6]" />
          </div>
          {syncStats.failed > 0 && (
            <p className="text-xs text-[#f59e0b] mt-4 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {syncStats.failed} registration{syncStats.failed !== 1 ? 's' : ''} failed to sync — open Registrations and click "Sync All Unsync'd".
            </p>
          )}
        </div>
      )}

      {/* ── Two-column lower section: entries by type + recent activity ─────── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Entries by type — horizontal bars */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#2E75B6]/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#2E75B6]" />
            </div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">Entries by Type</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-[#1e1e1e] rounded animate-pulse motion-reduce:animate-none" />
              ))}
            </div>
          ) : byEntryType.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No entries yet"
              body="Registrations will appear here as they come in."
            />
          ) : (
            <div className="space-y-3">
              {byEntryType.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#e5e7eb]">{type}</span>
                    <span className="text-xs font-bold text-white tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2E75B6] to-[#5B9BD5] rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                      style={{ width: `${(count / maxEntryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2E75B6]/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#2E75B6]" />
              </div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Recent Activity</h3>
            </div>
            {recentRegs.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('registrations')}
                className="text-[10px] font-bold uppercase tracking-wider text-[#2E75B6] hover:text-[#5B9BD5] transition-colors"
              >
                View all →
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#1e1e1e] rounded animate-pulse motion-reduce:animate-none" />
              ))}
            </div>
          ) : recentRegs.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No activity yet"
              body="New registrations will show up here."
            />
          ) : (
            <ul className="space-y-1">
              {recentRegs.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG['pending'];
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-2.5 border-b border-[#1e1e1e] last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm truncate">{r.contestant_name}</p>
                      <p className="text-xs text-[#6b7280] truncate">
                        {r.studio_name} · {entryLabel(r.group_size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#6b7280] tabular-nums">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Event hero card — large, prominent, gradient ───────────────────── */}
      {event && (
        <div className="relative overflow-hidden rounded-2xl border border-[#2E75B6]/30 bg-gradient-to-br from-[#2E75B6]/20 via-[#1F4E78]/10 to-[#0a0a0a] p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2E75B6]/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" aria-hidden />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2E75B6]/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none" aria-hidden />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7EB8E8] mb-3">
              Next Competition
            </p>
            <h3 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase leading-none mb-4">
              {event.name}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                  <CalendarCheck className="w-5 h-5 text-[#7EB8E8]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#7EB8E8]">Date</p>
                  <p className="text-base font-bold text-white truncate">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                    <MapPin className="w-5 h-5 text-[#7EB8E8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7EB8E8]">Location</p>
                    <p className="text-base font-bold text-white truncate">{event.location}</p>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E75B6] hover:bg-[#1F4E78] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(46,117,182,0.3)]"
            >
              Edit Event Details
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SyncStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center bg-[#0a0a0a] rounded-lg py-3 border border-[#1e1e1e]">
      <p className={cn('text-2xl font-black tabular-nums', color)}>{value}</p>
      <p className="text-[10px] text-[#6b7280] mt-1 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-[#6b7280]" />
      </div>
      <p className="text-sm font-bold text-[#e5e7eb]">{title}</p>
      <p className="text-xs text-[#6b7280] mt-1">{body}</p>
    </div>
  );
}
