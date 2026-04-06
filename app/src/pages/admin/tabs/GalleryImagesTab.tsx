import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Upload } from 'lucide-react';

type Row = Database['public']['Tables']['gallery_images']['Row'];

export default function GalleryImagesTab() {
  const [history, setHistory] = useState<Row[]>([]);
  const [topaz2, setTopaz2] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
    const rows = data ?? [];
    setHistory(rows.filter((r) => r.section === 'history'));
    setTopaz2(rows.filter((r) => r.section === 'topaz2'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(id: string, field: 'is_visible' | 'is_members_only', value: boolean) {
    await supabase.from('gallery_images').update({ [field]: value }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Remove this image from the gallery?')) return;
    await supabase.from('gallery_images').delete().eq('id', id);
    load();
  }

  async function upload(section: 'history' | 'topaz2', file: File) {
    const path = `${section}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('gallery').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      alert(upErr.message);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('gallery').getPublicUrl(path);
    const { error: insErr } = await supabase.from('gallery_images').insert({
      url: publicUrl,
      filename: file.name,
      section,
      is_visible: true,
      is_members_only: false,
    });
    if (insErr) {
      alert(insErr.message);
      return;
    }
    load();
  }

  function ImageGrid({ rows, section }: { rows: Row[]; section: 'history' | 'topaz2' }) {
    return (
      <div className="space-y-4">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E75B6] text-white text-sm font-bold cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) upload(section, f);
            }}
          />
        </label>
        {loading ? (
          <p className="text-white/50 text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-white/50 text-sm">No images yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((img) => (
              <div key={img.id} className="rounded-xl border border-white/10 overflow-hidden bg-black/30">
                <div className="aspect-video bg-black/50 flex items-center justify-center">
                  <img src={img.url} alt="" className="max-h-48 w-full object-contain" />
                </div>
                <div className="p-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-white/70 text-xs">Public visible</Label>
                    <Switch
                      checked={img.is_visible}
                      onCheckedChange={(v) => toggle(img.id, 'is_visible', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-white/70 text-xs">Members only</Label>
                    <Switch
                      checked={img.is_members_only}
                      onCheckedChange={(v) => toggle(img.id, 'is_members_only', v)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 w-full"
                    onClick={() => remove(img.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gallery management</h1>
        <p className="text-sm text-white/50 mt-1">History vs TOPAZ 2.0 photos, visibility, and member-only access.</p>
      </div>
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="history">History photos</TabsTrigger>
          <TabsTrigger value="topaz2">TOPAZ 2.0 photos</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-6">
          <ImageGrid rows={history} section="history" />
        </TabsContent>
        <TabsContent value="topaz2" className="mt-6">
          <ImageGrid rows={topaz2} section="topaz2" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
