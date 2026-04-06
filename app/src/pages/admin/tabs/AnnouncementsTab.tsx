import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';

type Row = Database['public']['Tables']['announcements']['Row'];

export default function AnnouncementsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!title.trim() || !body.trim()) return;
    const { error } = await supabase.from('announcements').insert({
      title: title.trim(),
      body: body.trim(),
      is_active: true,
    });
    if (error) alert(error.message);
    else {
      setTitle('');
      setBody('');
      load();
    }
  }

  async function toggle(id: string, is_active: boolean) {
    await supabase.from('announcements').update({ is_active }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <p className="text-sm text-white/50 mt-1">Posts appear on the members dashboard notice board.</p>
      </div>

      <div className="rounded-xl border border-white/10 p-4 space-y-3 bg-black/20 max-w-xl">
        <div>
          <Label className="text-white/70">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <Label className="text-white/70">Body</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white min-h-[100px]"
          />
        </div>
        <Button onClick={add} className="bg-[#2E75B6] hover:bg-[#1F4E78]">
          Post announcement
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-white/50 text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-white/50 text-sm">No announcements yet.</p>
        ) : (
          rows.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-black/30"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{a.title}</p>
                <p className="text-sm text-white/60 whitespace-pre-wrap mt-1">{a.body}</p>
                <p className="text-xs text-white/40 mt-2">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Label className="text-white/60 text-xs">Active</Label>
                  <Switch checked={a.is_active} onCheckedChange={(v) => toggle(a.id, v)} />
                </div>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => remove(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
