import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';

// Fallback used when the DB value for `hero_video_url` is missing or not yet loaded.
const DEFAULT_SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';
const BASE = import.meta.env.BASE_URL;
const MASK_LOGO = `${BASE}images/logos/topaz-logo-masks.png`;
const MASK_LOGO_FALLBACK = `${BASE}images/logos/topaz-logo.png`;

interface HeroSectionProps {
  /**
   * Optional URL for the background video. If omitted or empty, the default
   * showreel URL is used. Usually passed in from `Home.tsx` after being
   * loaded from the `site_content` table so admins can swap it without code.
   */
  videoUrl?: string | null;
}

const HeroSection = ({ videoUrl }: HeroSectionProps = {}) => {
  const activeVideoUrl = videoUrl && videoUrl.trim() ? videoUrl : DEFAULT_SHOWREEL_VIDEO_URL;
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logoSrc, setLogoSrc] = useState(MASK_LOGO);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.05 }
        );
      }
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
      <video
        key={activeVideoUrl /* reload when the URL changes */}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={activeVideoUrl} type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        {/* Theater masks logo — floats over video, same treatment as heading (no card) */}
        <img
          ref={logoRef}
          src={logoSrc}
          alt="TOPAZ"
          className="mb-8 max-h-[72px] w-auto max-w-full min-w-0 object-contain sm:mb-10 sm:max-h-[80px] sm:max-w-[min(100%,320px)]"
          data-fallback-tried=""
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.dataset.fallbackTried) {
              el.dataset.fallbackTried = '1';
              setLogoSrc(MASK_LOGO_FALLBACK);
            }
          }}
        />

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
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <ChevronDown className="h-8 w-8 text-white/60" aria-hidden />
      </div>
    </section>
  );
};

export default HeroSection;
