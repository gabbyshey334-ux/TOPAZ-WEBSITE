import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { CheckCircle2, AlertCircle, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAdminEventOptional } from '@/contexts/AdminEventContext';

type Row = Database['public']['Tables']['events']['Row'];
type ScoringCompetition = { id: string; name: string };

function formatDbError(error: { message: string; code?: string }): string {
  if (error.code === '42501' || /permission|policy|row-level security/i.test(error.message)) {
    return `${error.message} — Your login email may not be in the admin allowlist. Add it to VITE_ADMIN_EMAILS in Vercel and to the admin_emails table in Supabase, then sign in again.`;
  }
  return error.message;
}

export default function EventsTab() {
  const adminEvents = useAdminEventOptional();
  const [rows, setRows] = useState<Row[]>([]);
  const [scoringCompetitions, setScoringCompetitions] = useState<ScoringCompetition[]>([]);
  const [scoringCompetitionsLoading, setScoringCompetitionsLoading] = useState(false);
  const [scoringCompetitionsError, setScoringCompetitionsError] = useState<string | null>(null);
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
    scoring_competition_id: '',
    is_active: false,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [staffEmails, setStaffEmails] = useState<string[]>([]);
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffEmailError, setStaffEmailError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  const loadStaffEmails = useCallback(async () => {
    const { data, error } = await supabase.from('admin_emails').select('email').order('email');
    if (!error && data) {
      setStaffEmails(data.map((r) => r.email as string));
    }
  }, []);

  const loadScoringCompetitions = useCallback(async () => {
    setScoringCompetitionsLoading(true);
    setScoringCompetitionsError(null);
    const { data, error } = await supabase.functions.invoke('list-scoring-competitions', {
      body: {},
    });
    if (error) {
      setScoringCompetitions([]);
      setScoringCompetitionsError(error.message);
      setScoringCompetitionsLoading(false);
      return;
    }
    const list =
      data && typeof data === 'object' && Array.isArray((data as { competitions?: unknown[] }).competitions)
        ? ((data as { competitions: ScoringCompetition[] }).competitions ?? [])
        : [];
    setScoringCompetitions(
      list.filter(
        (c): c is ScoringCompetition =>
          !!c && typeof c.id === 'string' && typeof c.name === 'string',
      ),
    );
    setScoringCompetitionsLoading(false);
  }, []);

  useEffect(() => {
    load();
    loadStaffEmails();
    void loadScoringCompetitions();
  }, [load, loadStaffEmails, loadScoringCompetitions]);

  async function save(row: Row): Promise<string | null> {
    try {
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
          scoring_competition_id: row.scoring_competition_id?.trim() || null,
        })
        .eq('id', row.id);
      if (error) return formatDbError(error);
      await load();
      void adminEvents?.refresh();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      await load();
      void adminEvents?.refresh();
    }
  }

  async function addStaffEmail() {
    setStaffEmailError(null);
    const email = staffEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setStaffEmailError('Enter a valid email address.');
      return;
    }
    const { error } = await supabase.from('admin_emails').insert({ email });
    if (error) {
      setStaffEmailError(formatDbError(error));
      return;
    }
    setStaffEmailInput('');
    loadStaffEmails();
  }

  async function removeStaffEmail(email: string) {
    setStaffEmailError(null);
    const { error } = await supabase.from('admin_emails').delete().eq('email', email);
    if (error) {
      setStaffEmailError(formatDbError(error));
      return;
    }
    loadStaffEmails();
  }

  function resetCreateForm() {
    setNewEvent({
      name: '',
      date: '',
      location: '',
      description: '',
      registration_open_date: '',
      registration_close_date: '',
      scoring_competition_id: '',
      is_active: false,
    });
    setCreateError(null);
  }

  async function createEvent() {
    setCreateError(null);
    if (!newEvent.name.trim()) { setCreateError('Event name is required.'); return; }
    if (!newEvent.date) { setCreateError('Competition date is required.'); return; }
    if (!newEvent.location.trim()) { setCreateError('Location is required.'); return; }

    setCreating(true);
    try {
      const { error } = await supabase.from('events').insert({
        name: newEvent.name.trim(),
        date: newEvent.date,
        location: newEvent.location.trim(),
        description: newEvent.description.trim() || null,
        registration_open_date: newEvent.registration_open_date || null,
        registration_close_date: newEvent.registration_close_date || null,
        scoring_competition_id: newEvent.scoring_competition_id.trim() || null,
        is_active: newEvent.is_active,
      });
      if (error) {
        setCreateError(formatDbError(error));
        return;
      }
      setCreateOpen(false);
      resetCreateForm();
      await load();
      void adminEvents?.refresh();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Changes here appear immediately on the public website — no deployment needed. Turn on
            &quot;Show on public website&quot; for every competition in your season; all of them appear on Events.
          </p>
        </div>
        <Button
          className="bg-[#2E75B6] hover:bg-[#1F4E78]"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

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
            <div>
              <Label className="text-slate-300">Scoring app competition ID</Label>
              <div className="mt-1 grid gap-2">
                <Select
                  value={newEvent.scoring_competition_id || undefined}
                  onValueChange={(v) => setNewEvent({ ...newEvent, scoring_competition_id: v })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue
                      placeholder={
                        scoringCompetitionsLoading
                          ? 'Loading competitions…'
                          : 'Choose competition from scoring app'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-600 text-white">
                    {scoringCompetitions.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="focus:bg-slate-800">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={newEvent.scoring_competition_id}
                onChange={(e) => setNewEvent({ ...newEvent, scoring_competition_id: e.target.value })}
                className="mt-1 bg-slate-900 border-slate-600 text-white font-mono text-xs"
                placeholder="UUID from scoring app → Competitions"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Select from the list above, or paste manually if needed.
              </p>
              {scoringCompetitionsError && (
                <p className="text-[10px] text-amber-400 mt-1">
                  Could not load competitions list: {scoringCompetitionsError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={newEvent.is_active}
                onCheckedChange={(v) => setNewEvent({ ...newEvent, is_active: v })}
              />
              <div>
                <p className="text-sm text-white font-medium">Show on public Events page</p>
                <p className="text-xs text-slate-500">
                  When on, listed on Events; Register on that card opens this competition&apos;s form.
                </p>
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

      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Staff admin access</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Emails listed here can create, edit, and delete events in this dashboard (via Supabase RLS).
          Also add the same emails to <code className="text-[#7EB8E8]">VITE_ADMIN_EMAILS</code> in Vercel so
          the admin login page allows them in.
        </p>
        <ul className="flex flex-wrap gap-2">
          {staffEmails.map((email) => (
            <li
              key={email}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200"
            >
              {email}
              <button
                type="button"
                className="text-red-400 hover:text-red-300"
                aria-label={`Remove ${email}`}
                onClick={() => removeStaffEmail(email)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Input
            type="email"
            value={staffEmailInput}
            onChange={(e) => setStaffEmailInput(e.target.value)}
            placeholder="staff@email.com"
            className="max-w-xs bg-slate-800 border-slate-600 text-white"
          />
          <Button type="button" variant="outline" className="border-slate-600" onClick={addStaffEmail}>
            Add staff email
          </Button>
        </div>
        {staffEmailError && (
          <p className="text-xs text-red-400">{staffEmailError}</p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((ev) => (
            <EventEditor
              key={ev.id}
              initial={ev}
              onSave={save}
              onDelete={deleteEvent}
              competitions={scoringCompetitions}
            />
          ))}
          {rows.length === 0 && (
            <p className="text-slate-500 text-sm">No events yet. Click “Add Event” to create one.</p>
          )}
        </div>
      )}
    </div>
  );
}

function EventEditor({
  initial,
  onSave,
  onDelete,
  competitions,
}: {
  initial: Row;
  onSave: (r: Row) => Promise<string | null>;
  onDelete: (id: string) => void;
  competitions: ScoringCompetition[];
}) {
  const [row, setRow] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { setRow(initial); }, [initial]);

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    const err = await onSave(row);
    setSaving(false);
    if (err) {
      setSaveError(err);
      return;
    }
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

        {/* Scoring competition link */}
        <div className="md:col-span-2">
          <Label className="text-slate-300">Scoring app competition ID</Label>
          <div className="mt-1 grid gap-2">
            <Select
              value={row.scoring_competition_id ?? undefined}
              onValueChange={(v) => setRow({ ...row, scoring_competition_id: v })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Choose competition from scoring app" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-600 text-white">
                {competitions.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="focus:bg-slate-800">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            value={row.scoring_competition_id ?? ''}
            onChange={(e) =>
              setRow({ ...row, scoring_competition_id: e.target.value.trim() || null })
            }
            className="mt-1 bg-slate-800 border-slate-600 text-white font-mono text-xs"
            placeholder="UUID from scoring app → Competitions"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Choose from the scoring app list or paste manually if needed.
          </p>
          {row.is_active && !row.scoring_competition_id && (
            <p className="text-[10px] text-amber-400 mt-1">
              Active event has no scoring competition linked — registration sync will fail until you paste the UUID.
            </p>
          )}
        </div>

        {/* Active toggle */}
        <div className="md:col-span-2 flex items-center gap-3">
          <Switch
            checked={row.is_active}
            onCheckedChange={(v) => setRow({ ...row, is_active: v })}
          />
          <div>
            <p className="text-sm text-white font-medium">Show on public Events page</p>
            <p className="text-xs text-slate-500">
              When on, this competition appears on Events and dancers can click Register on its card.
            </p>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">{saveError}</p>
        </div>
      )}
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
        <Button
          onClick={() => onDelete(row.id)}
          variant="outline"
          className="border-red-700 text-red-400 hover:bg-red-950 hover:text-red-300"
        >
          Delete Event
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
