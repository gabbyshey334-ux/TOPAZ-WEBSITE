import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

const BASE = import.meta.env.BASE_URL;

const HERO_SLIDES: { src: string; alt: string }[] = [
  { src: `${BASE}images/homepage/boy-tuxedo-trophy.png`, alt: 'Vintage TOPAZ — young dancer with trophy' },
  { src: `${BASE}images/homepage/duo-trophy.png`, alt: 'Vintage TOPAZ — duo with trophy' },
  { src: `${BASE}images/homepage/group-dancers-trophy.png`, alt: 'Vintage TOPAZ — group with trophy' },
  { src: `${BASE}images/homepage/newspaper-1975.png`, alt: '1975 newspaper clipping featuring TOPAZ' },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 25 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 5500);
    return () => window.clearInterval(id);
  }, [emblaApi]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
        );
      }

      if (underlineRef.current) {
        gsap.fromTo(
          underlineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1, delay: 0.6, ease: 'power3.out' }
        );
      }

      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.8, ease: 'power3.out' }
        );
      }

      if (scrollRef.current) {
        gsap.fromTo(
          scrollRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {HERO_SLIDES.map((slide) => (
            <div key={slide.src} className="relative min-w-0 flex-[0_0_100%] h-full">
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/65" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1
          ref={headingRef}
          className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-white leading-[0.9] mb-4"
        >
          TOPAZ <span className="text-[#2E75B6] italic">2.0</span>
        </h1>

        <div
          ref={underlineRef}
          className="mx-auto mb-6 h-1 w-24 origin-center rounded-full bg-[#2E75B6]"
        />

        <p
          ref={taglineRef}
          className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-white/80 sm:text-sm"
        >
          EST. 1972 • EXCELLENCE IN DANCE
        </p>
      </div>

      <div
        className="pointer-events-auto absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-20"
        role="tablist"
        aria-label="Hero image slides"
      >
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={selectedIndex === i}
            aria-label={`Slide ${i + 1} of ${HERO_SLIDES.length}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              selectedIndex === i ? 'w-8 bg-[#2E75B6]' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </div>

      <div ref={scrollRef} className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/60" aria-hidden />
      </div>
    </section>
  );
};

export default HeroSection;
