import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { parseVideoUrl } from '@/lib/videoEmbed';

type Row = Database['public']['Tables']['gallery_videos']['Row'];

export default function VideosTab() {
  const [history, setHistory] = useState<Row[]>([]);
  const [topaz2, setTopaz2] = useState<Row[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState<'history' | 'topaz2'>('history');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery_videos').select('*').order('created_at', { ascending: false });
    const rows = data ?? [];
    setHistory(rows.filter((r) => r.section === 'history'));
    setTopaz2(rows.filter((r) => r.section === 'topaz2'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addVideo() {
    const parsed = parseVideoUrl(url);
    if (!title.trim() || !parsed) {
      alert('Enter a title and a valid YouTube or Vimeo URL.');
      return;
    }
    const { error } = await supabase.from('gallery_videos').insert({
      title: title.trim(),
      url: url.trim(),
      section,
      is_visible: true,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setTitle('');
    setUrl('');
    load();
  }

  async function toggle(id: string, v: boolean) {
    await supabase.from('gallery_videos').update({ is_visible: v }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this video?')) return;
    await supabase.from('gallery_videos').delete().eq('id', id);
    load();
  }

  function VideoList({ rows }: { rows: Row[] }) {
    if (loading) return <p className="text-white/50 text-sm">Loading…</p>;
    if (!rows.length) return <p className="text-white/50 text-sm">No videos.</p>;
    return (
      <div className="space-y-3">
        {rows.map((v) => (
          <div
            key={v.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-white/10 p-4 bg-black/30"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{v.title}</p>
              <p className="text-xs text-white/50 truncate">{v.url}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Label className="text-white/60 text-xs">Visible</Label>
                <Switch checked={v.is_visible} onCheckedChange={(x) => toggle(v.id, x)} />
              </div>
              <Button size="sm" variant="ghost" className="text-red-400" onClick={() => remove(v.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Video management</h1>
        <p className="text-sm text-white/50 mt-1">Paste a YouTube or Vimeo link, assign to Topaz Memories or TOPAZ 2.0.</p>
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
          <Label className="text-white/70">YouTube or Vimeo URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <Label className="text-white/70">Section</Label>
          <Select value={section} onValueChange={(v) => setSection(v as 'history' | 'topaz2')}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="history">Topaz Memories</SelectItem>
              <SelectItem value="topaz2">TOPAZ 2.0</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addVideo} className="bg-[#2E75B6] hover:bg-[#1F4E78]">
          Add video
        </Button>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="history">Topaz Memories</TabsTrigger>
          <TabsTrigger value="topaz2">TOPAZ 2.0</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-6">
          <VideoList rows={history} />
        </TabsContent>
        <TabsContent value="topaz2" className="mt-6">
          <VideoList rows={topaz2} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
