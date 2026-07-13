import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  AlignLeft,
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
import {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_TEXT_DEFAULTS,
  CONTACT_PAGE_FAQ_DEFAULTS,
  REGISTRATION_PAGE_FAQ_DEFAULTS,
  type SiteContentMediaKey,
  type SiteContentTextKey,
} from '@/constants/siteContentDefaults';

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

/** Edited under About photo slots only — excluded from bulk text list. */
const ABOUT_IMAGE_CAPTION_KEYS = new Set<string>([
  'about_image_1_caption',
  'about_image_2_caption',
  'about_image_3_caption',
]);

/** Edited under Homepage → “What’s coming” — excluded from bulk text list. */
const WHATS_COMING_TEXT_KEYS = [
  'home_whats_coming_kicker',
  'home_whats_coming_heading',
  'home_promo_1_title',
  'home_promo_1_subtitle',
  'home_promo_1_description',
  'home_promo_2_title',
  'home_promo_2_subtitle',
  'home_promo_2_description',
  'home_promo_3_title',
  'home_promo_3_subtitle',
  'home_promo_3_description',
] as const satisfies readonly SiteContentTextKey[];

const WHATS_COMING_TEXT_KEY_SET = new Set<string>(WHATS_COMING_TEXT_KEYS);

const WHATS_COMING_TEXT_FIELDS: { key: SiteContentTextKey; label: string }[] = [
  { key: 'home_whats_coming_kicker', label: 'Section label (above the heading)' },
  { key: 'home_whats_coming_heading', label: 'Section heading' },
  { key: 'home_promo_1_title', label: 'Card 1 — title (Master Classes)' },
  { key: 'home_promo_1_subtitle', label: 'Card 1 — status label (e.g. Coming Soon)' },
  { key: 'home_promo_1_description', label: 'Card 1 — short description' },
  { key: 'home_promo_2_title', label: 'Card 2 — title (Sponsors)' },
  { key: 'home_promo_2_subtitle', label: 'Card 2 — status label' },
  { key: 'home_promo_2_description', label: 'Card 2 — short description' },
  { key: 'home_promo_3_title', label: 'Card 3 — title (Panel & Judges)' },
  { key: 'home_promo_3_subtitle', label: 'Card 3 — status label' },
  { key: 'home_promo_3_description', label: 'Card 3 — short description' },
];

function SlotCaptionEditor({
  siteKey,
  savedValue,
  onSaved,
}: {
  siteKey: string;
  savedValue: string | null | undefined;
  onSaved: (v: string) => void;
}) {
  const [draft, setDraft] = useState(savedValue ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(savedValue ?? '');
  }, [savedValue]);

  async function save() {
    setSaving(true);
    const trimmed = draft.trim();
    const { error } = await upsertSiteContent(siteKey, trimmed);
    setSaving(false);
    if (error) {
      toast.error(`Failed to save caption: ${error.message}`);
      return;
    }
    onSaved(trimmed);
    toast.success('Caption saved');
  }

  const unchanged = trimmedEquals(savedValue, draft);

  return (
    <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
      <Label htmlFor={`caption-${siteKey}`} className="text-xs font-medium text-slate-400">
        Caption (optional).
      </Label>
      <Input
        id={`caption-${siteKey}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={saving}
        placeholder="Shown on the public About page below this photo"
        className="bg-slate-950 font-mono text-xs text-white border-slate-600"
      />
      <Button
        type="button"
        size="sm"
        onClick={() => void save()}
        disabled={saving || unchanged}
        className="gap-2 bg-[#2E75B6] text-white hover:bg-[#1F4E78]"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save Caption
      </Button>
    </div>
  );
}

function trimmedEquals(a: string | null | undefined, b: string): boolean {
  return (a ?? '').trim() === b.trim();
}

/** Longer text fields — textarea with extra rows in the editor. */
const MULTILINE_TEXT_KEYS = new Set<string>([
  'about_our_story_text',
  'about_us_text',
  'about_legacy_quote',
  'about_tribute_text',
  'about_ric_blurb',
  'about_hero_subtitle',
  'about_cta_body',
  'footer_tagline',
  'contact_form_intro',
  'contact_social_body',
  'contact_faq_section_intro',
  'contact_mail_address',
  'home_legacy_card_1_body',
  'home_legacy_card_2_body',
  'home_final_cta_body',
  'home_testimonials_empty_body',
  'schedule_event_description',
  'schedule_cta_body',
  'rules_general_note',
  'rules_hero_lead',
  'shop_empty_body',
  'registration_alert_window_body',
  'registration_alert_mail_body',
  'registration_step1_body',
  'registration_step2_body',
  'registration_step3_body',
]);

function textSectionForKey(key: string): string {
  if (key === 'contact_phone' || key === 'contact_email') return 'contact_global';
  if (key.startsWith('footer_')) return 'footer';
  if (key.startsWith('home_')) return 'home';
  if (key.startsWith('about_')) return 'about';
  if (key.startsWith('contact_')) return 'contact_page';
  if (key.startsWith('schedule_')) return 'schedule';
  if (key.startsWith('rules_')) return 'rules';
  if (key.startsWith('shop_')) return 'shop';
  if (key.startsWith('registration_')) return 'registration';
  if (key.startsWith('gallery_')) return 'gallery';
  return 'other';
}

const TEXT_SECTION_ORDER: { id: string; title: string; hint?: string }[] = [
  {
    id: 'contact_global',
    title: 'Global: phone & email',
    hint: 'Shown in the footer, contact cards, and linked flows site-wide.',
  },
  { id: 'footer', title: 'Footer & social links' },
  { id: 'home', title: 'Home page copy' },
  { id: 'about', title: 'About page copy' },
  { id: 'contact_page', title: 'Contact page copy' },
  { id: 'schedule', title: 'Schedule page copy' },
  { id: 'rules', title: 'Rules page copy' },
  { id: 'shop', title: 'Shop page copy' },
  { id: 'registration', title: 'Registration page copy' },
  { id: 'gallery', title: 'Gallery page copy' },
  { id: 'other', title: 'Other keys' },
];

function adminLabelForTextKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const FAQ_JSON_EDITORS: {
  key: 'contact_faq_json' | 'registration_faq_json';
  title: string;
  defaultsJson: string;
}[] = [
  {
    key: 'contact_faq_json',
    title: 'Contact page — FAQ list (JSON)',
    defaultsJson: JSON.stringify(CONTACT_PAGE_FAQ_DEFAULTS, null, 2),
  },
  {
    key: 'registration_faq_json',
    title: 'Registration page — FAQ list (JSON)',
    defaultsJson: JSON.stringify(REGISTRATION_PAGE_FAQ_DEFAULTS, null, 2),
  },
];

function ManagedTextField({
  fieldKey,
  label,
  multiline,
  savedValue,
  onSaved,
}: {
  fieldKey: string;
  label: string;
  multiline: boolean;
  savedValue: string | null | undefined;
  onSaved: (v: string) => void;
}) {
  const [draft, setDraft] = useState(savedValue ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(savedValue ?? '');
  }, [savedValue]);

  async function save() {
    setSaving(true);
    const { error } = await upsertSiteContent(fieldKey, draft);
    setSaving(false);
    if (error) {
      toast.error(`Failed to save: ${error.message}`);
      return;
    }
    onSaved(draft);
    toast.success('Text updated — changes are live');
  }

  const unchanged = draft === (savedValue ?? '');

  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <Label className="text-sm font-bold text-white">{label}</Label>
      <p className="font-mono text-[10px] text-slate-500">{fieldKey}</p>
      {multiline ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
          rows={
            fieldKey === 'about_us_text' || fieldKey === 'about_our_story_text'
              ? 10
              : fieldKey === 'schedule_event_description'
                ? 5
                : 8
          }
          className="min-h-[120px] bg-slate-950 font-mono text-sm text-white border-slate-600"
        />
      ) : (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
          className="bg-slate-950 font-mono text-sm text-white border-slate-600"
        />
      )}
      <Button
        type="button"
        onClick={() => void save()}
        disabled={saving || unchanged}
        className="gap-2 bg-[#2E75B6] text-white hover:bg-[#1F4E78]"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save
      </Button>
    </div>
  );
}

function ManagedFaqJsonField({
  fieldKey,
  title,
  defaultsJson,
  savedValue,
  onSaved,
}: {
  fieldKey: string;
  title: string;
  defaultsJson: string;
  savedValue: string | null | undefined;
  onSaved: (v: string) => void;
}) {
  const [draft, setDraft] = useState(savedValue ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(savedValue ?? '');
  }, [savedValue]);

  async function save() {
    const trimmed = draft.trim();
    if (trimmed) {
      try {
        JSON.parse(trimmed);
      } catch {
        toast.error('Invalid JSON. Fix the syntax, or clear the field to use built-in FAQs.');
        return;
      }
    }
    setSaving(true);
    const { error } = await upsertSiteContent(fieldKey, trimmed);
    setSaving(false);
    if (error) {
      toast.error(`Failed to save: ${error.message}`);
      return;
    }
    onSaved(trimmed);
    toast.success(trimmed ? 'FAQ JSON saved' : 'Cleared — site uses default FAQs');
  }

  const unchanged = draft === (savedValue ?? '');

  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <Label className="text-sm font-bold text-white">{title}</Label>
      <p className="font-mono text-[10px] text-slate-500">{fieldKey}</p>
      <p className="text-xs text-slate-400">
        Array of objects with <code className="text-slate-300">question</code> and{' '}
        <code className="text-slate-300">answer</code> strings. Leave empty to use the built-in default list.
      </p>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={saving}
        rows={14}
        spellCheck={false}
        className="min-h-[220px] bg-slate-950 font-mono text-xs text-white border-slate-600 leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={saving}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
          onClick={() => setDraft(defaultsJson)}
        >
          Insert default JSON
        </Button>
        <Button
          type="button"
          onClick={() => void save()}
          disabled={saving || unchanged}
          className="gap-2 bg-[#2E75B6] text-white hover:bg-[#1F4E78]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>
    </div>
  );
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
  captionSiteKey,
  captionValue,
  onCaptionSaved,
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
  captionSiteKey?: string;
  captionValue?: string | null;
  onCaptionSaved?: (v: string) => void;
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
      <div className="flex w-full shrink-0 flex-col sm:w-[200px]">
        <div
          className={cn(
            'w-full overflow-hidden rounded-lg bg-black ring-1 ring-white/10',
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
            <div className="flex aspect-square w-full min-h-[120px] items-center justify-center text-slate-500">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>
        {captionSiteKey && onCaptionSaved ? (
          <SlotCaptionEditor
            siteKey={captionSiteKey}
            savedValue={captionValue}
            onSaved={onCaptionSaved}
          />
        ) : null}
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
      /** Optional `site_content` text key for public About page caption under this image. */
      captionSiteKey?: string;
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
        groupTitle: '“What’s coming” / Exciting Features Ahead',
        slots: [
          { key: 'home_promo_masterclass', label: 'Card 1 image — Master classes', storagePrefix: 'homepage/promo-masterclass' },
          { key: 'home_promo_sponsors', label: 'Card 2 image — Sponsors', storagePrefix: 'homepage/promo-sponsors' },
          { key: 'home_promo_panel', label: 'Card 3 image — Panel & judges', storagePrefix: 'homepage/promo-panel' },
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
          { key: 'about_image_1', label: 'About Us section (main photo)', storagePrefix: 'about/about-1', captionSiteKey: 'about_image_1_caption' },
          { key: 'about_us_fallback', label: 'About Us — fallback if main fails', storagePrefix: 'about/about-us-fallback' },
        ],
      },
      {
        groupTitle: 'Story, Ric Heath, Continuing the Dream',
        slots: [
          { key: 'about_ric_portrait', label: 'Ric Heath portrait', storagePrefix: 'about/ric-portrait' },
          { key: 'about_image_2', label: 'Continuing the Dream (B&W duo)', storagePrefix: 'about/about-2', captionSiteKey: 'about_image_2_caption' },
        ],
      },
      {
        groupTitle: 'About page photos',
        slots: [
          {
            key: 'about_image_3',
            label: 'About page — heritage photo (third image)',
            storagePrefix: 'about/about-3',
            thumbClassName: 'aspect-[4/3]',
            siteVisibilityKey: 'about_performers_visible',
            captionSiteKey: 'about_image_3_caption',
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
  const [openTextSection, setOpenTextSection] = useState(false);

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

  const allTextFieldKeys = Object.keys(SITE_CONTENT_TEXT_DEFAULTS).sort() as SiteContentTextKey[];
  const textEditorFieldCount =
    allTextFieldKeys.filter(
      (k) => !ABOUT_IMAGE_CAPTION_KEYS.has(k) && !WHATS_COMING_TEXT_KEY_SET.has(k),
    ).length + FAQ_JSON_EDITORS.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
            <FileEdit className="h-5 w-5 text-[#2E75B6]" />
            Website editor — images &amp; media
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Change photos, hero video, and page backgrounds without touching code. Public pages use these keys with
            safe fallbacks when a slot is empty.
          </p>
          <div className="mt-4 rounded-xl border border-[#2E75B6]/40 bg-[#2E75B6]/10 px-4 py-3 text-sm text-slate-200">
            <p className="font-bold text-white">Where to edit what</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
              <li>
                <strong className="text-white">Photos &amp; hero video</strong> — expand the page sections below
                (Homepage, About page, Schedule, etc.). This is separate from the text editor.
              </li>
              <li>
                <strong className="text-white">“What&apos;s Coming” homepage cards</strong> — under Homepage, edit
                titles, descriptions, and card images in one place.
              </li>
              <li>
                <strong className="text-white">Wording, buttons, footer, contact lines, optional FAQ JSON</strong> —
                open <strong className="text-white">All website text &amp; FAQs</strong> at the bottom of this tab.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-400">
              If new uploads look correct here but the live site still shows an old photo, the site may be falling back
              because guests cannot read the storage bucket — apply the latest Supabase migration (gallery-media public
              read) or add a Storage policy so <code className="text-slate-300">anon</code> can SELECT objects in{' '}
              <code className="text-slate-300">gallery-media</code>.
            </p>
          </div>
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
                        {section.id === 'home' &&
                          group.groupTitle.startsWith('“What’s coming”') && (
                            <div className="space-y-3 rounded-xl border border-[#2E75B6]/30 bg-[#2E75B6]/5 p-4">
                              <p className="text-xs text-slate-400">
                                Edit the &quot;Exciting Features Ahead&quot; section on the homepage. Changes go live
                                as soon as you save each field. Card images are below.
                              </p>
                              <div className="flex flex-col gap-3">
                                {WHATS_COMING_TEXT_FIELDS.map((field) => (
                                  <ManagedTextField
                                    key={field.key}
                                    fieldKey={field.key}
                                    label={field.label}
                                    multiline={field.key.includes('description')}
                                    savedValue={content[field.key] ?? null}
                                    onSaved={(v) => updateLocal(field.key, v)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
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
                              captionSiteKey={slot.captionSiteKey}
                              captionValue={slot.captionSiteKey ? content[slot.captionSiteKey] ?? null : null}
                              onCaptionSaved={
                                slot.captionSiteKey
                                  ? (v) => updateLocal(slot.captionSiteKey!, v)
                                  : undefined
                              }
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
          <Collapsible
            open={openTextSection}
            onOpenChange={setOpenTextSection}
            className="rounded-2xl border border-slate-700 bg-slate-900/30"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-slate-800/40 sm:px-5">
              <span className="font-bold text-white">
                <span className="mr-2 inline-flex align-middle">
                  <AlignLeft className="inline h-5 w-5 text-[#2E75B6]" />
                </span>
                All website text &amp; FAQs{' '}
                <span className="ml-2 font-mono text-xs font-normal text-slate-500">
                  — {textEditorFieldCount} fields
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-slate-400 transition-transform',
                  openTextSection && 'rotate-180',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-8 border-t border-slate-700 px-4 py-6 sm:px-6">
                <p className="text-sm text-slate-400">
                  Edit headlines, paragraphs, buttons, footer copy, and contact details. Values are stored in{' '}
                  <code className="text-slate-300">site_content</code> and go live as soon as you save. Empty values use
                  the site&apos;s built-in defaults. FAQ pages can optionally use custom JSON lists (see below).
                </p>

                {TEXT_SECTION_ORDER.map((section) => {
                  const keys = allTextFieldKeys.filter(
                    (k) =>
                      textSectionForKey(k) === section.id &&
                      !ABOUT_IMAGE_CAPTION_KEYS.has(k) &&
                      !WHATS_COMING_TEXT_KEY_SET.has(k),
                  );
                  if (keys.length === 0) return null;
                  return (
                    <div key={section.id} className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#7EB8E8]">{section.title}</h4>
                        {section.hint ? <p className="mt-1 text-xs text-slate-500">{section.hint}</p> : null}
                      </div>
                      <div className="flex flex-col gap-4">
                        {keys.map((fieldKey) => (
                          <ManagedTextField
                            key={fieldKey}
                            fieldKey={fieldKey}
                            label={adminLabelForTextKey(fieldKey)}
                            multiline={MULTILINE_TEXT_KEYS.has(fieldKey)}
                            savedValue={content[fieldKey] ?? null}
                            onSaved={(v) => updateLocal(fieldKey, v)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#7EB8E8]">FAQ JSON (advanced)</h4>
                  <p className="text-xs text-slate-500">
                    Optional. Leave empty to keep the default questions and answers from the live site. Use valid JSON
                    only — click &quot;Insert default JSON&quot; as a starting point.
                  </p>
                  <div className="flex flex-col gap-4">
                    {FAQ_JSON_EDITORS.map((faq) => (
                      <ManagedFaqJsonField
                        key={faq.key}
                        fieldKey={faq.key}
                        title={faq.title}
                        defaultsJson={faq.defaultsJson}
                        savedValue={content[faq.key] ?? null}
                        onSaved={(v) => updateLocal(faq.key, v)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
