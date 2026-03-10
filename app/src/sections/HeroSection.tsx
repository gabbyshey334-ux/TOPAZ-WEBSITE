import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play } from 'lucide-react';

const SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        logoRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }
      );
      gsap.fromTo(
        taglineRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1, delay: 0.6, ease: 'power3.out' }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster=""
        >
          <source src={SHOWREEL_VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      {/* Logo watermark overlay (subtle, so video stays visible) */}
      {!logoError && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-[1]">
          <img
            src={`${import.meta.env.BASE_URL}images/topaz-logo-masks.png`}
            alt=""
            className="w-2/3 max-w-4xl h-auto object-contain"
            onError={() => setLogoError(true)}
          />
        </div>
      )}

      {/* Gradient overlays for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[2]" />

      {/* Content */}
      <div ref={logoRef} className="relative z-10 text-center text-white px-6">
        <p className="text-sm md:text-base tracking-[0.3em] mb-4 text-[#2E75B6] font-semibold">
          STANDARDS OF EXCELLENCE
        </p>
        <h1 className="font-display font-black text-7xl md:text-9xl lg:text-[12rem] tracking-tighter leading-[0.9]">
          TOPAZ <span className="text-[#2E75B6] italic">2.0</span>
        </h1>
        <div
          ref={underlineRef}
          className="w-24 h-1 bg-[#2E75B6] mx-auto mt-8 mb-8"
        />
        <p ref={taglineRef} className="text-sm tracking-[0.3em] text-white/80 mb-12">
          EST. 1972
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href="#about"
            className="btn-primary !px-10 !py-5 text-lg group inline-flex items-center gap-2"
          >
            Start the Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            onClick={() => window.open(SHOWREEL_VIDEO_URL, '_blank', 'noopener,noreferrer')}
            className="btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 inline-flex items-center gap-2 !px-10 !py-5 text-lg"
          >
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </span>
            Watch Showreel
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-[2]" />
    </section>
  );
};

export default HeroSection;
