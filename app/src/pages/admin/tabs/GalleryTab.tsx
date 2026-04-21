import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Video,
  Plus,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  KeyRound,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { parseVideoUrl } from '@/lib/videoEmbed';
import { cn } from '@/lib/utils';

type ImgRow = Database['public']['Tables']['gallery_images']['Row'];
type VidRow = Database['public']['Tables']['gallery_videos']['Row'];
type GallerySettingsRow = Database['public']['Tables']['gallery_settings']['Row'];

// ── Storage path helper ───────────────────────────────────────────────────────
function storagePathFromPublicUrl(url: string): string | null {
  const marker = '/object/public/gallery/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

// ── Gallery Password Card ─────────────────────────────────────────────────────
function GalleryPasswordCard() {
  const [settings, setSettings] = useState<GallerySettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const savePassword = async () => {
    setSaveMsg('');
    if (!newPw.trim()) { setSaveMsg('Password cannot be empty.'); return; }
    if (newPw !== confirmPw) { setSaveMsg('Passwords do not match. Please try again.'); return; }

    setSaving(true);
    const { error } = await supabase
      .from('gallery_settings')
      .upsert({
        id: 1,
        gallery_password: newPw.trim(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setSaveMsg('Save failed. Please try again.');
    } else {
      const updated = {
        ...(settings ?? { id: 1, password_hint: null }),
        gallery_password: newPw.trim(),
        updated_at: new Date().toISOString(),
      } as GallerySettingsRow;
      setSettings(updated);
      setChanging(false);
      setNewPw('');
      setConfirmPw('');
      setSaveMsg('Password saved!');
      setTimeout(() => setSaveMsg(''), 4000);
    }
    setSaving(false);
  };

  const copyPassword = () => {
    if (!settings?.gallery_password) return;
    navigator.clipboard.writeText(settings.gallery_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cancelChange = () => {
    setChanging(false);
    setNewPw('');
    setConfirmPw('');
    setSaveMsg('');
  };

  const hasPassword = !!settings?.gallery_password;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#2E75B6]/20 rounded-lg flex items-center justify-center shrink-0">
          <KeyRound className="w-4 h-4 text-[#7EB8E8]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Event Gallery Password</h3>
          <p className="text-xs text-slate-400">
            Visitors need this password to view protected photos and videos.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
        </div>
      ) : !changing ? (
        <div className="space-y-3">
          {hasPassword ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="flex-1 text-sm font-mono text-white tracking-widest select-none">
                  {showCurrent ? settings!.gallery_password! : '••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={copyPassword}
                title="Copy password"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-500 transition-colors shrink-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setChanging(true)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0"
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              <LockOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-300 font-semibold mb-0.5">No password set</p>
                <p className="text-xs text-amber-400/80">
                  Protected items are publicly visible until you set a password.
                </p>
              </div>
            </div>
          )}

          {hasPassword && settings?.updated_at && (
            <p className="text-xs text-slate-500">
              Last updated: {new Date(settings.updated_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}

          {!hasPassword && (
            <Button
              size="sm"
              onClick={() => setChanging(true)}
              className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Set Password
            </Button>
          )}

          {saveMsg && (
            <p className={`text-xs flex items-center gap-1.5 ${saveMsg.includes('saved') ? 'text-emerald-400' : 'text-red-400'}`}>
              {saveMsg.includes('saved') && <CheckCircle2 className="w-3.5 h-3.5" />}
              {saveMsg}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter a password for event attendees…"
                className="bg-slate-800 border-slate-600 text-white pr-10 placeholder:text-slate-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Type it again to confirm…"
                className="bg-slate-800 border-slate-600 text-white pr-10 placeholder:text-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && savePassword()}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {saveMsg && (
            <p className="text-xs text-red-400">{saveMsg}</p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={savePassword}
              disabled={saving}
              className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white"
            >
              {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving…</> : 'Save Password'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelChange}
              disabled={saving}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline caption editor ─────────────────────────────────────────────────────
function CaptionEditor({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <p className="text-xs text-slate-400 truncate flex-1">{value || 'No caption'}</p>
        <button
          type="button"
          onClick={() => { setDraft(value ?? ''); setEditing(true); }}
          className="text-slate-500 hover:text-white shrink-0"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-6 text-xs bg-slate-800 border-slate-600 text-white px-2 flex-1"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onSave(draft.trim() || null); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <button type="button" onClick={() => { onSave(draft.trim() || null); setEditing(false); }} className="text-emerald-400 hover:text-emerald-300">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Photo section ─────────────────────────────────────────────────────────────
function PhotoSection({ section }: { section: string }) {
  const [rows, setRows] = useState<ImgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<ImgRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [lockingAll, setLockingAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('section', section)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    let list = (data as ImgRow[]) ?? [];

    // One-time baseline: if every row still has display_order === 0, we've never
    // persisted an order. Seed initial values from the current created_at sort
    // so existing items have a stable baseline the admin can reorder from.
    if (list.length > 0 && list.every((r) => (r.display_order ?? 0) === 0)) {
      await Promise.all(
        list.map((row, i) =>
          supabase.from('gallery_images').update({ display_order: i }).eq('id', row.id)
        )
      );
      list = list.map((r, i) => ({ ...r, display_order: i }));
    }

    setRows(list);
    setLoading(false);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);
      const path = `${section}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
      const { error: upErr } = await supabase.storage
        .from('gallery')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) { alert(`Upload failed for ${file.name}: ${upErr.message}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
      const { error: insErr } = await supabase.from('gallery_images').insert({
        section,
        url: publicUrl,
        filename: file.name,
        caption: null,
        is_visible: true,
        is_members_only: false,
        is_protected: false,
      });
      if (insErr) alert(`DB insert failed for ${file.name}: ${insErr.message}`);
    }
    setUploading(false);
    setUploadProgress('');
    load();
  }

  async function updateRow(id: string, patch: Partial<ImgRow>) {
    await supabase.from('gallery_images').update(patch).eq('id', id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
  }

  async function moveRow(id: string, dir: 'up' | 'down') {
    const idx = rows.findIndex((r) => r.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === rows.length - 1) return;
    const next = [...rows];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setRows(next);
    setReordering(true);
    await Promise.all(
      next.map((row, i) =>
        supabase.from('gallery_images').update({ display_order: i }).eq('id', row.id)
      )
    );
    setReordering(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const path = storagePathFromPublicUrl(deleteTarget.url);
    if (path) await supabase.storage.from('gallery').remove([path]);
    await supabase.from('gallery_images').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  }

  async function lockAll(protect: boolean) {
    setLockingAll(true);
    await supabase
      .from('gallery_images')
      .update({ is_protected: protect })
      .eq('section', section);
    setRows((prev) => prev.map((r) => ({ ...r, is_protected: protect })));
    setLockingAll(false);
  }

  const protectedCount = rows.filter((r) => r.is_protected).length;

  return (
    <div className="space-y-5">
      {/* Upload + batch lock buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={onFiles}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-800"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? uploadProgress || 'Uploading…' : 'Upload Photos'}
        </Button>

        {rows.length > 0 && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => lockAll(true)}
              disabled={lockingAll || protectedCount === rows.length}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40"
            >
              {lockingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Lock className="w-3.5 h-3.5 mr-1.5" />}
              Lock All
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => lockAll(false)}
              disabled={lockingAll || protectedCount === 0}
              className="border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-40"
            >
              {lockingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <LockOpen className="w-3.5 h-3.5 mr-1.5" />}
              Unlock All
            </Button>
            {protectedCount > 0 && (
              <span className="text-xs text-amber-400">
                {protectedCount} of {rows.length} protected
              </span>
            )}
          </>
        )}
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        You can select multiple photos at once.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No photos yet. Upload some above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, idx) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden flex flex-col"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-black flex items-center justify-center overflow-hidden relative">
                <img
                  src={r.url}
                  alt={r.caption ?? r.filename ?? ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {r.is_protected && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 rounded-full px-2 py-0.5">
                    <Lock className="w-2.5 h-2.5 text-white" />
                    <span className="text-[10px] font-bold text-white">Protected</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-3 space-y-2 flex-1 flex flex-col">
                <CaptionEditor
                  value={r.caption}
                  onSave={(v) => updateRow(r.id, { caption: v })}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={r.is_visible}
                        onCheckedChange={(v) => updateRow(r.id, { is_visible: v })}
                      />
                      <span className="text-xs text-slate-400">Visible</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Lock/unlock toggle */}
                    <button
                      type="button"
                      title={r.is_protected ? 'Protected — click to make public' : 'Public — click to password-protect'}
                      onClick={() => updateRow(r.id, { is_protected: !r.is_protected })}
                      className={`p-1.5 rounded transition-colors ${
                        r.is_protected
                          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {r.is_protected ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(r.id, 'up')}
                      disabled={idx === 0 || reordering}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(r.id, 'down')}
                      disabled={idx === rows.length - 1 || reordering}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(r)}
                      className="p-1 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Photo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300 py-2">
            This will permanently remove{' '}
            <strong className="text-white">{deleteTarget?.filename || 'this photo'}</strong> from the gallery. This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-slate-300" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Video section ─────────────────────────────────────────────────────────────
function VideoSection({ section }: { section: string }) {
  const [rows, setRows] = useState<VidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [lockingAll, setLockingAll] = useState(false);
  const [videoSizeError, setVideoSizeError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_videos')
      .select('*')
      .eq('section', section)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    let list = (data as VidRow[]) ?? [];

    if (list.length > 0 && list.every((r) => (r.display_order ?? 0) === 0)) {
      await Promise.all(
        list.map((row, i) =>
          supabase.from('gallery_videos').update({ display_order: i }).eq('id', row.id)
        )
      );
      list = list.map((r, i) => ({ ...r, display_order: i }));
    }

    setRows(list);
    setLoading(false);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const parsed = parseVideoUrl(url);
    if (parsed?.kind === 'youtube') {
      setUrlPreview(`https://img.youtube.com/vi/${parsed.id}/mqdefault.jpg`);
    } else {
      setUrlPreview(null);
    }
  }, [url]);

  function resetForm() {
    setTitle(''); setUrl(''); setVideoFile(null); setMode('url');
    setSaveProgress(''); setSaving(false); setUrlPreview(null);
    setVideoSizeError(null);
  }

  async function addVideo() {
    setVideoSizeError(null);

    if (!title.trim()) { alert('Title is required.'); return; }

    if (mode === 'file' && videoFile && videoFile.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoSizeError(
        'This file is too large (max 100MB). For best results, upload your video to YouTube and paste the link instead.'
      );
      return;
    }

    setSaving(true);

    if (mode === 'url') {
      const parsed = parseVideoUrl(url);
      if (!parsed) { alert('Enter a valid YouTube or Vimeo URL.'); setSaving(false); return; }
      const { error } = await supabase.from('gallery_videos').insert({
        section, title: title.trim(), url: url.trim(), is_visible: true, is_protected: false,
      });
      if (error) { alert(error.message); setSaving(false); return; }
    } else {
      if (!videoFile) { alert('Select a video file.'); setSaving(false); return; }
      setSaveProgress('Uploading video…');
      const path = `${section}/video-${crypto.randomUUID()}-${videoFile.name.replace(/[^\w.-]+/g, '_')}`;
      const { error: upErr } = await supabase.storage
        .from('gallery')
        .upload(path, videoFile, { cacheControl: '3600', upsert: false });
      if (upErr) { alert(`Upload failed: ${upErr.message}`); setSaving(false); setSaveProgress(''); return; }
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
      const { error: insErr } = await supabase.from('gallery_videos').insert({
        section, title: title.trim(), url: publicUrl, is_visible: true, is_protected: false,
      });
      if (insErr) { alert(insErr.message); setSaving(false); setSaveProgress(''); return; }
    }

    setSaving(false);
    setAddOpen(false);
    resetForm();
    load();
  }

  async function updateVideo(id: string, patch: Partial<VidRow>) {
    await supabase.from('gallery_videos').update(patch).eq('id', id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
  }

  async function moveVideo(id: string, dir: 'up' | 'down') {
    const idx = rows.findIndex((r) => r.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === rows.length - 1) return;
    const next = [...rows];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setRows(next);
    setReordering(true);
    await Promise.all(
      next.map((row, i) =>
        supabase.from('gallery_videos').update({ display_order: i }).eq('id', row.id)
      )
    );
    setReordering(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('gallery_videos').delete().eq('id', deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  }

  async function lockAll(protect: boolean) {
    setLockingAll(true);
    await supabase
      .from('gallery_videos')
      .update({ is_protected: protect })
      .eq('section', section);
    setRows((prev) => prev.map((r) => ({ ...r, is_protected: protect })));
    setLockingAll(false);
  }

  const protectedCount = rows.filter((r) => r.is_protected).length;

  return (
    <div className="space-y-5">
      {/* Add video + batch lock buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="bg-[#2E75B6] hover:bg-[#1F4E78]"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>

        {rows.length > 0 && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => lockAll(true)}
              disabled={lockingAll || protectedCount === rows.length}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40"
            >
              {lockingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Lock className="w-3.5 h-3.5 mr-1.5" />}
              Lock All
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => lockAll(false)}
              disabled={lockingAll || protectedCount === 0}
              className="border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-40"
            >
              {lockingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <LockOpen className="w-3.5 h-3.5 mr-1.5" />}
              Unlock All
            </Button>
            {protectedCount > 0 && (
              <span className="text-xs text-amber-400">
                {protectedCount} of {rows.length} protected
              </span>
            )}
          </>
        )}
      </div>

      {/* Add video dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) resetForm(); setAddOpen(o); }}>
        <DialogContent className="bg-slate-950 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                placeholder="E.g. TOPAZ 2.0 Highlights 2024"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('url')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all',
                  mode === 'url' ? 'bg-[#2E75B6]/20 border-[#2E75B6] text-[#7EB8E8]' : 'border-slate-700 text-slate-400 hover:border-slate-500'
                )}
              >
                <LinkIcon className="w-4 h-4" />
                YouTube / Vimeo URL
              </button>
              <button
                type="button"
                onClick={() => setMode('file')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all',
                  mode === 'file' ? 'bg-[#2E75B6]/20 border-[#2E75B6] text-[#7EB8E8]' : 'border-slate-700 text-slate-400 hover:border-slate-500'
                )}
              >
                <Upload className="w-4 h-4" />
                Upload file
              </button>
            </div>

            {mode === 'url' ? (
              <div>
                <Label className="text-slate-300">YouTube or Vimeo URL *</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 bg-slate-900 border-slate-600 text-white"
                  placeholder="https://www.youtube.com/watch?v=…"
                />
                {urlPreview && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                    <img src={urlPreview} alt="Video thumbnail" className="w-full h-auto" />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Video file *</Label>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                    Max 100MB
                  </span>
                </div>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setVideoSizeError(null);
                    if (f && f.size > MAX_VIDEO_SIZE_BYTES) {
                      setVideoSizeError(
                        'This file is too large (max 100MB). For best results, upload your video to YouTube and paste the link instead.'
                      );
                      setVideoFile(null);
                    } else {
                      setVideoFile(f);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => videoFileRef.current?.click()}
                  className="mt-1 w-full flex items-center gap-3 border-2 border-dashed border-slate-600 rounded-xl px-4 py-3 hover:border-[#2E75B6] transition-colors"
                >
                  <Video className="w-5 h-5 text-slate-400" />
                  {videoFile ? (
                    <div className="text-left">
                      <p className="text-sm text-white font-medium">{videoFile.name}</p>
                      <p className="text-xs text-slate-500">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Click to select video file…</span>
                  )}
                </button>
                {videoSizeError ? (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 leading-relaxed">{videoSizeError}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Max 100MB — or use YouTube link.
                  </p>
                )}
              </div>
            )}

            {saveProgress && (
              <p className="text-xs text-[#7EB8E8] flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
                {saveProgress}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-slate-300" onClick={() => { resetForm(); setAddOpen(false); }}>
              Cancel
            </Button>
            <Button className="bg-[#2E75B6] hover:bg-[#1F4E78]" disabled={saving} onClick={addVideo}>
              {saving ? 'Saving…' : 'Save Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-[#2E75B6]/30 border-t-[#2E75B6] rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
          <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No videos yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => {
            const parsed = parseVideoUrl(r.url);
            const thumb = parsed?.kind === 'youtube'
              ? `https://img.youtube.com/vi/${parsed.id}/mqdefault.jpg`
              : null;
            const isFile = !parsed;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3"
              >
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center relative">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-5 h-5 text-slate-500" />
                  )}
                  {r.is_protected && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{r.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {isFile ? 'Uploaded file' : (parsed?.kind === 'youtube' ? 'YouTube' : 'Vimeo')}
                    {' · '}
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-[#7EB8E8] hover:underline">
                      View
                    </a>
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[10px] text-slate-500">Visible</span>
                    <Switch
                      checked={r.is_visible}
                      onCheckedChange={(v) => updateVideo(r.id, { is_visible: v })}
                    />
                  </label>
                  <button
                    type="button"
                    title={r.is_protected ? 'Protected — click to make public' : 'Public — click to password-protect'}
                    onClick={() => updateVideo(r.id, { is_protected: !r.is_protected })}
                    className={`p-1.5 rounded transition-colors ${
                      r.is_protected
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {r.is_protected ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVideo(r.id, 'up')}
                    disabled={idx === 0 || reordering}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                    title="Move up"
                  >
                    {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVideo(r.id, 'down')}
                    disabled={idx === rows.length - 1 || reordering}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                    title="Move down"
                  >
                    {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r.id)}
                    className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Video?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300 py-2">
            This will permanently remove this video from the gallery. This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-slate-300" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Section wrapper: Photos + Videos in one tab ───────────────────────────────
function SectionManager({ section }: { section: string; label: string }) {
  const [view, setView] = useState<'photos' | 'videos'>('photos');
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView('photos')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            view === 'photos'
              ? 'bg-[#2E75B6]/20 border-[#2E75B6] text-[#7EB8E8]'
              : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          )}
        >
          <ImageIcon className="w-4 h-4" />
          Photos
        </button>
        <button
          type="button"
          onClick={() => setView('videos')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            view === 'videos'
              ? 'bg-[#2E75B6]/20 border-[#2E75B6] text-[#7EB8E8]'
              : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          )}
        >
          <Video className="w-4 h-4" />
          Videos
        </button>
      </div>

      {view === 'photos' ? (
        <PhotoSection section={section} />
      ) : (
        <VideoSection section={section} />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function GalleryTab() {
  return (
    <div className="space-y-6">
      <header>
        <div className="mb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Gallery</h1>
          <p className="text-sm text-[#6b7280] mt-1 font-medium">
            Upload photos and videos. Changes appear on the public gallery immediately.
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-[#2E75B6]/30 via-[#1e1e1e] to-transparent" />
      </header>

      {/* Password protection card */}
      <GalleryPasswordCard />

      <Tabs defaultValue="topaz2" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-700 h-10">
          <TabsTrigger value="topaz2" className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white">
            TOPAZ 2.0
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white">
            TOPAZ History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topaz2" className="mt-6">
          <SectionManager section="topaz2" label="TOPAZ 2.0" />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <SectionManager section="history" label="TOPAZ History" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
