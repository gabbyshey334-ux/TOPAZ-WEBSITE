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
import { Trash2 } from 'lucide-react';

type Row = Database['public']['Tables']['announcements']['Row'];

export default function AnnouncementsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('announcements').insert({
      title: title.trim(),
      body: body.trim(),
      is_active: true,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setOpen(false);
      setTitle('');
      setBody('');
      load();
    }
  }

  async function toggleActive(id: string, is_active: boolean) {
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Announcements</h2>
          <p className="text-sm text-slate-400">Visible to approved members in the members area.</p>
        </div>
        <Button className="bg-[#2E75B6] hover:bg-[#1F4E78]" onClick={() => setOpen(true)}>
          Add Announcement
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-950 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2E75B6]" disabled={saving} onClick={add}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 flex flex-col lg:flex-row lg:items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg">{r.title}</h3>
                <p className="text-slate-300 text-sm mt-2 whitespace-pre-wrap">{r.body}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">Active</span>
                <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive(r.id, v)} />
                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => remove(r.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
