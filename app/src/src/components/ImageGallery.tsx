import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export type GalleryLayout = 'grid' | 'masonry';

export interface ImageGalleryProps {
  background: 'black' | 'white';
  images: GalleryImage[];
  layout?: GalleryLayout;
  heading?: string;
  className?: string;
}

const ImageGallery = ({
  background,
  images,
  layout = 'grid',
  heading,
  className = '',
}: ImageGalleryProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const isBlack = background === 'black';
  const bgClass = isBlack ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black';

  useEffect(() => {
    const section = sectionRef.current;
    const items = galleryRef.current?.querySelectorAll('.gallery-item');
    if (!section || !items?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [images.length]);

  return (
    <section
      ref={sectionRef}
      className={`${bgClass} py-20 md:py-32 ${className}`}
      aria-label={heading ?? 'Image gallery'}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        {heading && (
          <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-center mb-12 md:mb-16">
            {heading}
          </h2>
        )}
        <div
          ref={galleryRef}
          className={
            layout === 'masonry'
              ? 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {images.map((img, index) => (
            <div
              key={`${img.src}-${index}`}
              className="gallery-item break-inside-avoid overflow-hidden rounded-lg group"
            >
              {/* PLACEHOLDER - Replace with real photo */}
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
              />
              {img.caption && (
                <p className="mt-2 text-sm opacity-80">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;
