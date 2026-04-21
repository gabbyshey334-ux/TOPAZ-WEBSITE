import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Save,
  Upload,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SiteContentRow = Database['public']['Tables']['site_content']['Row'];

// ── Keys we manage on this tab ───────────────────────────────────────────────
const HERO_IMAGE_KEYS = [
  'hero_image_1',
  'hero_image_2',
  'hero_image_3',
  'hero_image_4',
] as const;
type HeroImageKey = typeof HERO_IMAGE_KEYS[number];

const HERO_IMAGE_LABELS: Record<HeroImageKey, string> = {
  hero_image_1: 'Hero Image 1 — Top Left (Tall)',
  hero_image_2: 'Hero Image 2 — Top Right (Square)',
  hero_image_3: 'Hero Image 3 — Bottom Left (Square)',
  hero_image_4: 'Hero Image 4 — Bottom Right (Tall)',
};

const HERO_VIDEO_KEY = 'hero_video_url';
const BUCKET = 'gallery-media';

// Accept anything an <img>/<video> can actually render
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

// ── Helpers ──────────────────────────────────────────────────────────────────
function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]+/g, '_');
}

function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

async function upsertSiteContent(key: string, value: string) {
  return supabase
    .from('site_content')
    .upsert({ key, value }, { onConflict: 'key' });
}

// ── Hero Image Card ──────────────────────────────────────────────────────────
function HeroImageCard({
  slot,
  imageKey,
  currentUrl,
  onReplaced,
}: {
  slot: number;
  imageKey: HeroImageKey;
  currentUrl: string | null;
  onReplaced: (newUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setFlash(null);

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`
      );
      return;
    }

    setUploading(true);
    const path = `homepage/hero-${slot}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setUploading(false);
      setError(`Upload failed: ${upErr.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: dbErr } = await upsertSiteContent(imageKey, publicUrl);
    if (dbErr) {
      setUploading(false);
      setError(`Saved the file, but failed to update homepage: ${dbErr.message}`);
      return;
    }

    // Best-effort cleanup of the previous image if it was in the gallery-media bucket.
    // Never fail the flow if cleanup errors — the new image is already live.
    if (currentUrl) {
      const oldPath = storagePathFromPublicUrl(currentUrl, BUCKET);
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }
    }

    setUploading(false);
    setFlash('Updated! Refresh the homepage to see the change.');
    setTimeout(() => setFlash(null), 4000);
    onReplaced(publicUrl);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'group relative aspect-square bg-black flex items-center justify-center overflow-hidden',
          'transition-all',
          uploading ? 'cursor-wait' : 'cursor-pointer hover:brightness-75',
        )}
        aria-label={`Replace ${HERO_IMAGE_LABELS[imageKey]}`}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={HERO_IMAGE_LABELS[imageKey]}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs">No image set</span>
          </div>
        )}

        {/* Hover / upload overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white transition-opacity',
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Click to Replace</span>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = ''; // allow re-selecting the same file
          if (f) handleFile(f);
        }}
      />

      <div className="p-3 border-t border-slate-700 space-y-1.5">
        <p className="text-xs font-bold text-white">{HERO_IMAGE_LABELS[imageKey]}</p>
        <p className="text-[10px] text-slate-500 font-mono truncate" title={currentUrl ?? ''}>
          {currentUrl ?? 'No URL set'}
        </p>
        {error && (
          <p className="text-xs text-red-400 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {error}
          </p>
        )}
        {flash && (
          <p className="text-xs text-emerald-400 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {flash}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Hero Video Card ──────────────────────────────────────────────────────────
function HeroVideoCard({
  currentUrl,
  onUpdated,
}: {
  currentUrl: string | null;
  onUpdated: (newUrl: string) => void;
}) {
  const [urlDraft, setUrlDraft] = useState(currentUrl ?? '');
  const [savingUrl, setSavingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep draft in sync if parent refetches
    setUrlDraft(currentUrl ?? '');
  }, [currentUrl]);

  async function saveUrl() {
    setError(null);
    setFlash(null);
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      setError('Enter a video URL or upload a file.');
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setError('That doesn\'t look like a valid URL.');
      return;
    }

    setSavingUrl(true);
    const { error: dbErr } = await upsertSiteContent(HERO_VIDEO_KEY, trimmed);
    setSavingUrl(false);

    if (dbErr) {
      setError(`Failed to save: ${dbErr.message}`);
      return;
    }
    setFlash('Homepage video URL updated. Refresh the homepage to see it.');
    setTimeout(() => setFlash(null), 4000);
    onUpdated(trimmed);
  }

  async function handleFile(file: File) {
    setError(null);
    setFlash(null);

    if (!file.type.startsWith('video/')) {
      setError('Please choose a video file (MP4, WebM, MOV, etc.).');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        `Video is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 100 MB. ` +
        'Tip: upload to YouTube/Vimeo and paste the link instead.'
      );
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading video…');
    const path = `homepage/hero-video-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setUploading(false);
      setUploadProgress('');
      setError(`Upload failed: ${upErr.message}`);
      return;
    }

    setUploadProgress('Saving…');
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbErr } = await upsertSiteContent(HERO_VIDEO_KEY, publicUrl);

    if (dbErr) {
      setUploading(false);
      setUploadProgress('');
      setError(`Saved the file, but failed to update homepage: ${dbErr.message}`);
      return;
    }

    // Best-effort cleanup of the previous video if it was in this bucket
    if (currentUrl) {
      const oldPath = storagePathFromPublicUrl(currentUrl, BUCKET);
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }
    }

    setUploading(false);
    setUploadProgress('');
    setUrlDraft(publicUrl);
    setFlash('Homepage video replaced. Refresh the homepage to see it.');
    setTimeout(() => setFlash(null), 4000);
    onUpdated(publicUrl);
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {currentUrl ? (
          <video
            key={currentUrl /* force reload on URL change */}
            src={currentUrl}
            controls
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Video className="w-10 h-10" />
            <span className="text-xs">No video set</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5 border-t border-slate-700">
        {/* URL editor */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5" />
            Video URL
          </Label>
          <div className="flex gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…"
              disabled={savingUrl || uploading}
              className="bg-slate-950 border-slate-600 text-white font-mono text-xs"
            />
            <Button
              type="button"
              onClick={saveUrl}
              disabled={
                savingUrl || uploading || urlDraft.trim() === (currentUrl ?? '').trim() || !urlDraft.trim()
              }
              className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white shrink-0 gap-2"
            >
              {savingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Paste a direct video URL (MP4, WebM) or a link to a hosted file.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">or</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* File uploader */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            Upload video file
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 ml-1">
              Max 100MB
            </span>
          </Label>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || savingUrl}
            className={cn(
              'w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 transition-colors',
              uploading
                ? 'border-[#2E75B6] bg-[#2E75B6]/10 cursor-wait'
                : 'border-slate-600 hover:border-[#2E75B6] hover:bg-slate-800/50',
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-[#7EB8E8] animate-spin shrink-0" />
                <span className="text-sm text-[#7EB8E8]">{uploadProgress || 'Uploading…'}</span>
              </>
            ) : (
              <>
                <Video className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-400">Click to select a video file…</span>
              </>
            )}
          </button>
          <p className="text-xs text-slate-500">
            For videos larger than 100 MB, upload to YouTube and paste the link above.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}
        {flash && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 leading-relaxed">{flash}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Content Tab ─────────────────────────────────────────────────────────
export default function ContentTab() {
  const [content, setContent] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase.from('site_content').select('*');
    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }
    const map: Record<string, string | null> = {};
    for (const row of (data as SiteContentRow[]) ?? []) {
      map[row.key] = row.value;
    }
    setContent(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateLocal(key: string, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Content</h1>
            <p className="text-sm text-[#6b7280] mt-1 font-medium">
              Swap the four hero photos and background video on the homepage. Changes go live instantly.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={load}
            disabled={loading}
            className="border-[#2a2a2a] bg-[#111111] text-[#e5e7eb] hover:bg-[#1a1a1a] shrink-0"
            title="Reload from database"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
            Reload
          </Button>
        </div>
        <div className="h-px bg-gradient-to-r from-[#2E75B6]/30 via-[#1e1e1e] to-transparent" />
      </header>

      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-300">Failed to load homepage content</p>
            <p className="text-xs text-red-400/80 mt-0.5">{loadError}</p>
          </div>
        </div>
      )}

      {/* ── Hero Photos ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/30 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2E75B6]/20 rounded-lg flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-[#7EB8E8]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Hero Photos</h3>
            <p className="text-xs text-slate-400">
              Click any photo to replace it with an image from your device.
            </p>
          </div>
        </div>

        {loading && Object.keys(content).length === 0 ? (
          <div className="flex items-center gap-2 text-slate-400 py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading photos…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HERO_IMAGE_KEYS.map((key, i) => (
              <HeroImageCard
                key={key}
                slot={i + 1}
                imageKey={key}
                currentUrl={content[key] ?? null}
                onReplaced={(newUrl) => updateLocal(key, newUrl)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Hero Video ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/30 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2E75B6]/20 rounded-lg flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 text-[#7EB8E8]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Hero Background Video</h3>
            <p className="text-xs text-slate-400">
              This video plays behind the TOPAZ 2.0 logo at the top of the homepage.
            </p>
          </div>
        </div>

        {loading && Object.keys(content).length === 0 ? (
          <div className="flex items-center gap-2 text-slate-400 py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading video…
          </div>
        ) : (
          <HeroVideoCard
            currentUrl={content[HERO_VIDEO_KEY] ?? null}
            onUpdated={(v) => updateLocal(HERO_VIDEO_KEY, v)}
          />
        )}
      </section>
    </div>
  );
}
