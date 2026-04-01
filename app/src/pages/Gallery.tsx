import { useState } from 'react';
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
  { id: 14, src: `${import.meta.env.BASE_URL}images/gallery/history/stage-colorful-trio-vegas.jpg`, alt: 'Colorful trio in Las Vegas–style costumes on stage', category: 'competitions' },
  { id: 15, src: `${import.meta.env.BASE_URL}images/gallery/history/group-glitter-costumes-trophy.jpg`, alt: 'Ensemble in glitter costumes celebrating with a trophy', category: 'competitions' },
  { id: 16, src: `${import.meta.env.BASE_URL}images/gallery/history/newspaper-high-steppin-caesars.jpg`, alt: 'Newspaper clipping about High Steppin\' and TOPAZ at Caesars', category: 'competitions' },
  { id: 17, src: `${import.meta.env.BASE_URL}images/gallery/history/acrobatic-overhead-lift.jpg`, alt: 'Dancers rehearsing an acrobatic overhead lift', category: 'rehearsals' },
  { id: 18, src: `${import.meta.env.BASE_URL}images/gallery/history/duo-large-trophy-ribbon.jpg`, alt: 'Duo with a large trophy and award ribbons', category: 'awards' },
  { id: 19, src: `${import.meta.env.BASE_URL}images/gallery/history/boy-tuxedo-trophy-1990.jpg`, alt: 'Young dancer in tuxedo holding a trophy, circa 1990', category: 'awards' },
  { id: 20, src: `${import.meta.env.BASE_URL}images/gallery/history/youth-group-teal-hats.jpg`, alt: 'Youth group in matching teal hats performing on stage', category: 'competitions' },
  { id: 21, src: `${import.meta.env.BASE_URL}images/gallery/history/youth-group-colorful-flapper.jpg`, alt: 'Youth ensemble in colorful flapper-style costumes', category: 'competitions' },
  { id: 22, src: `${import.meta.env.BASE_URL}images/gallery/history/backstage-duo-portrait.jpg`, alt: 'Two dancers posing together backstage', category: 'rehearsals' },
  { id: 23, src: `${import.meta.env.BASE_URL}images/gallery/history/topaz-competition-banner-group.jpg`, alt: 'Large group photo with TOPAZ competition banner', category: 'competitions' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPAZ HISTORY VIDEOS (1972–2023)
// Add youtubeId once videos are ready.
// ─────────────────────────────────────────────────────────────────────────────
const historyVideos = [
  { id: 1, title: 'Competition Highlights', youtubeId: '', thumbnail: '', category: 'competitions' },
  { id: 2, title: 'TOPAZ Memories',         youtubeId: '', thumbnail: '', category: 'competitions' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────
type PhotoCategory = 'all' | 'competitions' | 'rehearsals' | 'awards';
type VideoCategory = 'all' | 'competitions' | 'rehearsals' | 'awards';
type GalleryEra    = 'history' | 'topaz20';

const PHOTO_FILTERS: { label: string; value: PhotoCategory }[] = [
  { label: 'All',          value: 'all'          },
  { label: 'Competitions', value: 'competitions' },
  { label: 'Rehearsals',   value: 'rehearsals'   },
  { label: 'Awards',       value: 'awards'       },
];

const VIDEO_FILTERS: { label: string; value: VideoCategory }[] = [
  { label: 'All',          value: 'all'          },
  { label: 'Competitions', value: 'competitions' },
  { label: 'Rehearsals',   value: 'rehearsals'   },
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
  const [videoFilter,   setVideoFilter]   = useState<VideoCategory>('all');
  const [photoLimit,    setPhotoLimit]    = useState(PHOTOS_PER_PAGE);
  const [videoLimit,    setVideoLimit]    = useState(VIDEOS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [videoModal,    setVideoModal]    = useState<{ title: string; youtubeId: string } | null>(null);

  const filteredPhotos =
    photoFilter === 'all'
      ? historyPhotos
      : historyPhotos.filter((p) => p.category === photoFilter);

  const visiblePhotos  = filteredPhotos.slice(0, photoLimit);
  const hasMorePhotos  = filteredPhotos.length > photoLimit;

  const filteredVideos =
    videoFilter === 'all'
      ? historyVideos
      : historyVideos.filter((v) => v.category === videoFilter);

  const visibleVideos  = filteredVideos.slice(0, videoLimit);
  const hasMoreVideos  = filteredVideos.length > videoLimit;

  const handlePhotoFilterChange = (filter: PhotoCategory) => {
    setPhotoFilter(filter);
    setPhotoLimit(PHOTOS_PER_PAGE);
  };

  const handleVideoFilterChange = (filter: VideoCategory) => {
    setVideoFilter(filter);
    setVideoLimit(VIDEOS_PER_PAGE);
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
              Topaz History
              <span className="block text-[10px] font-mono font-normal tracking-widest opacity-80 mt-0.5">
                1972 – 2023
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

      {/* ── TOPAZ 2.0 — Coming Soon ───────────────────────────────────────── */}
      {galleryEra === 'topaz20' ? (
        <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2E75B6]/10 text-[#2E75B6] mb-8">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="inline-block rounded-full border border-[#2E75B6]/30 bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2E75B6] mb-6">
              Coming Soon
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-gray-900 mb-6 uppercase tracking-tight">
              TOPAZ <span className="text-[#2E75B6] italic">2.0</span> Media
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Photos and videos from the new TOPAZ 2.0 competition season will be published here
              after events. Check back for highlights, awards, and behind-the-scenes content.
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              We&apos;re getting the gallery ready for your 2026 memories.
            </p>
          </div>
        </section>

      ) : (

        /* ── TOPAZ HISTORY ──────────────────────────────────────────────── */
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white sticky top-20 z-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex gap-1">
                {(['photos', 'videos'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${
                      activeTab === tab
                        ? 'text-[#2E75B6] border-b-2 border-[#2E75B6]'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

            {/* ── Photos tab ─────────────────────────────────────────────── */}
        {activeTab === 'photos' && (
          <>
                {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {PHOTO_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handlePhotoFilterChange(f.value)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                    photoFilter === f.value
                      ? 'bg-[#2E75B6] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                  {f.value !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-70">
                          ({historyPhotos.filter((p) => p.category === f.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

                {/* Masonry grid */}
            {visiblePhotos.length > 0 ? (
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                <Masonry gutter="16px">
                  {visiblePhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightboxImage({ src: photo.src, alt: photo.alt })}
                      className="relative group w-full rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] block mb-4"
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 block"
                        onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_IMG;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </button>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            ) : (
              <div className="text-center py-20 text-gray-400">
                    <Images className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No photos in this category yet.</p>
              </div>
            )}

                {/* Load more */}
            {hasMorePhotos && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setPhotoLimit((prev) => prev + PHOTOS_PER_PAGE)}
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#2E75B6] text-[#2E75B6] font-bold rounded-xl hover:bg-[#2E75B6] hover:text-white transition-all duration-200"
                >
                  <ChevronDown className="w-5 h-5" />
                  Load More Photos ({filteredPhotos.length - photoLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}

            {/* ── Videos tab ─────────────────────────────────────────────── */}
        {activeTab === 'videos' && (
          <>
                {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {VIDEO_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleVideoFilterChange(f.value)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                    videoFilter === f.value
                      ? 'bg-[#2E75B6] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

                {/* Video grid */}
            {visibleVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() =>
                      video.youtubeId
                        ? setVideoModal({ title: video.title, youtubeId: video.youtubeId })
                        : undefined
                    }
                        className={`group text-left rounded-2xl overflow-hidden bg-gray-100 shadow-lg transition-all duration-300 ${
                          video.youtubeId ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
                        }`}
                  >
                    <div className="aspect-video relative bg-gray-900">
                      {video.youtubeId ? (
                        <>
                          <img
                            src={
                              video.thumbnail ||
                              `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
                            }
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                            <span className="w-16 h-16 rounded-full bg-[#2E75B6] flex items-center justify-center text-white">
                              <Play className="w-8 h-8 fill-white ml-1" />
                            </span>
                          </div>
                        </>
                      ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 p-6">
                              <Clock className="w-10 h-10 mb-3" />
                              <span className="text-sm text-center font-medium">Coming Soon</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-lg text-gray-900">{video.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">No videos in this category yet.</p>
              </div>
            )}

                {/* Load more */}
            {hasMoreVideos && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVideoLimit((prev) => prev + VIDEOS_PER_PAGE)}
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#2E75B6] text-[#2E75B6] font-bold rounded-xl hover:bg-[#2E75B6] hover:text-white transition-all duration-200"
                >
                  <ChevronDown className="w-5 h-5" />
                  Load More Videos ({filteredVideos.length - videoLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
        </>
      )}

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