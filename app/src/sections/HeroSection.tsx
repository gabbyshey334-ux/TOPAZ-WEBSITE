import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SHOWREEL_VIDEO_URL = 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68/480p/mp4/file.mp4';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo Animation
      gsap.fromTo(
        logoRef.current,
        { y: 100, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
          },
        }
      );

      // Underline Animation
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 0.8,
          duration: 1.2,
          delay: 0.8,
          ease: 'power3.out',
        }
      );

      // Tagline & Content Animation
      gsap.fromTo(
        taglineRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.5,
          ease: 'power3.out',
        }
      );

      // Stats Animation
      gsap.fromTo(
        '.hero-stat > div',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 1,
          ease: 'back.out(1.7)',
        }
      );

      // Background Parallax
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-16"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a] z-[2]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(46,117,182,0.15),transparent_70%)] z-[1]" />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-[1] mix-blend-overlay"></div>
        
        <video
          ref={bgRef}
          src={SHOWREEL_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale scale-105"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white px-6 sm:px-8 lg:px-16 xl:px-24 text-center max-w-7xl mx-auto pt-32 lg:pt-40">
        <div ref={logoRef} className="perspective-1000 mb-16">
          <h1 className="font-display font-black text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[13rem] tracking-tighter leading-[0.8] uppercase flex flex-col items-center drop-shadow-2xl">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">TOPAZ</span>
            <span className="inline-block text-primary italic border-primary underline decoration-primary/30 underline-offset-[1rem] decoration-8">2.0</span>
          </h1>

          <div
            ref={underlineRef}
            className="w-32 md:w-64 h-2 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-16 rounded-full shadow-[0_0_40px_rgba(46,117,182,0.8)] opacity-80"
          />
        </div>

        <div ref={taglineRef} className="space-y-12">
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            <p className="font-mono text-xs md:text-sm tracking-[0.5em] text-primary font-bold uppercase mb-6 drop-shadow-[0_2px_10px_rgba(46,117,182,0.5)]">
              Legacy Since 1972
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase leading-tight drop-shadow-xl">
              The Gold Standard in <br />
              <span className="text-white/60">Performing Arts Competition</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 mt-20 hero-stat border-y border-white/5 py-8 px-12 backdrop-blur-sm bg-black/20 rounded-3xl">
            <div className="text-center group cursor-default">
              <div className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-2 group-hover:text-primary transition-colors duration-300 drop-shadow-lg">50+</div>
              <div className="font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.2em] group-hover:text-white/80 transition-colors">Years Legacy</div>
            </div>
            <div className="w-px h-16 bg-white/10 hidden sm:block" />
            <div className="text-center group cursor-default">
              <div className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-2 group-hover:text-primary transition-colors duration-300 drop-shadow-lg">10K+</div>
              <div className="font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.2em] group-hover:text-white/80 transition-colors">Artists Trained</div>
            </div>
            <div className="w-px h-16 bg-white/10 hidden sm:block" />
            <div className="text-center group cursor-default">
              <div className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-2 group-hover:text-primary transition-colors duration-300 drop-shadow-lg">98%</div>
              <div className="font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.2em] group-hover:text-white/80 transition-colors">Success Rate</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 pt-12 pb-12">
            <a
              href="#about"
              className="hero-cta btn-primary !px-10 !py-6 lg:!px-14 lg:!py-6 text-lg lg:text-xl group shadow-[0_0_40px_rgba(46,117,182,0.3)] hover:shadow-[0_0_60px_rgba(46,117,182,0.5)] border border-primary/20 hover:border-primary/50 transition-all duration-300"
            >
              Start the Journey
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
            <button
              onClick={() => window.open(SHOWREEL_VIDEO_URL, '_blank', 'noopener,noreferrer')}
              className="hero-cta btn-secondary !bg-white/5 !text-white !border-white/10 hover:!bg-white/10 !px-10 !py-6 lg:!px-14 lg:!py-6 text-lg lg:text-xl inline-flex items-center gap-3 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Play className="w-3 h-3 fill-black text-black ml-0.5" />
              </span>
              Watch Showreel
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[2]" />
    </section>
  );
};

export default HeroSection;
