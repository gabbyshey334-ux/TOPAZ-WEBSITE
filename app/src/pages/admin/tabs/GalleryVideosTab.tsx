import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { parseVideoUrl } from '@/lib/videoEmbed';

type Row = Database['public']['Tables']['gallery_videos']['Row'];

function VideoSection({ section, label }: { section: string; label: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_videos')
      .select('*')
      .eq('section', section)
      .order('created_at', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, [section]);

  useEffect(() => {
    load();
  }, [load]);

  async function addVideo() {
    const parsed = parseVideoUrl(url);
    if (!title.trim() || !parsed) {
      alert('Enter a valid YouTube or Vimeo URL and a title.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('gallery_videos').insert({
      section,
      title: title.trim(),
      url: url.trim(),
      is_visible: true,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setOpen(false);
      setTitle('');
      setUrl('');
      load();
    }
  }

  async function updateVisibility(id: string, is_visible: boolean) {
    await supabase.from('gallery_videos').update({ is_visible }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this video?')) return;
    await supabase.from('gallery_videos').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        className="bg-[#2E75B6] hover:bg-[#1F4E78]"
        onClick={() => setOpen(true)}
      >
        Add Video
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add video</DialogTitle>
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
              <Label className="text-slate-300">YouTube or Vimeo URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                placeholder="https://..."
              />
            </div>
            <p className="text-sm text-slate-400">
              Section: <span className="text-white font-medium">{label}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2E75B6]" disabled={saving} onClick={addVideo}>
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
              className="flex flex-col lg:flex-row lg:items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{r.title}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#7EB8E8] truncate block"
                >
                  {r.url}
                </a>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">Visible</span>
                <Switch checked={r.is_visible} onCheckedChange={(v) => updateVisibility(r.id, v)} />
                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => remove(r.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 ? (
        <p className="text-slate-500 text-sm">No videos in this section.</p>
      ) : null}
    </div>
  );
}

export default function GalleryVideosTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Gallery videos</h2>
        <p className="text-sm text-slate-400">Manage embedded YouTube and Vimeo videos.</p>
      </div>
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-700">
          <TabsTrigger value="history">Topaz Memories</TabsTrigger>
          <TabsTrigger value="topaz2">Topaz 2.0</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-6">
          <VideoSection section="history" label="Topaz Memories" />
        </TabsContent>
        <TabsContent value="topaz2" className="mt-6">
          <VideoSection section="topaz2" label="Topaz 2.0" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
