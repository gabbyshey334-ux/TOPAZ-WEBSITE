import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import { TopazMasksLogo } from '../components/TopazMasksLogo';

const SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';

const LOGO_CANDIDATES = [
  `${import.meta.env.BASE_URL}images/logos/topaz-masks-only.png`,
  `${import.meta.env.BASE_URL}images/logos/topaz-logo-masks.png`,
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logoSrcIndex, setLogoSrcIndex] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);

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

  const currentLogoSrc = LOGO_CANDIDATES[logoSrcIndex];

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full flex flex-col bg-black overflow-hidden">
      {/* 1) Video — ~55vh */}
      <div className="relative h-[50vh] sm:h-[52vh] md:h-[55vh] min-h-[260px] w-full shrink-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55 pointer-events-none" />
      </div>

      {/* 2) Logo banner */}
      <div
        className="relative z-10 w-full shrink-0 bg-gradient-to-b from-white via-slate-50 to-white border-b border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-4 md:py-5 min-h-[88px] md:min-h-[112px] flex flex-col items-center justify-center gap-1 md:gap-1.5 px-4"
        aria-label="TOPAZ logo"
      >
        {!logoFailed ? (
          <img
            src={currentLogoSrc}
            alt="TOPAZ theatrical masks logo"
            className="h-12 sm:h-14 md:h-16 w-auto max-w-[min(280px,85vw)] object-contain object-center"
            onError={() => {
              if (logoSrcIndex < LOGO_CANDIDATES.length - 1) {
                setLogoSrcIndex((i) => i + 1);
              } else {
                setLogoFailed(true);
              }
            }}
          />
        ) : (
          <TopazMasksLogo className="h-14 w-14 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem] text-[#2E75B6]" />
        )}
        <span className="font-display font-black text-[#1F4E78] tracking-[0.2em] text-sm sm:text-base md:text-lg uppercase">
          TOPAZ
        </span>
        <p className="font-mono text-[10px] sm:text-[11px] md:text-xs tracking-[0.22em] text-gray-500 uppercase font-semibold text-center max-w-xl leading-snug">
          EST. 1972 • THEATRICAL ARTS COMPETITION
        </p>
      </div>

      {/* 3) Title block + scroll */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-10 md:py-14 min-h-[38vh]">
        <h1
          ref={headingRef}
          className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-white leading-[0.9] mb-4"
        >
          TOPAZ <span className="text-[#2E75B6] italic">2.0</span>
        </h1>

        <div
          ref={underlineRef}
          className="w-24 h-1 bg-[#2E75B6] mx-auto mb-6 rounded-full origin-center"
        />

        <p
          ref={taglineRef}
          className="font-mono text-xs sm:text-sm tracking-[0.3em] text-white/80 uppercase font-bold"
        >
          EXCELLENCE IN DANCE
        </p>

        <div
          ref={scrollRef}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-white/60" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
