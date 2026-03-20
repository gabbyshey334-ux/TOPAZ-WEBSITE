import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';

const SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
      className="relative bg-white pt-20"
    >
      {/* VIDEO SECTION - Balanced, responsive hero media */}
      <div className="relative h-[50vh] md:h-[55vh] xl:h-[60vh] w-full overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Subtle overlay for depth and readability transition into content */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35 pointer-events-none" />
        
        {/* NO TEXT OR LOGO IN VIDEO - Keep it clean */}
      </div>

      {/* CONTENT SECTION - Bottom part */}
      <div className="relative bg-white flex flex-col items-center justify-center py-20 lg:py-24 px-6 z-20">
        <div className="w-full max-w-5xl mx-auto text-center">
          <h1
            ref={headingRef}
            className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] tracking-tighter text-gray-900 leading-[0.88] mb-6"
          >
            TOPAZ <span className="text-[#2E75B6] italic relative inline-block">
              2.0
              {/* Optional: Subtle glow for the 2.0 */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full -z-10" />
            </span>
          </h1>

          <div
            ref={underlineRef}
            className="w-32 h-1 bg-[#2E75B6] mx-auto mb-8 rounded-full shadow-lg shadow-blue-500/30"
          />

          <p
            ref={taglineRef}
            className="font-mono text-[11px] sm:text-sm md:text-base tracking-[0.22em] sm:tracking-[0.28em] text-gray-600 uppercase font-bold"
          >
            EST. 1972 • EXCELLENCE IN DANCE
          </p>
        </div>

        <div 
          ref={scrollRef}
          className="mt-10 md:mt-12 animate-bounce"
        >
          <ChevronDown className="w-6 h-6 text-gray-400" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
