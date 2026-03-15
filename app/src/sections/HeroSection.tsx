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
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState(LOGO_MASKS_ONLY);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );
      }
      if (underlineRef.current) {
        gsap.fromTo(
          underlineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
        );
      }
      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: 'power3.out' }
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
      <div className="relative h-[60vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Dark overlay for better logo visibility */}
        <div className="absolute inset-0 bg-black/30" />

        {/* LARGE THEATER MASKS LOGO - Centered, BIGGER, NO text overlay */}
        {!logoError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={`${import.meta.env.BASE_URL}${logoSrc}`}
              alt=""
              className="w-3/4 md:w-2/3 lg:w-1/2 h-auto object-contain opacity-20"
              style={{ maxWidth: '800px' }}
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
      <div className="relative bg-white py-12 sm:py-16 flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[35vh] lg:min-h-[30vh]">
        <h1
          ref={headingRef}
          className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-gray-900 leading-none mb-4 text-center"
        >
          TOPAZ <span className="text-[#2E75B6] italic">2.0</span>
        </h1>

        <div
          ref={underlineRef}
          className="w-20 md:w-24 h-1 bg-blue-600 rounded-full mb-6"
        />

        <p
          ref={taglineRef}
          className="font-mono text-sm tracking-[0.3em] text-gray-600 uppercase"
        >
          EST. 1972
        </p>

        <div className="mt-8">
          <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
