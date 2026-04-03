import { useState, useEffect, type SyntheticEvent } from 'react';
import { X, ChevronDown, Clock, Sparkles, Images } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

const BASE = import.meta.env.BASE_URL;
/** Local fallback if a history file 404s (avoids blank cells when external CDNs are blocked). */
const FALLBACK_HISTORY_IMG = `${BASE}images/gallery/history/founders-duo-striped-pants.jpg`;

function historyImageOnError(e: SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.dataset.fallbackApplied === '1') return;
  el.dataset.fallbackApplied = '1';
  el.src = FALLBACK_HISTORY_IMG;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPAZ HISTORY PHOTOS (paths must match files under public/images/gallery/history/)
// Note: stage-colorful-trio-vegas is reserved for the About page only — not listed here.
// ─────────────────────────────────────────────────────────────────────────────
const historyPhotos = [
  { id: 1,  src: `${BASE}images/gallery/history/founders-duo-ballgown.jpg`, alt: 'TOPAZ founders Pat and Bob dancing together in formal ballgown and suit' },
  { id: 2,  src: `${BASE}images/gallery/history/founders-duo-striped-pants.jpg`, alt: 'Founding duo in striped dance pants and performance wear' },
  { id: 3,  src: `${BASE}images/gallery/history/founders-duo-embrace.jpg`, alt: 'Founders in a close dance embrace on the floor' },
  { id: 4,  src: `${BASE}images/gallery/history/early-competition-registration-1972.jpg`, alt: 'Early TOPAZ competition registration scene, 1972' },
  { id: 5,  src: `${BASE}images/gallery/history/early-competition-planning-1972.jpg`, alt: 'Organizers planning an early TOPAZ competition, 1972' },
  { id: 6,  src: `${BASE}images/gallery/history/group-floral-costumes-1972.jpg`, alt: 'Large group of dancers in floral costumes on stage, 1972' },
  { id: 7,  src: `${BASE}images/gallery/history/large-cast-elaborate-stage.jpg`, alt: 'Large cast in an elaborate staged production number' },
  { id: 8,  src: `${BASE}images/gallery/history/stage-performance-feather-fans.jpg`, alt: 'Performers with feather fans in a theatrical stage routine' },
  { id: 9,  src: `${BASE}images/gallery/history/stage-fringe-costumes-performance.jpg`, alt: 'Dancers in fringe costumes performing on stage' },
  { id: 10, src: `${BASE}images/gallery/history/solo-winner-multiple-trophies-1974.jpg`, alt: 'Soloist posing with multiple trophies, 1974' },
  { id: 11, src: `${BASE}images/gallery/history/newspaper-bridge-entertainment-1975.jpg`, alt: '1975 newspaper clipping featuring TOPAZ in the Bridge Entertainment section' },
  { id: 12, src: `${BASE}images/gallery/history/stage-pink-sequin-group-1980s.jpg`, alt: 'Group number in pink sequin costumes on stage, 1980s' },
  { id: 13, src: `${BASE}images/gallery/history/stage-dramatic-performance-1980s.jpg`, alt: 'Dramatic stage performance with bold lighting, 1980s' },
  { id: 15, src: `${BASE}images/gallery/history/group-glitter-costumes-trophy.jpg`, alt: 'Ensemble in glitter costumes celebrating with a trophy' },
  { id: 16, src: `${BASE}images/gallery/history/newspaper-high-steppin-caesars.jpg`, alt: 'Newspaper clipping about High Steppin\' and TOPAZ at Caesars' },
  { id: 17, src: `${BASE}images/gallery/history/acrobatic-overhead-lift.jpg`, alt: 'Dancers performing an acrobatic overhead lift' },
  { id: 18, src: `${BASE}images/gallery/history/duo-large-trophy-ribbon.jpg`, alt: 'Duo with a large trophy and award ribbons' },
  { id: 19, src: `${BASE}images/gallery/history/boy-tuxedo-trophy-1990.jpg`, alt: 'Young dancer in tuxedo holding a trophy, circa 1990' },
  { id: 20, src: `${BASE}images/gallery/history/youth-group-teal-hats.jpg`, alt: 'Youth group in matching teal hats performing on stage' },
  { id: 21, src: `${BASE}images/gallery/history/youth-group-colorful-flapper.jpg`, alt: 'Youth ensemble in colorful flapper-style costumes' },
  { id: 22, src: `${BASE}images/gallery/history/backstage-duo-portrait.jpg`, alt: 'Vintage black and white performers photo with a man in a military-style hat beside a woman' },
  { id: 23, src: `${BASE}images/gallery/history/topaz-competition-banner-group.jpg`, alt: 'Large group photo with TOPAZ competition banner' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────
type GalleryEra = 'history' | 'topaz20';

const PHOTOS_PER_PAGE = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Component
// ─────────────────────────────────────────────────────────────────────────────
const Gallery = () => {
  const [galleryEra,    setGalleryEra]    = useState<GalleryEra>('history');
  const [activeTab,     setActiveTab]     = useState<'photos' | 'videos'>('photos');
  const [photoLimit,    setPhotoLimit]    = useState(PHOTOS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [videoModal,    setVideoModal]    = useState<{ title: string; youtubeId: string } | null>(null);

  useEffect(() => {
    setActiveTab('photos');
  }, [galleryEra]);

  const visiblePhotos  = historyPhotos.slice(0, photoLimit);
  const hasMorePhotos  = historyPhotos.length > photoLimit;

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

      {/* Section heading + shared Photos / Videos tabs (history & TOPAZ 2.0) */}
      <div className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl border-b border-gray-100 px-4 py-8 sm:px-6 lg:px-8">
          {galleryEra === 'history' ? (
            <div>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900 md:text-4xl">
                TOPAZ HISTORY
              </h2>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900 md:text-4xl">
                TOPAZ 2.0
              </h2>
              <p className="mt-2 font-mono text-sm font-bold uppercase tracking-widest text-[#2E75B6]">
                New competition era
              </p>
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
              {visiblePhotos.length > 0 ? (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                  <Masonry gutter="28px">
                    {visiblePhotos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setLightboxImage({ src: photo.src, alt: photo.alt })}
                        className="group relative mb-2 block min-h-[200px] w-full overflow-hidden rounded-2xl bg-gray-100 p-3 shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-3xl sm:p-4"
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="block min-h-[180px] h-auto max-h-[min(85vh,720px)] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                          onError={historyImageOnError}
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/0 transition-colors duration-300 group-hover:bg-black/10 sm:rounded-3xl" />
                      </button>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <Images className="mx-auto mb-4 h-12 w-12 opacity-30" />
                  <p className="text-lg font-medium">No photos in this category yet.</p>
                </div>
              )}

              {hasMorePhotos && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPhotoLimit((prev) => prev + PHOTOS_PER_PAGE)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#2E75B6] px-8 py-4 font-bold text-[#2E75B6] transition-all duration-200 hover:bg-[#2E75B6] hover:text-white"
                  >
                    <ChevronDown className="h-5 w-5" />
                    Load More Photos ({historyPhotos.length - photoLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {galleryEra === 'history' && activeTab === 'videos' && (
            <div
              className="mx-auto max-w-2xl rounded-2xl border-2 border-[#2E75B6]/25 bg-gradient-to-b from-[#2E75B6]/5 to-white px-8 py-14 text-center shadow-sm sm:px-12 sm:py-16"
              role="tabpanel"
            >
              <Clock className="mx-auto mb-5 h-12 w-12 text-[#2E75B6]" aria-hidden />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2E75B6]">Coming Soon</p>
              <h3 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-gray-900 md:text-3xl">
                History videos coming soon
              </h3>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Archived TOPAZ performances and memories will be published here when the files are ready. No previews are available yet.
              </p>
            </div>
          )}

          {galleryEra === 'topaz20' && activeTab === 'photos' && (
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

          {galleryEra === 'topaz20' && activeTab === 'videos' && (
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

      {/* ── Video Modal ───────────────────────────────────────────────────── */}
      {videoModal && videoModal.youtubeId && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setVideoModal(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setVideoModal(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title={videoModal.title}
              src={`https://www.youtube.com/embed/${videoModal.youtubeId}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;