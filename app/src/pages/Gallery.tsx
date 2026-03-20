import { useState } from 'react';
import { Play, X, ChevronDown } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

/*
  TO ADD NEW PHOTOS:
  1. Upload image to /public/images/gallery/
  2. Add entry to photos array below
  3. Format: { id: X, src: '/images/gallery/your-photo.jpg', alt: 'Description', category: 'competitions' | 'rehearsals' | 'awards' }
*/
const photos = [
  { id: 1, src: `${import.meta.env.BASE_URL}images/gallery/photo-1.jpg`, alt: 'Competition 2025', category: 'competitions' },
  { id: 2, src: `${import.meta.env.BASE_URL}images/gallery/photo-2.jpg`, alt: 'Dancers performing', category: 'competitions' },
  { id: 3, src: `${import.meta.env.BASE_URL}images/gallery/photo-3.jpg`, alt: 'Stage performance', category: 'rehearsals' },
  { id: 4, src: `${import.meta.env.BASE_URL}images/gallery/photo-4.jpg`, alt: 'Award ceremony', category: 'awards' },
  { id: 5, src: `${import.meta.env.BASE_URL}images/gallery/photo-5.jpg`, alt: 'Group routine', category: 'competitions' },
  { id: 6, src: `${import.meta.env.BASE_URL}images/gallery/photo-6.jpg`, alt: 'Solo performance', category: 'rehearsals' },
];

/*
  TO ADD NEW VIDEOS:
  1. Add entry to videos array below
  2. For YouTube: use youtubeId from the video URL (e.g. dQw4w9WgXcQ from youtube.com/watch?v=dQw4w9WgXcQ)
  3. Optional: add thumbnail path for custom thumb
  4. category: 'competitions' | 'rehearsals' | 'awards'
*/
const videos = [
  { id: 1, title: 'Competition Highlights', youtubeId: '', thumbnail: '', category: 'competitions' },
  { id: 2, title: 'TOPAZ 2.0 Promo', youtubeId: '', thumbnail: '', category: 'competitions' },
];

type PhotoCategory = 'all' | 'competitions' | 'rehearsals' | 'awards';
type VideoCategory = 'all' | 'competitions' | 'rehearsals' | 'awards';

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
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photoFilter, setPhotoFilter] = useState<PhotoCategory>('all');
  const [videoFilter, setVideoFilter] = useState<VideoCategory>('all');
  const [photoLimit, setPhotoLimit] = useState(PHOTOS_PER_PAGE);
  const [videoLimit, setVideoLimit] = useState(VIDEOS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [videoModal, setVideoModal] = useState<{ title: string; youtubeId: string } | null>(null);

  const filteredPhotos = photoFilter === 'all'
    ? photos
    : photos.filter((p) => p.category === photoFilter);

  const visiblePhotos = filteredPhotos.slice(0, photoLimit);
  const hasMorePhotos = filteredPhotos.length > photoLimit;

  const filteredVideos = videoFilter === 'all'
    ? videos
    : videos.filter((v) => v.category === videoFilter);

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
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            Memories
          </p>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[8rem] text-white leading-[0.85] tracking-tighter uppercase mb-8">
            Photo <span className="text-primary italic">Gallery</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
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
        {activeTab === 'photos' && (
          <>
            {/* Photo Filters */}
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
                      ({photos.filter((p) => p.category === f.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Photo Masonry Grid */}
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
                <p className="text-sm mt-2">Check back after the competition!</p>
              </div>
            )}

            {/* Load More */}
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
            {/* Video Filters */}
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

            {/* Video Grid */}
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
                          <Play className="w-12 h-12 mb-2" />
                          <span className="text-sm">Add YouTube ID in Gallery.tsx</span>
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
                <p className="text-sm mt-2">Videos will be added after the competition.</p>
              </div>
            )}

            {/* Load More Videos */}
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

      {/* Photo Lightbox */}
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

      {/* Video Modal */}
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
