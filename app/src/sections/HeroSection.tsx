import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';

const SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';

const LOGO_MASKS_ONLY = 'images/logos/topaz-masks-only.png';
const LOGO_MASKS_FALLBACK = 'images/topaz-logo-masks.png';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState(LOGO_MASKS_ONLY);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo Fade In - slower and cinematic
      if (logoWrapperRef.current) {
        gsap.fromTo(
          logoWrapperRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }
        );
      }

      // Heading Reveal - Staggered
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
        );
      }

      // Underline Grow
      if (underlineRef.current) {
        gsap.fromTo(
          underlineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1, delay: 0.6, ease: 'power3.out' }
        );
      }

      // Tagline Fade Up
      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.8, ease: 'power3.out' }
        );
      }

      // Scroll Indicator Fade In
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
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-white pt-16"
    >
      {/* VIDEO SECTION - Top 70% (60vh mobile, 65vh tablet, 70vh desktop) */}
      <div className="relative h-[60vh] sm:h-[65vh] lg:h-[70vh] w-full overflow-hidden bg-black shadow-2xl">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        {/* LARGE THEATER MASKS LOGO - Centered, BIGGER, NO text overlay */}
        {!logoError && (
          <div 
            ref={logoWrapperRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <img
              src={`${import.meta.env.BASE_URL}${logoSrc}`}
              alt=""
              className="w-[80%] md:w-[70%] lg:w-[60%] max-w-5xl h-auto object-contain opacity-20 drop-shadow-2xl filter blur-[0.5px]"
              onError={() => {
                if (logoSrc === LOGO_MASKS_ONLY) {
                  setLogoSrc(LOGO_MASKS_FALLBACK);
                } else {
                  setLogoError(true);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* CONTENT SECTION - Bottom 30% */}
      <div className="relative bg-white flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[35vh] lg:min-h-[30vh] px-6 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto text-center">
          <h1
            ref={headingRef}
            className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem] tracking-tighter text-gray-900 leading-[0.85] mb-6 drop-shadow-sm"
          >
            TOPAZ <span className="text-[#2E75B6] italic relative inline-block">
              2.0
              {/* Optional: Subtle glow for the 2.0 */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full -z-10" />
            </span>
          </h1>

          <div
            ref={underlineRef}
            className="w-24 md:w-32 h-1.5 bg-[#2E75B6] mx-auto mb-8 rounded-full shadow-lg shadow-blue-500/30"
          />

          <p
            ref={taglineRef}
            className="font-mono text-xs sm:text-sm tracking-[0.4em] text-gray-500 uppercase font-bold"
          >
            EST. 1972 • EXCELLENCE IN DANCE
          </p>
        </div>

        <div 
          ref={scrollRef}
          className="absolute bottom-8 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-gray-300" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
