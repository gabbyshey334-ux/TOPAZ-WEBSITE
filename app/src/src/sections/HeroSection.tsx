import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';

const SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading slides up from below
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
        );
      }

      // Divider line grows outward
      if (dividerRef.current) {
        gsap.fromTo(
          dividerRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1, delay: 0.8, ease: 'power3.out' }
        );
      }

      // Tagline fades up
      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 1.1, ease: 'power3.out' }
        );
      }

      // Scroll indicator
      if (scrollRef.current) {
        gsap.fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, delay: 1.8, ease: 'power2.out' }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black pt-20"
    >
      {/* FULL-HEIGHT VIDEO WITH OVERLAID TEXT */}
      <div className="relative h-[72vh] md:h-[80vh] xl:h-[88vh] w-full overflow-hidden bg-black">
        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        >
          <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Layered overlays for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

        {/* TEXT OVERLAID ON VIDEO — vertically centered, bottom-weighted */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-20 lg:pb-24 px-6 z-10">
          <div className="text-center w-full max-w-5xl mx-auto">

            {/* Main heading */}
            <h1
              ref={headingRef}
              className="font-display font-black leading-[0.85] tracking-tighter mb-5"
              style={{ opacity: 0 }}
            >
              <span className="block text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">
                TOPAZ
              </span>
              <span
                className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]"
                style={{ color: '#2E75B6' }}
              >
                2.0
              </span>
            </h1>

            {/* Divider */}
            <div
              ref={dividerRef}
              className="w-24 h-[2px] bg-[#2E75B6] mx-auto mb-5 origin-center"
              style={{ opacity: 0 }}
            />

            {/* Tagline */}
            <p
              ref={taglineRef}
              className="font-mono text-xs sm:text-sm md:text-base tracking-[0.3em] sm:tracking-[0.38em] text-white/75 uppercase font-semibold"
              style={{ opacity: 0 }}
            >
              EST. 1972 &nbsp;•&nbsp; EXCELLENCE IN DANCE
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce z-10"
          style={{ opacity: 0 }}
        >
          <ChevronDown className="w-6 h-6 text-white/50" aria-hidden />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
