import { useState, useEffect } from 'react';
import { Play, X, ChevronDown, Clock, Sparkles, Images } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

// ─────────────────────────────────────────────────────────────────────────────
// TOPAZ HISTORY PHOTOS (1972–2023)
// Drop images into /public/images/gallery/ and add entries below.
// ─────────────────────────────────────────────────────────────────────────────
const historyPhotos = [
  { id: 1,  src: `${import.meta.env.BASE_URL}images/gallery/history/founders-duo-ballgown.jpg`, alt: 'TOPAZ founders Pat and Bob dancing together in formal ballgown and suit', category: 'competitions' },
  { id: 2,  src: `${import.meta.env.BASE_URL}images/gallery/history/founders-duo-striped-pants.jpg`, alt: 'Founding duo in striped dance pants and performance wear', category: 'competitions' },
  { id: 3,  src: `${import.meta.env.BASE_URL}images/gallery/history/founders-duo-embrace.jpg`, alt: 'Founders in a close dance embrace on the floor', category: 'competitions' },
  { id: 4,  src: `${import.meta.env.BASE_URL}images/gallery/history/early-competition-registration-1972.jpg`, alt: 'Early TOPAZ competition registration scene, 1972', category: 'competitions' },
  { id: 5,  src: `${import.meta.env.BASE_URL}images/gallery/history/early-competition-planning-1972.jpg`, alt: 'Organizers planning an early TOPAZ competition, 1972', category: 'competitions' },
  { id: 6,  src: `${import.meta.env.BASE_URL}images/gallery/history/group-floral-costumes-1972.jpg`, alt: 'Large group of dancers in floral costumes on stage, 1972', category: 'competitions' },
  { id: 7,  src: `${import.meta.env.BASE_URL}images/gallery/history/large-cast-elaborate-stage.jpg`, alt: 'Large cast in an elaborate staged production number', category: 'competitions' },
  { id: 8,  src: `${import.meta.env.BASE_URL}images/gallery/history/stage-performance-feather-fans.jpg`, alt: 'Performers with feather fans in a theatrical stage routine', category: 'competitions' },
  { id: 9,  src: `${import.meta.env.BASE_URL}images/gallery/history/stage-fringe-costumes-performance.jpg`, alt: 'Dancers in fringe costumes performing on stage', category: 'competitions' },
  { id: 10, src: `${import.meta.env.BASE_URL}images/gallery/history/solo-winner-multiple-trophies-1974.jpg`, alt: 'Soloist posing with multiple trophies, 1974', category: 'awards' },
  { id: 11, src: `${import.meta.env.BASE_URL}images/gallery/history/newspaper-bridge-entertainment-1975.jpg`, alt: '1975 newspaper clipping featuring TOPAZ in the Bridge Entertainment section', category: 'awards' },
  { id: 12, src: `${import.meta.env.BASE_URL}images/gallery/history/stage-pink-sequin-group-1980s.jpg`, alt: 'Group number in pink sequin costumes on stage, 1980s', category: 'competitions' },
  { id: 13, src: `${import.meta.env.BASE_URL}images/gallery/history/stage-dramatic-performance-1980s.jpg`, alt: 'Dramatic stage performance with bold lighting, 1980s', category: 'competitions' },
  { id: 15, src: `${import.meta.env.BASE_URL}images/gallery/history/group-glitter-costumes-trophy.jpg`, alt: 'Ensemble in glitter costumes celebrating with a trophy', category: 'competitions' },
  { id: 16, src: `${import.meta.env.BASE_URL}images/gallery/history/newspaper-high-steppin-caesars.jpg`, alt: 'Newspaper clipping about High Steppin\' and TOPAZ at Caesars', category: 'competitions' },
  { id: 17, src: `${import.meta.env.BASE_URL}images/gallery/history/acrobatic-overhead-lift.jpg`, alt: 'Dancers performing an acrobatic overhead lift', category: 'competitions' },
  { id: 18, src: `${import.meta.env.BASE_URL}images/gallery/history/duo-large-trophy-ribbon.jpg`, alt: 'Duo with a large trophy and award ribbons', category: 'awards' },
  { id: 19, src: `${import.meta.env.BASE_URL}images/gallery/history/boy-tuxedo-trophy-1990.jpg`, alt: 'Young dancer in tuxedo holding a trophy, circa 1990', category: 'awards' },
  { id: 20, src: `${import.meta.env.BASE_URL}images/gallery/history/youth-group-teal-hats.jpg`, alt: 'Youth group in matching teal hats performing on stage', category: 'competitions' },
  { id: 21, src: `${import.meta.env.BASE_URL}images/gallery/history/youth-group-colorful-flapper.jpg`, alt: 'Youth ensemble in colorful flapper-style costumes', category: 'competitions' },
  { id: 22, src: `${import.meta.env.BASE_URL}images/gallery/history/topaz-performers-vintage-duo.png`, alt: 'Vintage black and white performers photo with a man in a military-style hat beside a woman', category: 'competitions' },
  { id: 23, src: `${import.meta.env.BASE_URL}images/gallery/history/topaz-competition-banner-group.jpg`, alt: 'Large group photo with TOPAZ competition banner', category: 'competitions' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPAZ HISTORY VIDEOS (1972–2023)
// Add youtubeId once videos are ready.
// ─────────────────────────────────────────────────────────────────────────────
const historyVideos = [
  { id: 1, title: 'Topaz Memories', youtubeId: '', thumbnail: '' },
  { id: 2, title: 'Topaz 2.0', youtubeId: '', thumbnail: '' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────
type PhotoCategory = 'all' | 'competitions' | 'awards';
type GalleryEra    = 'history' | 'topaz20';

const PHOTO_FILTERS: { label: string; value: PhotoCategory }[] = [
  { label: 'All',          value: 'all'          },
  { label: 'Competitions', value: 'competitions' },
  { label: 'Awards',       value: 'awards'       },
];

const PHOTOS_PER_PAGE = 8;
const VIDEOS_PER_PAGE = 6;

// Fallback placeholder shown when an image file is missing
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=800&fit=crop';

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Component
// ─────────────────────────────────────────────────────────────────────────────
const Gallery = () => {
  const [galleryEra,    setGalleryEra]    = useState<GalleryEra>('history');
  const [activeTab,     setActiveTab]     = useState<'photos' | 'videos'>('photos');
  const [photoFilter,   setPhotoFilter]   = useState<PhotoCategory>('all');
  const [photoLimit,    setPhotoLimit]    = useState(PHOTOS_PER_PAGE);
  const [videoLimit,    setVideoLimit]    = useState(VIDEOS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [videoModal,    setVideoModal]    = useState<{ title: string; youtubeId: string } | null>(null);

  useEffect(() => {
    setActiveTab('photos');
  }, [galleryEra]);

  const filteredPhotos =
    photoFilter === 'all'
      ? historyPhotos
      : historyPhotos.filter((p) => p.category === photoFilter);

  const visiblePhotos  = filteredPhotos.slice(0, photoLimit);
  const hasMorePhotos  = filteredPhotos.length > photoLimit;

  const visibleVideos  = historyVideos.slice(0, videoLimit);
  const hasMoreVideos  = historyVideos.length > videoLimit;

  const handlePhotoFilterChange = (filter: PhotoCategory) => {
    setPhotoFilter(filter);
    setPhotoLimit(PHOTOS_PER_PAGE);
  };

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
              <span className="block text-[10px] font-mono font-normal tracking-widest opacity-80 mt-0.5">
                1972 – 2023 · The Return
              </span>
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
              <p className="mt-2 font-mono text-sm font-bold uppercase tracking-widest text-[#2E75B6]">
                1972 – 2023 · The Return
              </p>
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

        <div className="sticky top-20 z-20 border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
            {(['photos', 'videos'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors sm:px-6 sm:py-4 ${
                  activeTab === tab
                    ? 'border-b-2 border-[#2E75B6] text-[#2E75B6]'
                    : 'text-gray-500 hover:text-gray-800'
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
              <div className="mb-10 flex flex-wrap gap-2">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handlePhotoFilterChange(f.value)}
                    className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                      photoFilter === f.value
                        ? 'bg-[#2E75B6] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                    {f.value !== 'all' && (
                      <span className="ml-1.5 text-xs opacity-70">
                        ({historyPhotos.filter((ph) => ph.category === f.value).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {visiblePhotos.length > 0 ? (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                  <Masonry gutter="28px">
                    {visiblePhotos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setLightboxImage({ src: photo.src, alt: photo.alt })}
                        className="group relative mb-2 block w-full overflow-hidden rounded-2xl bg-gray-100 p-3 shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-3xl sm:p-4"
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="block h-auto max-h-[min(85vh,720px)] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMG;
                          }}
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
                    Load More Photos ({filteredPhotos.length - photoLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {galleryEra === 'history' && activeTab === 'videos' && (
            <>
              <div className="mb-8 rounded-2xl border border-[#2E75B6]/20 bg-[#2E75B6]/5 p-5 text-center sm:p-6">
                <p className="text-sm font-bold uppercase tracking-wider text-[#2E75B6]">Coming Soon</p>
                <p className="mt-2 text-base font-medium text-gray-700">History videos coming soon</p>
              </div>
              {visibleVideos.length > 0 ? (
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
                  {visibleVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() =>
                        video.youtubeId
                          ? setVideoModal({ title: video.title, youtubeId: video.youtubeId })
                          : undefined
                      }
                      className={`group overflow-hidden rounded-2xl bg-gray-100 text-left shadow-lg transition-all duration-300 ${
                        video.youtubeId ? 'cursor-pointer hover:shadow-xl' : 'cursor-default'
                      }`}
                    >
                      <div className="relative aspect-video bg-gray-900">
                        {video.youtubeId ? (
                          <>
                            <img
                              src={
                                video.thumbnail ||
                                `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
                              }
                              alt={video.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2E75B6] text-white">
                                <Play className="ml-1 h-8 w-8 fill-white" />
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-white/40">
                            <Clock className="mb-3 h-10 w-10" />
                            <span className="text-center text-sm font-medium">Coming Soon</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-lg font-bold text-gray-900">{video.title}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg font-medium">No videos yet.</p>
                </div>
              )}

              {hasMoreVideos && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVideoLimit((prev) => prev + VIDEOS_PER_PAGE)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#2E75B6] px-8 py-4 font-bold text-[#2E75B6] transition-all duration-200 hover:bg-[#2E75B6] hover:text-white"
                  >
                    <ChevronDown className="h-5 w-5" />
                    Load More Videos ({historyVideos.length - videoLimit} remaining)
                  </button>
                </div>
              )}
            </>
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
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-16 text-center sm:py-20">
              <Sparkles className="mb-4 h-12 w-12 text-[#2E75B6]" />
              <span className="mb-4 inline-block rounded-full border border-[#2E75B6]/30 bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
                Coming Soon
              </span>
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-gray-900 md:text-3xl">
                TOPAZ 2.0 <span className="text-[#2E75B6] italic">Videos</span>
              </h3>
              <p className="mt-4 max-w-md text-gray-600">
                Video highlights for <strong>Topaz Memories</strong> and <strong>Topaz 2.0</strong> will be published here when ready.
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
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
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