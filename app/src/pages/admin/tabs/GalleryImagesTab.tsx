import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Upload } from 'lucide-react';

type Row = Database['public']['Tables']['gallery_images']['Row'];

function storagePathFromPublicUrl(url: string): string | null {
  const marker = '/object/public/gallery/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

function GallerySection({ section, label }: { section: string; label: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('section', section)
      .order('created_at', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, [section]);

  useEffect(() => {
    load();
  }, [load]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const path = `${section}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('gallery').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      alert(upErr.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('gallery').getPublicUrl(path);
    const { error: insErr } = await supabase.from('gallery_images').insert({
      section,
      url: publicUrl,
      filename: file.name,
      caption: null,
      is_visible: true,
      is_members_only: false,
    });
    if (insErr) alert(insErr.message);
    setUploading(false);
    load();
  }

  async function updateRow(id: string, patch: Partial<Row>) {
    await supabase.from('gallery_images').update(patch).eq('id', id);
    load();
  }

  async function removeRow(row: Row) {
    if (!confirm('Delete this photo from the gallery?')) return;
    const path = storagePathFromPublicUrl(row.url);
    if (path) await supabase.storage.from('gallery').remove([path]);
    await supabase.from('gallery_images').delete().eq('id', row.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          className="border-slate-600 text-white"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden flex flex-col"
            >
              <div className="aspect-video bg-black flex items-center justify-center">
                <img src={r.url} alt={r.caption ?? r.filename ?? ''} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <p className="text-xs text-slate-500 truncate" title={r.filename ?? undefined}>
                  {r.filename}
                </p>
                <p className="text-sm text-slate-300 line-clamp-2">{r.caption || '—'}</p>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Visible</span>
                  <Switch
                    checked={r.is_visible}
                    onCheckedChange={(v) => updateRow(r.id, { is_visible: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Members only</span>
                  <Switch
                    checked={r.is_members_only}
                    onCheckedChange={(v) => updateRow(r.id, { is_members_only: v })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 mt-auto"
                  onClick={() => removeRow(r)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 ? (
        <p className="text-slate-500 text-sm">No images in {label} yet.</p>
      ) : null}
    </div>
  );
}

export default function GalleryImagesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Gallery photos</h2>
        <p className="text-sm text-slate-400">Upload and manage public and members-only gallery images.</p>
      </div>
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-700">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="topaz2">TOPAZ 2.0</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-6">
          <GallerySection section="history" label="History" />
        </TabsContent>
        <TabsContent value="topaz2" className="mt-6">
          <GallerySection section="topaz2" label="TOPAZ 2.0" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
