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
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

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
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <ChevronDown className="h-8 w-8 text-white/60" aria-hidden />
      </div>
    </section>
  );
};

export default HeroSection;
