import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ChevronDown,
  FileEdit,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Save,
  Upload,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SITE_CONTENT_DEFAULTS, type SiteContentMediaKey } from '@/constants/siteContentDefaults';

type SiteContentRow = Database['public']['Tables']['site_content']['Row'];

const HERO_VIDEO_KEY = 'hero_video_url';
const BUCKET = 'gallery-media';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

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
  return supabase.from('site_content').upsert({ key, value }, { onConflict: 'key' });
}

function defaultUrlForKey(key: string): string {
  const d = SITE_CONTENT_DEFAULTS[key as SiteContentMediaKey];
  return d ?? '';
}

// ── Managed image slot ───────────────────────────────────────────────────────
function ManagedImageSlot({
  imageKey,
  label,
  storagePathPrefix,
  currentUrl,
  onReplaced,
  thumbClassName,
  hidePhotoToggle,
}: {
  imageKey: string;
  label: string;
  storagePathPrefix: string;
  currentUrl: string | null;
  onReplaced: (newUrl: string) => void;
  thumbClassName?: string;
  hidePhotoToggle?: {
    storageKey: string;
    currentRaw: string | null;
    onSaved: (value: string) => void;
  };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const photoHiddenOnSite =
    hidePhotoToggle &&
    String(hidePhotoToggle.currentRaw ?? 'true').toLowerCase() === 'false';

  const displayUrl = currentUrl?.trim() ? currentUrl : defaultUrlForKey(imageKey);

  const stopProgressAnim = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startProgressAnim = () => {
    stopProgressAnim();
    setProgress(6);
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 4 + Math.random() * 8));
    }, 160);
  };

  async function handleFile(file: File) {
    const allowed =
      /^image\/(jpeg|png|webp|gif)$/i.test(file.type) ||
      /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!allowed) {
      toast.error('Please use JPG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`,
      );
      return;
    }

    setUploading(true);
    startProgressAnim();
    const path = `${storagePathPrefix}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (upErr) {
      stopProgressAnim();
      setProgress(0);
      setUploading(false);
      toast.error(`Upload failed: ${upErr.message}`, {
        action: {
          label: 'Retry',
          onClick: () => inputRef.current?.click(),
        },
      });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbErr } = await upsertSiteContent(imageKey, publicUrl);

    if (dbErr) {
      stopProgressAnim();
      setProgress(0);
      setUploading(false);
      toast.error(`Could not save URL: ${dbErr.message}`, {
        action: {
          label: 'Retry',
          onClick: () => inputRef.current?.click(),
        },
      });
      return;
    }

    if (currentUrl) {
      const oldPath = storagePathFromPublicUrl(currentUrl, BUCKET);
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }
    }

    stopProgressAnim();
    setProgress(100);
    setTimeout(() => {
      setProgress(0);
      setUploading(false);
    }, 450);
    onReplaced(publicUrl);
    toast.success('Photo updated successfully');
  }

  useEffect(() => () => stopProgressAnim(), []);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 sm:flex-row sm:items-start">
      <div
        className={cn(
          'w-[200px] shrink-0 overflow-hidden rounded-lg bg-black ring-1 ring-white/10',
          thumbClassName ?? 'aspect-square',
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square w-[200px] items-center justify-center text-slate-500">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-white">{label}</p>
          {hidePhotoToggle && (
            <div className="flex items-center gap-2 shrink-0">
              <Label
                htmlFor={`hide-photo-${hidePhotoToggle.storageKey}`}
                className="cursor-pointer text-[11px] font-medium text-slate-400"
              >
                Hide this photo
              </Label>
              <Switch
                id={`hide-photo-${hidePhotoToggle.storageKey}`}
                checked={!!photoHiddenOnSite}
                disabled={visibilitySaving}
                onCheckedChange={async (hide) => {
                  setVisibilitySaving(true);
                  const val = hide ? 'false' : 'true';
                  const { error } = await upsertSiteContent(hidePhotoToggle.storageKey, val);
                  setVisibilitySaving(false);
                  if (error) {
                    toast.error(`Could not update visibility: ${error.message}`);
                    return;
                  }
                  hidePhotoToggle.onSaved(val);
                  toast.success(hide ? 'Photo hidden on public About page' : 'Photo visible on public About page');
                }}
                className="data-[state=checked]:bg-amber-600"
              />
            </div>
          )}
        </div>
        <p className="break-all font-mono text-[10px] text-slate-500">{displayUrl || '—'}</p>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void handleFile(f);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-3.5 w-3.5" />
              Change Photo
            </>
          )}
        </Button>
        {uploading && (
          <div className="pt-1">
            <Progress value={progress} className="h-2 bg-slate-800 [&>[data-slot=progress-indicator]]:bg-[#2E75B6]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hero background video ────────────────────────────────────────────────────
function ManagedHeroVideoSlot({
  currentUrl,
  onUpdated,
}: {
  currentUrl: string | null;
  onUpdated: (newUrl: string) => void;
}) {
  const [urlDraft, setUrlDraft] = useState(currentUrl ?? '');
  const [savingUrl, setSavingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setUrlDraft(currentUrl ?? '');
  }, [currentUrl]);

  const stopProgressAnim = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startProgressAnim = () => {
    stopProgressAnim();
    setProgress(5);
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => (p >= 88 ? 88 : p + 3 + Math.random() * 6));
    }, 200);
  };

  useEffect(() => () => stopProgressAnim(), []);

  async function saveUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      toast.error('Enter a video URL or upload a file.');
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(trimmed);
    } catch {
      toast.error('That does not look like a valid URL.');
      return;
    }
    setSavingUrl(true);
    const { error: dbErr } = await upsertSiteContent(HERO_VIDEO_KEY, trimmed);
    setSavingUrl(false);
    if (dbErr) {
      toast.error(`Failed to save: ${dbErr.message}`);
      return;
    }
    onUpdated(trimmed);
    toast.success('Video URL updated successfully');
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('video/')) {
      toast.error('Please choose a video file (MP4, WebM, MOV, etc.).');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(
        `Video is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 100 MB. Try a link instead.`,
      );
      return;
    }
    setUploading(true);
    startProgressAnim();
    const path = `homepage/hero-video-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (upErr) {
      stopProgressAnim();
      setProgress(0);
      setUploading(false);
      toast.error(`Upload failed: ${upErr.message}`, {
        action: { label: 'Retry', onClick: () => fileRef.current?.click() },
      });
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbErr } = await upsertSiteContent(HERO_VIDEO_KEY, publicUrl);
    if (dbErr) {
      stopProgressAnim();
      setProgress(0);
      setUploading(false);
      toast.error(`Saved file but could not update site: ${dbErr.message}`, {
        action: { label: 'Retry', onClick: () => fileRef.current?.click() },
      });
      return;
    }
    if (currentUrl) {
      const oldPath = storagePathFromPublicUrl(currentUrl, BUCKET);
      if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
    }
    stopProgressAnim();
    setProgress(100);
    setTimeout(() => {
      setProgress(0);
      setUploading(false);
    }, 500);
    setUrlDraft(publicUrl);
    onUpdated(publicUrl);
    toast.success('Video updated successfully');
  }

  const previewSrc = currentUrl?.trim() ? currentUrl.trim() : defaultUrlForKey(HERO_VIDEO_KEY);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {previewSrc ? (
          <video
            key={previewSrc}
            src={previewSrc}
            controls
            muted
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <Video className="h-10 w-10 text-slate-500" />
        )}
      </div>
      <div className="space-y-4 border-t border-slate-700 p-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-slate-300">
            <LinkIcon className="h-3.5 w-3.5" />
            Video URL
          </Label>
          <div className="flex flex-wrap gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…"
              disabled={savingUrl || uploading}
              className="min-w-0 flex-1 bg-slate-950 font-mono text-xs text-white border-slate-600"
            />
            <Button
              type="button"
              onClick={() => void saveUrl()}
              disabled={savingUrl || uploading || urlDraft.trim() === (currentUrl ?? '').trim() || !urlDraft.trim()}
              className="shrink-0 gap-2 bg-[#2E75B6] text-white hover:bg-[#1F4E78]"
            >
              {savingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save URL
            </Button>
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void handleFile(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || savingUrl}
            className="w-full border-dashed border-slate-600 text-slate-200 hover:bg-slate-800"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading video…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload video file (max 100 MB)
              </>
            )}
          </Button>
        </div>
        {uploading && (
          <Progress value={progress} className="h-2 bg-slate-800 [&>[data-slot=progress-indicator]]:bg-[#2E75B6]" />
        )}
      </div>
    </div>
  );
}

type PageSection = {
  id: string;
  pageTitle: string;
  groups: {
    groupTitle: string;
    slots: {
      key: string;
      label: string;
      storagePrefix: string;
      thumbClassName?: string;
      siteVisibilityKey?: string;
    }[];
    videoSlot?: { key: typeof HERO_VIDEO_KEY; label: string };
  }[];
};

const PAGE_SECTIONS: PageSection[] = [
  {
    id: 'home',
    pageTitle: 'Homepage',
    groups: [
      {
        groupTitle: 'Hero photos (masonry grid)',
        slots: [
          { key: 'hero_image_1', label: 'Hero photo 1 — top left (tall)', storagePrefix: 'homepage/hero-1' },
          { key: 'hero_image_2', label: 'Hero photo 2 — top right', storagePrefix: 'homepage/hero-2' },
          { key: 'hero_image_3', label: 'Hero photo 3 — bottom left', storagePrefix: 'homepage/hero-3' },
          { key: 'hero_image_4', label: 'Hero photo 4 — bottom right (tall)', storagePrefix: 'homepage/hero-4' },
        ],
        videoSlot: { key: HERO_VIDEO_KEY, label: 'Hero background video (behind logo)' },
      },
      {
        groupTitle: 'Official banner & hero emblem',
        slots: [
          {
            key: 'home_official_banner',
            label: 'TOPAZ 2.0 official banner (wide strip)',
            storagePrefix: 'homepage/topaz-official-banner',
            thumbClassName: 'aspect-[2/1]',
          },
          {
            key: 'home_hero_emblem',
            label: 'Hero emblem (theater masks over video)',
            storagePrefix: 'homepage/hero-emblem',
          },
        ],
      },
      {
        groupTitle: '“What’s coming” promo cards',
        slots: [
          { key: 'home_promo_masterclass', label: 'Master classes card image', storagePrefix: 'homepage/promo-masterclass' },
          { key: 'home_promo_sponsors', label: 'Sponsors card image', storagePrefix: 'homepage/promo-sponsors' },
          { key: 'home_promo_panel', label: 'Panel & judges card image', storagePrefix: 'homepage/promo-panel' },
        ],
      },
    ],
  },
  {
    id: 'about',
    pageTitle: 'About page',
    groups: [
      {
        groupTitle: 'Hero & About Us',
        slots: [
          { key: 'about_hero_background', label: 'About hero background', storagePrefix: 'about/hero-bg' },
          { key: 'about_image_1', label: 'About Us section (main photo)', storagePrefix: 'about/about-1' },
          { key: 'about_us_fallback', label: 'About Us — fallback if main fails', storagePrefix: 'about/about-us-fallback' },
        ],
      },
      {
        groupTitle: 'Story, Ric Heath, Continuing the Dream',
        slots: [
          { key: 'about_ric_portrait', label: 'Ric Heath portrait', storagePrefix: 'about/ric-portrait' },
          { key: 'about_image_2', label: 'Continuing the Dream (B&W duo)', storagePrefix: 'about/about-2' },
        ],
      },
      {
        groupTitle: 'About page photos',
        slots: [
          {
            key: 'about_image_3',
            label: 'About Page — Performers on Stage (Early Years)',
            storagePrefix: 'about/about-3',
            thumbClassName: 'aspect-[4/3]',
            siteVisibilityKey: 'about_performers_visible',
          },
        ],
      },
      {
        groupTitle: 'Meet the team',
        slots: [{ key: 'about_team_photo', label: 'Meet the Team — group photo', storagePrefix: 'about/team-photo' }],
      },
    ],
  },
  {
    id: 'schedule',
    pageTitle: 'Schedule / events',
    groups: [
      {
        groupTitle: 'Schedule page',
        slots: [
          { key: 'schedule_hero_background', label: 'Hero background', storagePrefix: 'schedule/hero-bg' },
          { key: 'schedule_event_card_image', label: 'Featured competition card image', storagePrefix: 'schedule/event-card' },
          {
            key: 'schedule_card_error_fallback',
            label: 'Competition card error fallback',
            storagePrefix: 'schedule/card-fallback',
          },
        ],
      },
    ],
  },
  {
    id: 'rules',
    pageTitle: 'Rules page',
    groups: [
      {
        groupTitle: 'Rules page',
        slots: [
          { key: 'rules_hero_background', label: 'Hero background', storagePrefix: 'rules/hero-bg' },
          { key: 'rules_cta_background', label: 'Download CTA section background', storagePrefix: 'rules/cta-bg' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    pageTitle: 'Contact page',
    groups: [
      {
        groupTitle: 'Contact page',
        slots: [{ key: 'contact_hero_background', label: 'Hero background', storagePrefix: 'contact/hero-bg' }],
      },
    ],
  },
  {
    id: 'gallery',
    pageTitle: 'Gallery page',
    groups: [
      {
        groupTitle: 'Gallery hero',
        slots: [{ key: 'gallery_hero_background', label: 'Hero background', storagePrefix: 'gallery/hero-bg' }],
      },
    ],
  },
  {
    id: 'shop',
    pageTitle: 'Shop page',
    groups: [
      {
        groupTitle: 'Shop hero',
        slots: [{ key: 'shop_hero_background', label: 'Hero background', storagePrefix: 'shop/hero-bg' }],
      },
    ],
  },
  {
    id: 'registration',
    pageTitle: 'Registration page',
    groups: [
      {
        groupTitle: 'Registration hero',
        slots: [
          {
            key: 'registration_hero_background',
            label: 'Hero background',
            storagePrefix: 'registration/hero-bg',
          },
        ],
      },
    ],
  },
];

function countSlots(section: PageSection): number {
  let n = 0;
  for (const g of section.groups) {
    n += g.slots.length;
    if (g.videoSlot) n += 1;
  }
  return n;
}

// ── Main tab ─────────────────────────────────────────────────────────────────
export default function ContentTab() {
  const [content, setContent] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openPage, setOpenPage] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value, updated_at')
      .order('key');
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
    void load();
  }, [load]);

  const updateLocal = useCallback((key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
            <FileEdit className="h-5 w-5 text-[#2E75B6]" />
            Site images &amp; media
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            One place to change photos and the homepage hero video. Public pages read from the same keys with built-in
            fallbacks.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="shrink-0 border-slate-600 text-slate-300 hover:bg-slate-800"
          title="Reload from database"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-bold text-red-300">Failed to load site content</p>
            <p className="mt-0.5 text-xs text-red-400/80">{loadError}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/30 p-6">
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <Skeleton className="h-32 w-full bg-slate-800" />
          <Skeleton className="h-32 w-full bg-slate-800" />
          <Skeleton className="h-32 w-full bg-slate-800" />
        </div>
      ) : (
        <div className="space-y-3">
          {PAGE_SECTIONS.map((section) => {
            const total = countSlots(section);
            const isOpen = openPage[section.id] ?? false;
            return (
              <Collapsible
                key={section.id}
                open={isOpen}
                onOpenChange={(o) => setOpenPage((prev) => ({ ...prev, [section.id]: o }))}
                className="rounded-2xl border border-slate-700 bg-slate-900/30"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-slate-800/40 sm:px-5">
                  <span className="font-bold text-white">
                    <span className="mr-2">📄</span>
                    {section.pageTitle}{' '}
                    <span className="ml-2 font-mono text-xs font-normal text-slate-500">
                      — {total} {total === 1 ? 'item' : 'items'}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', isOpen && 'rotate-180')}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-8 border-t border-slate-700 px-4 py-6 sm:px-6">
                    {section.groups.map((group) => (
                      <div key={group.groupTitle} className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#7EB8E8]">
                          {group.groupTitle}
                        </h4>
                        <div className="flex flex-col gap-4">
                          {group.slots.map((slot) => (
                            <ManagedImageSlot
                              key={slot.key}
                              imageKey={slot.key}
                              label={slot.label}
                              storagePathPrefix={slot.storagePrefix}
                              thumbClassName={slot.thumbClassName}
                              currentUrl={content[slot.key] ?? null}
                              onReplaced={(url) => updateLocal(slot.key, url)}
                              hidePhotoToggle={
                                slot.siteVisibilityKey
                                  ? {
                                      storageKey: slot.siteVisibilityKey,
                                      currentRaw: content[slot.siteVisibilityKey] ?? null,
                                      onSaved: (value) => updateLocal(slot.siteVisibilityKey!, value),
                                    }
                                  : undefined
                              }
                            />
                          ))}
                          {group.videoSlot && (
                            <ManagedHeroVideoSlot
                              currentUrl={content[group.videoSlot.key] ?? null}
                              onUpdated={(v) => updateLocal(group.videoSlot!.key, v)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
