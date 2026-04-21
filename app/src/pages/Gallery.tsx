import { useState, useEffect, useCallback, type SyntheticEvent } from 'react';
import { X, ChevronDown, Clock, Sparkles, Images, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { supabase } from '@/lib/supabase';
import { parseVideoUrl } from '@/lib/videoEmbed';
import type { Database } from '@/types/database';

const BASE = import.meta.env.BASE_URL;
const FALLBACK_HISTORY_IMG = `${BASE}images/gallery/history/founders-duo-striped-pants.jpg`;

type GalleryEra = 'history' | 'topaz20';
type GalleryImageRow = Database['public']['Tables']['gallery_images']['Row'];
type GalleryVideoRow = Database['public']['Tables']['gallery_videos']['Row'];

const PHOTOS_PER_PAGE = 8;
const SESSION_KEY = 'topaz_gallery_unlocked';

function historyImageOnError(e: SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.dataset.fallbackApplied === '1') return;
  el.dataset.fallbackApplied = '1';
  el.src = FALLBACK_HISTORY_IMG;
}

// ── Password Modal ─────────────────────────────────────────────────────────────
function GalleryPasswordModal({
  onClose,
  onUnlocked,
}: {
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = useCallback(async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('verify-gallery-password', {
        body: { password: password.trim() },
      });

      if (fnErr) throw fnErr;

      if (data?.valid === true) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        onUnlocked();
      } else if (data?.configured === false) {
        // No password configured — shouldn't normally show the modal in this case
        sessionStorage.setItem(SESSION_KEY, 'true');
        onUnlocked();
      } else {
        setError('Incorrect password. Please check with TOPAZ 2.0 for the correct access code.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [password, onUnlocked]);

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a0a0a] px-6 py-8 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 bg-[#2E75B6]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#7EB8E8]" />
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </h2>
          <p className="text-white/60 text-sm mt-2 leading-relaxed">
            Protected Gallery
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-7 space-y-5">
          <p className="text-gray-700 text-sm leading-relaxed text-center">
            Enter the event password to view exclusive competition photos and videos.
          </p>

          <div className="relative">
            <input
              id="gallery-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Event password…"
              className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors ${
                error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#2E75B6]'
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center leading-relaxed bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleUnlock}
            disabled={loading || !password.trim()}
            className="w-full bg-[#2E75B6] hover:bg-[#1F4E78] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Checking…</>
            ) : (
              <><Lock className="w-5 h-5" /> Unlock Gallery</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Need the password?{' '}
            <a href="mailto:topaz2.0@yahoo.com" className="text-[#2E75B6] hover:underline">
              Contact TOPAZ 2.0
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Protected photo item ───────────────────────────────────────────────────────
function GalleryPhotoItem({
  photo,
  isUnlocked,
  passwordConfigured,
  onOpenLightbox,
  onRequestUnlock,
}: {
  photo: GalleryImageRow;
  isUnlocked: boolean;
  passwordConfigured: boolean;
  onOpenLightbox: () => void;
  onRequestUnlock: () => void;
}) {
  const needsLock = photo.is_protected && !isUnlocked && passwordConfigured;

  return (
    <button
      type="button"
      onClick={needsLock ? onRequestUnlock : onOpenLightbox}
      className="group relative mb-2 block min-h-[200px] w-full overflow-hidden rounded-2xl bg-gray-100 p-3 shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-3xl sm:p-4"
    >
      <img
        src={photo.url}
        alt={needsLock ? '' : (photo.caption || photo.filename || undefined)}
        className={`block min-h-[180px] h-auto max-h-[min(85vh,720px)] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02] ${
          needsLock ? 'blur-[14px] scale-105 select-none pointer-events-none' : ''
        }`}
        onError={historyImageOnError}
        aria-hidden={needsLock}
      />
      {needsLock && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-5 py-4 flex flex-col items-center gap-2">
            <Lock className="w-8 h-8 text-white drop-shadow" />
            <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow">
              Tap to unlock
            </span>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/0 transition-colors duration-300 group-hover:bg-black/10 sm:rounded-3xl" />
    </button>
  );
}

// ── Protected video item ───────────────────────────────────────────────────────
const DIRECT_VIDEO_EXT = /\.(mp4|mov|webm|avi|m4v|ogv)(\?|#|$)/i;

function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  if (DIRECT_VIDEO_EXT.test(url)) return true;
  // Any Supabase storage URL (signed or public, any region) is a direct file
  if (/supabase/i.test(url)) return true;
  return false;
}

function GalleryVideoItem({
  video,
  isUnlocked,
  passwordConfigured,
  onRequestUnlock,
}: {
  video: GalleryVideoRow;
  isUnlocked: boolean;
  passwordConfigured: boolean;
  onRequestUnlock: () => void;
}) {
  const parsed = parseVideoUrl(video.url);
  const directVideo = !parsed && isDirectVideoUrl(video.url);
  const needsLock = video.is_protected && !isUnlocked && passwordConfigured;

  const thumb =
    parsed?.kind === 'youtube'
      ? `https://img.youtube.com/vi/${parsed.id}/mqdefault.jpg`
      : null;

  if (needsLock) {
    return (
      <div className="space-y-3">
        <p className="font-bold text-gray-900">{video.title}</p>
        <button
          type="button"
          onClick={onRequestUnlock}
          className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 flex items-center justify-center group"
        >
          {thumb && (
            <img
              src={thumb}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover blur-[14px] scale-110 opacity-60"
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-4">
            <Lock className="w-8 h-8 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Tap to unlock
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-bold text-gray-900">{video.title}</p>
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {parsed ? (
          <iframe
            title={video.title}
            src={parsed.embedSrc}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : directVideo ? (
          <video
            src={video.url}
            title={video.title}
            controls
            preload="metadata"
            playsInline
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/70">
            Invalid video URL
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Gallery component ─────────────────────────────────────────────────────
const Gallery = () => {
  const [galleryEra, setGalleryEra] = useState<GalleryEra>('history');
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photoLimit, setPhotoLimit] = useState(PHOTOS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const [historyImages, setHistoryImages] = useState<GalleryImageRow[]>([]);
  const [topaz2Images, setTopaz2Images] = useState<GalleryImageRow[]>([]);
  const [historyVideos, setHistoryVideos] = useState<GalleryVideoRow[]>([]);
  const [topaz2Videos, setTopaz2Videos] = useState<GalleryVideoRow[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);

  // Gallery password / unlock state
  const [isUnlocked, setIsUnlocked] = useState(() =>
    sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [passwordConfigured, setPasswordConfigured] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    setActiveTab('photos');
    setPhotoLimit(PHOTOS_PER_PAGE);
  }, [galleryEra]);

  // Check if a gallery password has been configured (server-side, no hash exposed)
  useEffect(() => {
    supabase.functions
      .invoke('verify-gallery-password', { body: { checkStatus: true } })
      .then(({ data }) => {
        setPasswordConfigured(data?.configured === true);
      })
      .catch(() => {
        setPasswordConfigured(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setMediaLoading(true);
      const [h, t, vh, vt] = await Promise.all([
        supabase
          .from('gallery_images')
          .select('*')
          .eq('section', 'history')
          .eq('is_visible', true)
          .eq('is_members_only', false)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('gallery_images')
          .select('*')
          .eq('section', 'topaz2')
          .eq('is_visible', true)
          .eq('is_members_only', false)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('gallery_videos')
          .select('*')
          .eq('section', 'history')
          .eq('is_visible', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('gallery_videos')
          .select('*')
          .eq('section', 'topaz2')
          .eq('is_visible', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setHistoryImages((h.data as GalleryImageRow[]) ?? []);
      setTopaz2Images((t.data as GalleryImageRow[]) ?? []);
      setHistoryVideos((vh.data as GalleryVideoRow[]) ?? []);
      setTopaz2Videos((vt.data as GalleryVideoRow[]) ?? []);
      setMediaLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const currentPhotoRows = galleryEra === 'history' ? historyImages : topaz2Images;
  const visiblePhotos = currentPhotoRows.slice(0, photoLimit);
  const hasMorePhotos = currentPhotoRows.length > photoLimit;
  const currentVideos = galleryEra === 'history' ? historyVideos : topaz2Videos;

  // Any protected content in the current view?
  const hasProtectedContent =
    passwordConfigured &&
    !isUnlocked &&
    (currentPhotoRows.some((p) => p.is_protected) ||
      currentVideos.some((v) => v.is_protected));

  const handleUnlocked = () => {
    setIsUnlocked(true);
    setShowPasswordModal(false);
  };

  const requestUnlock = () => setShowPasswordModal(true);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">Memories</p>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[8rem] text-white leading-[0.85] tracking-tighter uppercase mb-8">
            Photo <span className="text-primary italic">Gallery</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>
      </section>

      {/* ── Era selector ──────────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setGalleryEra('history')}
              className={`flex-1 py-4 px-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${
                galleryEra === 'history'
                  ? 'bg-[#2E75B6] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              TOPAZ HISTORY
            </button>

            <button
              type="button"
              onClick={() => setGalleryEra('topaz20')}
              className={`flex-1 py-4 px-4 text-center font-bold text-sm uppercase tracking-wider transition-colors border-t sm:border-t-0 sm:border-l border-white/10 ${
                galleryEra === 'topaz20'
                  ? 'bg-[#2E75B6] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              TOPAZ 2.0
              <span className="block text-[10px] font-mono font-normal tracking-widest opacity-80 mt-0.5">
                New competition era
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Section heading + shared Photos / Videos tabs */}
      <div className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl border-b border-gray-100 px-4 py-8 sm:px-6 lg:px-8">
          {galleryEra === 'history' ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900 md:text-4xl">
                TOPAZ HISTORY
              </h2>
              {hasProtectedContent && (
                <button
                  type="button"
                  onClick={requestUnlock}
                  className="flex items-center gap-2 rounded-full border-2 border-[#2E75B6] px-4 py-2 text-sm font-bold text-[#2E75B6] hover:bg-[#2E75B6] hover:text-white transition-all"
                >
                  <Lock className="w-4 h-4" /> Unlock Protected Content
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900 md:text-4xl">
                  TOPAZ 2.0
                </h2>
                <p className="mt-2 font-mono text-sm font-bold uppercase tracking-widest text-[#2E75B6]">
                  New competition era
                </p>
              </div>
              {hasProtectedContent && (
                <button
                  type="button"
                  onClick={requestUnlock}
                  className="flex items-center gap-2 rounded-full border-2 border-[#2E75B6] px-4 py-2 text-sm font-bold text-[#2E75B6] hover:bg-[#2E75B6] hover:text-white transition-all"
                >
                  <Lock className="w-4 h-4" /> Unlock Protected Content
                </button>
              )}
            </div>
          )}
        </div>

        <div className="sticky top-20 z-40 border-b-2 border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl gap-2 px-4 sm:px-6 lg:px-8" role="tablist" aria-label="Gallery media">
            {(['photos', 'videos'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`flex min-h-[48px] min-w-[100px] flex-1 items-center justify-center rounded-t-lg px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors sm:min-w-[120px] sm:flex-none sm:px-8 sm:py-4 ${
                  activeTab === tab
                    ? 'border-b-[3px] border-[#2E75B6] bg-[#2E75B6]/5 text-[#2E75B6]'
                    : 'border-b-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab === 'photos' ? 'Photos' : 'Videos'}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {galleryEra === 'history' && activeTab === 'photos' && (
            <>
              {mediaLoading ? (
                <p className="py-20 text-center text-gray-400">Loading…</p>
              ) : visiblePhotos.length > 0 ? (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                  <Masonry gutter="28px">
                    {visiblePhotos.map((photo) => (
                      <GalleryPhotoItem
                        key={photo.id}
                        photo={photo}
                        isUnlocked={isUnlocked}
                        passwordConfigured={passwordConfigured}
                        onOpenLightbox={() =>
                          setLightboxImage({
                            src: photo.url,
                            alt: photo.caption || photo.filename || '',
                          })
                        }
                        onRequestUnlock={requestUnlock}
                      />
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <Images className="mx-auto mb-4 h-12 w-12 opacity-30" />
                  <p className="text-lg font-medium">No photos in this category yet.</p>
                </div>
              )}

              {!mediaLoading && hasMorePhotos && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPhotoLimit((prev) => prev + PHOTOS_PER_PAGE)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#2E75B6] px-8 py-4 font-bold text-[#2E75B6] transition-all duration-200 hover:bg-[#2E75B6] hover:text-white"
                  >
                    <ChevronDown className="h-5 w-5" />
                    Load More Photos ({currentPhotoRows.length - photoLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {galleryEra === 'history' && activeTab === 'videos' && (
            <>
              {mediaLoading ? (
                <p className="py-20 text-center text-gray-400">Loading…</p>
              ) : currentVideos.length > 0 ? (
                <div className="grid gap-10 md:grid-cols-2">
                  {currentVideos.map((v) => (
                    <GalleryVideoItem
                      key={v.id}
                      video={v}
                      isUnlocked={isUnlocked}
                      passwordConfigured={passwordConfigured}
                      onRequestUnlock={requestUnlock}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="mx-auto max-w-2xl rounded-2xl border-2 border-[#2E75B6]/25 bg-gradient-to-b from-[#2E75B6]/5 to-white px-8 py-14 text-center shadow-sm sm:px-12 sm:py-16"
                  role="tabpanel"
                >
                  <Clock className="mx-auto mb-5 h-12 w-12 text-[#2E75B6]" aria-hidden />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Coming Soon</p>
                  <h3 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-gray-900 md:text-3xl">
                    History videos coming soon
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-600">History videos coming soon.</p>
                </div>
              )}
            </>
          )}

          {galleryEra === 'topaz20' && activeTab === 'photos' && (
            <>
              {mediaLoading ? (
                <p className="py-20 text-center text-gray-400">Loading…</p>
              ) : topaz2Images.length > 0 ? (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                  <Masonry gutter="28px">
                    {visiblePhotos.map((photo) => (
                      <GalleryPhotoItem
                        key={photo.id}
                        photo={photo}
                        isUnlocked={isUnlocked}
                        passwordConfigured={passwordConfigured}
                        onOpenLightbox={() =>
                          setLightboxImage({
                            src: photo.url,
                            alt: photo.caption || photo.filename || '',
                          })
                        }
                        onRequestUnlock={requestUnlock}
                      />
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-16 text-center sm:py-20">
                  <Sparkles className="mb-4 h-12 w-12 text-[#2E75B6]" />
                  <span className="mb-4 inline-block rounded-full border border-[#2E75B6]/30 bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
                    Coming Soon
                  </span>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-gray-900 md:text-3xl">
                    TOPAZ 2.0 <span className="text-[#2E75B6] italic">Photos</span>
                  </h3>
                  <p className="mt-4 max-w-md text-gray-600">
                    Season photos will appear here after events. Check back for highlights from the new competition era.
                  </p>
                </div>
              )}
              {!mediaLoading && galleryEra === 'topaz20' && topaz2Images.length > photoLimit && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPhotoLimit((prev) => prev + PHOTOS_PER_PAGE)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#2E75B6] px-8 py-4 font-bold text-[#2E75B6] transition-all duration-200 hover:bg-[#2E75B6] hover:text-white"
                  >
                    <ChevronDown className="h-5 w-5" />
                    Load More Photos ({topaz2Images.length - photoLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {galleryEra === 'topaz20' && activeTab === 'videos' && (
            <>
              {mediaLoading ? (
                <p className="py-20 text-center text-gray-400">Loading…</p>
              ) : topaz2Videos.length > 0 ? (
                <div className="grid gap-10 md:grid-cols-2">
                  {topaz2Videos.map((v) => (
                    <GalleryVideoItem
                      key={v.id}
                      video={v}
                      isUnlocked={isUnlocked}
                      passwordConfigured={passwordConfigured}
                      onRequestUnlock={requestUnlock}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border-2 border-[#2E75B6]/25 bg-gradient-to-b from-gray-50 to-white px-8 py-14 text-center shadow-sm sm:px-12 sm:py-16"
                  role="tabpanel"
                >
                  <Sparkles className="mb-5 h-12 w-12 text-[#2E75B6]" aria-hidden />
                  <span className="mb-4 inline-block rounded-full border border-[#2E75B6]/30 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
                    Coming Soon
                  </span>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-gray-900 md:text-3xl">
                    TOPAZ 2.0 <span className="text-[#2E75B6] italic">Videos</span>
                  </h3>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
                    Videos for the new competition era are not available yet. Check back after events for highlights and recaps.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Photo Lightbox ────────────────────────────────────────────────── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="max-w-full max-h-[90vh] min-h-[120px] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={historyImageOnError}
          />
        </div>
      )}

      {/* ── Gallery Password Modal ─────────────────────────────────────────── */}
      {showPasswordModal && (
        <GalleryPasswordModal
          onClose={() => setShowPasswordModal(false)}
          onUnlocked={handleUnlocked}
        />
      )}
    </div>
  );
};

export default Gallery;
