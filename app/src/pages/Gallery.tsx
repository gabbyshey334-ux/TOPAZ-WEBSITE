import { useState } from 'react';
import { Play, X } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

/*
  TO ADD NEW PHOTOS:
  1. Upload image to /public/images/gallery/
  2. Add entry to photos array below
  3. Format: { id: X, src: '/images/gallery/your-photo.jpg', alt: 'Description' }
*/
const photos = [
  { id: 1, src: `${import.meta.env.BASE_URL}images/gallery/photo-1.jpg`, alt: 'Competition 2025' },
  { id: 2, src: `${import.meta.env.BASE_URL}images/gallery/photo-2.jpg`, alt: 'Dancers performing' },
  { id: 3, src: `${import.meta.env.BASE_URL}images/gallery/photo-3.jpg`, alt: 'Stage performance' },
  { id: 4, src: `${import.meta.env.BASE_URL}images/gallery/photo-4.jpg`, alt: 'Award ceremony' },
  { id: 5, src: `${import.meta.env.BASE_URL}images/gallery/photo-5.jpg`, alt: 'Group routine' },
  { id: 6, src: `${import.meta.env.BASE_URL}images/gallery/photo-6.jpg`, alt: 'Solo performance' },
];

/*
  TO ADD NEW VIDEOS:
  1. Add entry to videos array below
  2. For YouTube: use youtubeId from the video URL (e.g. dQw4w9WgXcQ from youtube.com/watch?v=dQw4w9WgXcQ)
  3. Optional: add thumbnail path for custom thumb
*/
const videos = [
  { id: 1, title: 'Competition Highlights', youtubeId: '', thumbnail: '' },
  { id: 2, title: 'TOPAZ 2.0 Promo', youtubeId: '', thumbnail: '' },
];

const Gallery = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [videoModal, setVideoModal] = useState<{ title: string; youtubeId: string } | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#0a0a0a] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#0a0a0a]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-20">
          <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-white mb-4">
            Gallery
          </h1>
          <p className="text-white/70 text-lg md:text-xl">Moments from Our Competitions</p>
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

      <div className="max-w-7xl mx-auto px-6 py-16">
        {activeTab === 'photos' && (
          <>
            {/* Photo Gallery - Masonry-style grid */}
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
              <Masonry gutter="16px">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() =>
                      setLightboxImage({ src: photo.src, alt: photo.alt })
                    }
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
            
            {photos.length === 0 && (
              <p className="text-center text-gray-500 py-12">
                Add photos to the gallery by updating the photos array in Gallery.tsx and
                uploading images to /public/images/gallery/
              </p>
            )}
          </>
        )}

        {activeTab === 'videos' && (
          <>
            {/* Video Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
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
