import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type Row = Database['public']['Tables']['events']['Row'];

export default function EventsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true })
      .limit(1);
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(row: Row) {
    const { error } = await supabase
      .from('events')
      .update({
        name: row.name,
        date: row.date,
        location: row.location,
        description: row.description,
        is_active: row.is_active,
      })
      .eq('id', row.id);
    if (error) alert(error.message);
    else load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-sm text-white/50 mt-1">Updates appear on the public schedule when the event is active.</p>
      </div>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : (
        <div className="space-y-8">
          {rows.map((ev) => (
            <EventEditor key={ev.id} initial={ev} onSave={save} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventEditor({
  initial,
  onSave,
}: {
  initial: Row;
  onSave: (r: Row) => void;
}) {
  const [row, setRow] = useState(initial);
  useEffect(() => setRow(initial), [initial]);

  return (
    <div className="rounded-xl border border-white/10 p-6 space-y-4 bg-black/20">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white/70">Name</Label>
          <Input
            value={row.name}
            onChange={(e) => setRow({ ...row, name: e.target.value })}
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <Label className="text-white/70">Date</Label>
          <Input
            type="date"
            value={row.date}
            onChange={(e) => setRow({ ...row, date: e.target.value })}
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-white/70">Location</Label>
          <Input
            value={row.location}
            onChange={(e) => setRow({ ...row, location: e.target.value })}
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-white/70">Description</Label>
          <Textarea
            value={row.description ?? ''}
            onChange={(e) => setRow({ ...row, description: e.target.value })}
            className="mt-1 bg-white/5 border-white/10 text-white min-h-[100px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={row.is_active} onCheckedChange={(v) => setRow({ ...row, is_active: v })} />
          <Label className="text-white/70">Active on public site</Label>
        </div>
      </div>
      <Button onClick={() => onSave(row)} className="bg-[#2E75B6] hover:bg-[#1F4E78]">
        Save event
      </Button>
    </div>
  );
}
