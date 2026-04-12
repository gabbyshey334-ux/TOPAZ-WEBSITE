import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Row = Database['public']['Tables']['events']['Row'];

export default function EventsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(row: Row) {
    const { error } = await supabase
      .from('events')
      .update({
        name: row.name,
        date: row.date,
        location: row.location,
        description: row.description,
        is_active: row.is_active,
        registration_open_date: row.registration_open_date || null,
        registration_close_date: row.registration_close_date || null,
      })
      .eq('id', row.id);
    if (error) alert(error.message);
    else load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Changes here appear immediately on the public website — no deployment needed.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((ev) => (
            <EventEditor key={ev.id} initial={ev} onSave={save} />
          ))}
          {rows.length === 0 && (
            <p className="text-slate-500 text-sm">No events found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function EventEditor({ initial, onSave }: { initial: Row; onSave: (r: Row) => void }) {
  const [row, setRow] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setRow(initial); }, [initial]);

  async function handleSave() {
    setSaving(true);
    await onSave(row);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Compute registration status for display
  const now = new Date();
  const openDate  = row.registration_open_date  ? new Date(row.registration_open_date)  : null;
  const closeDate = row.registration_close_date ? new Date(row.registration_close_date) : null;
  const regIsOpen  = openDate && closeDate && now >= openDate && now < closeDate;
  const regIsClosed = closeDate && now >= closeDate;
  const regNotOpen  = openDate && now < openDate;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-6 space-y-5">
      {/* Registration status indicator */}
      {row.registration_open_date && row.registration_close_date && (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
          regIsOpen  ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300' :
          regIsClosed ? 'bg-slate-800 border border-slate-700 text-slate-400' :
                       'bg-amber-950/40 border border-amber-800 text-amber-300'
        }`}>
          {regIsOpen   ? <CheckCircle2 className="w-3.5 h-3.5" /> :
           regNotOpen  ? <AlertCircle className="w-3.5 h-3.5" /> :
                        <AlertCircle className="w-3.5 h-3.5" />}
          Registration is currently{' '}
          <strong>
            {regIsOpen ? 'OPEN' : regNotOpen ? 'not yet open' : 'CLOSED'}
          </strong>
          {regIsOpen && closeDate && ` · closes ${closeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          {regNotOpen && openDate && ` · opens ${openDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Event name */}
        <div className="md:col-span-2">
          <Label className="text-slate-300">Event Name</Label>
          <Input
            value={row.name}
            onChange={(e) => setRow({ ...row, name: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {/* Competition date */}
        <div>
          <Label className="text-slate-300">Competition Date</Label>
          <Input
            type="date"
            value={row.date}
            onChange={(e) => setRow({ ...row, date: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {/* Location */}
        <div>
          <Label className="text-slate-300">Location</Label>
          <Input
            value={row.location}
            onChange={(e) => setRow({ ...row, location: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {/* Registration open date */}
        <div>
          <Label className="text-slate-300">Registration Opens</Label>
          <Input
            type="date"
            value={row.registration_open_date ?? ''}
            onChange={(e) => setRow({ ...row, registration_open_date: e.target.value || null })}
            className="mt-1 bg-slate-800 border-slate-600 text-white"
          />
          <p className="text-[10px] text-slate-500 mt-1">When visitors can start submitting registrations</p>
        </div>

        {/* Registration close date */}
        <div>
          <Label className="text-slate-300">Registration Closes</Label>
          <Input
            type="date"
            value={row.registration_close_date ?? ''}
            onChange={(e) => setRow({ ...row, registration_close_date: e.target.value || null })}
            className="mt-1 bg-slate-800 border-slate-600 text-white"
          />
          <p className="text-[10px] text-slate-500 mt-1">Deadline — form is hidden after this date</p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Label className="text-slate-300">Description (optional)</Label>
          <Textarea
            value={row.description ?? ''}
            onChange={(e) => setRow({ ...row, description: e.target.value })}
            className="mt-1 bg-slate-800 border-slate-600 text-white min-h-[90px]"
            placeholder="Any additional details about this event…"
          />
        </div>

        {/* Active toggle */}
        <div className="md:col-span-2 flex items-center gap-3">
          <Switch
            checked={row.is_active}
            onCheckedChange={(v) => setRow({ ...row, is_active: v })}
          />
          <div>
            <p className="text-sm text-white font-medium">Show on public website</p>
            <p className="text-xs text-slate-500">When off, this event is hidden from the public schedule</p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2E75B6] hover:bg-[#1F4E78] min-w-[120px]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : 'Save Changes'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
