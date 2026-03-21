import { useState } from 'react';
import { Play, X, ChevronDown, Clock, Sparkles } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

/**
 * TOPAZ History (1972–2023) — add files under /public/images/gallery/
 */
const historyPhotos = [
  { id: 1, src: `${import.meta.env.BASE_URL}images/gallery/gallery-01.jpg`, alt: 'Competition 2025', category: 'competitions' },
  { id: 2, src: `${import.meta.env.BASE_URL}images/gallery/gallery-02.jpg`, alt: 'Dancers performing', category: 'competitions' },
  { id: 3, src: `${import.meta.env.BASE_URL}images/gallery/gallery-03.jpg`, alt: 'Stage performance', category: 'rehearsals' },
  { id: 4, src: `${import.meta.env.BASE_URL}images/gallery/gallery-04.jpg`, alt: 'Award ceremony', category: 'awards' },
  { id: 5, src: `${import.meta.env.BASE_URL}images/gallery/gallery-05.jpg`, alt: 'Group routine', category: 'competitions' },
  { id: 6, src: `${import.meta.env.BASE_URL}images/gallery/gallery-06.jpg`, alt: 'Solo performance', category: 'rehearsals' },
  { id: 7, src: `${import.meta.env.BASE_URL}images/gallery/gallery-07.jpg`, alt: 'TOPAZ Competition', category: 'competitions' },
];

const historyVideos = [
  { id: 1, title: 'Competition Highlights', youtubeId: '', thumbnail: '', category: 'competitions' },
  { id: 2, title: 'TOPAZ memories', youtubeId: '', thumbnail: '', category: 'competitions' },
];

type PhotoCategory = 'all' | 'competitions' | 'rehearsals' | 'awards';
type VideoCategory = 'all' | 'competitions' | 'rehearsals' | 'awards';
type GalleryEra = 'history' | 'topaz20';

const PHOTO_FILTERS: { label: string; value: PhotoCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Competitions', value: 'competitions' },
  { label: 'Rehearsals', value: 'rehearsals' },
  { label: 'Awards', value: 'awards' },
];

const VIDEO_FILTERS: { label: string; value: VideoCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Competitions', value: 'competitions' },
  { label: 'Rehearsals', value: 'rehearsals' },
  { label: 'Awards', value: 'awards' },
];

const PHOTOS_PER_PAGE = 8;
const VIDEOS_PER_PAGE = 6;

const Gallery = () => {
  const [galleryEra, setGalleryEra] = useState<GalleryEra>('history');
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photoFilter, setPhotoFilter] = useState<PhotoCategory>('all');
  const [videoFilter, setVideoFilter] = useState<VideoCategory>('all');
  const [photoLimit, setPhotoLimit] = useState(PHOTOS_PER_PAGE);
  const [videoLimit, setVideoLimit] = useState(VIDEOS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [videoModal, setVideoModal] = useState<{ title: string; youtubeId: string } | null>(null);

  const filteredPhotos =
    photoFilter === 'all' ? historyPhotos : historyPhotos.filter((p) => p.category === photoFilter);

  const visiblePhotos = filteredPhotos.slice(0, photoLimit);
  const hasMorePhotos = filteredPhotos.length > photoLimit;

  const filteredVideos =
    videoFilter === 'all' ? historyVideos : historyVideos.filter((v) => v.category === videoFilter);

  const visibleVideos = filteredVideos.slice(0, videoLimit);
  const hasMoreVideos = filteredVideos.length > videoLimit;

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
      {/* Hero */}
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

      {/* Era selector */}
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
              TOPAZ <span className="text-[#2E75B6] italic">2.0</span> media
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Photos and videos from the new TOPAZ 2.0 competition season will be published here after events.
              Check back for highlights, awards, and behind-the-scenes content.
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              We&apos;re getting the gallery ready for your 2026 memories.
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className="border-b border-gray-200 bg-white sticky top-20 z-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${
                    activeTab === 'photos'
                      ? 'text-[#2E75B6] border-b-2 border-[#2E75B6]'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${
                    activeTab === 'videos'
                      ? 'text-[#2E75B6] border-b-2 border-[#2E75B6]'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-12">
            <p className="text-center text-sm text-gray-500 mb-10 max-w-2xl mx-auto">
              Historical photos and videos from Topaz through 2023. New files can be added under{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">public/images/gallery/</code>.
            </p>

            {activeTab === 'photos' && (
              <>
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
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=800&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </button>
                      ))}
                    </Masonry>
                  </ResponsiveMasonry>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-lg font-medium">No photos in this category yet.</p>
                  </div>
                )}

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

            {activeTab === 'videos' && (
              <>
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
                        className="group text-left rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
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
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/60 p-6">
                              <Clock className="w-10 h-10 mb-2" />
                              <span className="text-sm text-center">Video coming soon — add YouTube ID in Gallery.tsx</span>
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

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
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

      {videoModal && videoModal.youtubeId && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setVideoModal(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
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
