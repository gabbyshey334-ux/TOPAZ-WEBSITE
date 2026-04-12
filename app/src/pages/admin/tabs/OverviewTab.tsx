import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { ClipboardList, CheckCircle2, Clock, XCircle, AlertCircle, DollarSign, Users, CalendarCheck, RefreshCw } from 'lucide-react';

type RegRow = Database['public']['Tables']['registrations']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type TabId = 'overview' | 'registrations' | 'gallery' | 'events' | 'shop' | 'settings';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  pending:    { label: 'Pending',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  waitlisted: { label: 'Waitlisted', color: 'text-blue-400',    bg: 'bg-blue-400/10',    icon: AlertCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',     bg: 'bg-red-400/10',     icon: XCircle },
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
  const totalRegs   = regs.length;
  const totalFee    = regs.reduce((s, r) => s + Number(r.total_fee), 0);

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
    const open   = event.registration_open_date  ? new Date(event.registration_open_date)  : null;
    const close  = event.registration_close_date ? new Date(event.registration_close_date) : null;
    if (open && now < open)  return { open: false, label: `Opens ${open.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    if (close && now >= close) return { open: false, label: `Closed ${close.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    if (close) return { open: true, label: `Open · closes ${close.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    return { open: true, label: 'Open' };
  }, [event]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          {event ? `${event.name} · ${new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'TOPAZ 2.0 Admin'}
        </p>
      </div>

      {/* Registration status banner */}
      {regStatus && (
        <div
          className={`flex items-center gap-3 rounded-xl px-5 py-4 border ${
            regStatus.open
              ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
              : 'bg-slate-800/50 border-slate-600 text-slate-300'
          }`}
        >
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Registration {regStatus.open ? 'is Open' : 'is Closed'}</p>
            <p className="text-sm opacity-70">{regStatus.label}</p>
          </div>
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total registrations */}
        <button
          type="button"
          onClick={() => onNavigate('registrations')}
          className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-left hover:border-[#2E75B6] transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <ClipboardList className="w-5 h-5 text-[#2E75B6]" />
            <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">View all →</span>
          </div>
          <p className="text-3xl font-black text-white">{totalRegs}</p>
          <p className="text-xs text-slate-400 mt-1">Total registrations</p>
        </button>

        {/* Pending */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{byStatus['pending'] ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Pending review</p>
        </div>

        {/* Confirmed */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{byStatus['confirmed'] ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Confirmed</p>
        </div>

        {/* Fees */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-[#2E75B6]" />
          </div>
          <p className="text-2xl font-black text-white">${totalFee.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total entry fees</p>
        </div>
      </div>

      {/* Scoring App Sync card — spans full width when failed > 0 */}
      {totalRegs > 0 && (
        <div className={`border rounded-xl p-5 ${
          syncStats.failed > 0
            ? 'bg-amber-950/20 border-amber-700/50'
            : 'bg-slate-900 border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${syncStats.failed > 0 ? 'text-amber-400' : 'text-[#2E75B6]'}`} />
              <h3 className="font-bold text-white text-sm">Scoring App Sync</h3>
            </div>
            {syncStats.failed > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('registrations')}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                View Failed →
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-400">{syncStats.synced}</p>
              <p className="text-xs text-slate-400 mt-0.5">Synced</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-400">{syncStats.pending}</p>
              <p className="text-xs text-slate-400 mt-0.5">Pending</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black ${syncStats.failed > 0 ? 'text-red-400' : 'text-slate-600'}`}>
                {syncStats.failed}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-blue-400">{syncStats.skipped}</p>
              <p className="text-xs text-slate-400 mt-0.5">Skipped</p>
            </div>
          </div>
          {syncStats.failed > 0 && (
            <p className="text-xs text-amber-300 mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {syncStats.failed} registration{syncStats.failed !== 1 ? 's' : ''} failed to sync. Go to Registrations and click "Sync All Unsync'd" to retry.
            </p>
          )}
        </div>
      )}

      {/* Two-column lower section */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Entries by type */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#2E75B6]" />
            <h3 className="font-bold text-white text-sm">Entries by Type</h3>
          </div>
          {byEntryType.length === 0 ? (
            <p className="text-slate-500 text-sm">No registrations yet.</p>
          ) : (
            <div className="space-y-2">
              {byEntryType.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-slate-300">{type}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                  <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2E75B6] rounded-full"
                      style={{ width: `${(count / totalRegs) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-[#2E75B6]" />
            <h3 className="font-bold text-white text-sm">Entries by Status</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = byStatus[key] ?? 0;
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-sm text-slate-300">{cfg.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${count > 0 ? cfg.color : 'text-slate-600'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent registrations */}
      {recentRegs.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">Recent Registrations</h3>
            <button
              type="button"
              onClick={() => onNavigate('registrations')}
              className="text-xs text-[#2E75B6] hover:text-[#7EB8E8] transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentRegs.map((r) => {
              const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG['pending'];
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-800 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white text-sm truncate">{r.contestant_name}</p>
                    <p className="text-xs text-slate-500 truncate">{r.studio_name} · {entryLabel(r.group_size)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event card */}
      {event && (
        <div className="bg-[#1F4E78]/20 border border-[#2E75B6]/30 rounded-xl p-5">
          <p className="text-xs font-mono uppercase tracking-widest text-[#7EB8E8] mb-2">Next Event</p>
          <p className="text-xl font-bold text-white">{event.name}</p>
          <p className="text-sm text-slate-300 mt-1">{event.location}</p>
          <p className="text-sm text-[#7EB8E8] mt-1 font-medium">
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="mt-4 text-xs text-[#2E75B6] hover:text-[#7EB8E8] transition-colors"
          >
            Edit event details →
          </button>
        </div>
      )}
    </div>
  );
}
