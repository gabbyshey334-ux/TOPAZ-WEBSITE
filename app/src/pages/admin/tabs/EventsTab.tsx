import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle2, AlertCircle, Plus, Loader2 } from 'lucide-react';

type Row = Database['public']['Tables']['events']['Row'];

export default function EventsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    registration_open_date: '',
    registration_close_date: '',
    is_active: true,
  });
  const [createError, setCreateError] = useState<string | null>(null);

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

  function resetCreateForm() {
    setNewEvent({
      name: '',
      date: '',
      location: '',
      description: '',
      registration_open_date: '',
      registration_close_date: '',
      is_active: true,
    });
    setCreateError(null);
  }

  async function createEvent() {
    setCreateError(null);
    if (!newEvent.name.trim()) { setCreateError('Event name is required.'); return; }
    if (!newEvent.date) { setCreateError('Competition date is required.'); return; }
    if (!newEvent.location.trim()) { setCreateError('Location is required.'); return; }

    setCreating(true);
    const { error } = await supabase.from('events').insert({
      name: newEvent.name.trim(),
      date: newEvent.date,
      location: newEvent.location.trim(),
      description: newEvent.description.trim() || null,
      registration_open_date: newEvent.registration_open_date || null,
      registration_close_date: newEvent.registration_close_date || null,
      is_active: newEvent.is_active,
    });
    setCreating(false);

    if (error) {
      setCreateError(error.message);
      return;
    }
    setCreateOpen(false);
    resetCreateForm();
    load();
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Events</h1>
            <p className="text-sm text-[#6b7280] mt-1 font-medium">
              Changes appear immediately on the public website — no deployment needed.
            </p>
          </div>
          <Button
            className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold shadow-[0_0_12px_rgba(46,117,182,0.25)] shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
        <div className="h-px bg-gradient-to-r from-[#2E75B6]/30 via-[#1e1e1e] to-transparent" />
      </header>

      {/* Create event dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) resetCreateForm();
        }}
      >
        <DialogContent className="bg-slate-950 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Event Name</Label>
              <Input
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                placeholder="TOPAZ 2.0 — Spring 2027"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Competition Date</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="mt-1 bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Location</Label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="mt-1 bg-slate-900 border-slate-600 text-white"
                  placeholder="Seaside Convention Center, OR"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Description (optional)</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="mt-1 bg-slate-900 border-slate-600 text-white min-h-[80px]"
                placeholder="Any additional details about this event…"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Registration Opens</Label>
                <Input
                  type="date"
                  value={newEvent.registration_open_date}
                  onChange={(e) => setNewEvent({ ...newEvent, registration_open_date: e.target.value })}
                  className="mt-1 bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Registration Closes</Label>
                <Input
                  type="date"
                  value={newEvent.registration_close_date}
                  onChange={(e) => setNewEvent({ ...newEvent, registration_close_date: e.target.value })}
                  className="mt-1 bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={newEvent.is_active}
                onCheckedChange={(v) => setNewEvent({ ...newEvent, is_active: v })}
              />
              <div>
                <p className="text-sm text-white font-medium">Show on public website</p>
                <p className="text-xs text-slate-500">When off, this event is hidden from the public site</p>
              </div>
            </div>
            {createError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{createError}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => { setCreateOpen(false); resetCreateForm(); }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2E75B6] hover:bg-[#1F4E78] min-w-[130px]"
              onClick={createEvent}
              disabled={creating}
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating…
                </span>
              ) : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <p className="text-slate-500 text-sm">No events yet. Click “Add Event” to create one.</p>
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
