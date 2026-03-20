import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StatementSectionProps {
  id: string;
  headline: string;
  body: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
  backgroundImage?: string;
}

const StatementSection = ({
  id,
  headline,
  body,
  ctaPrimary,
  ctaSecondary,
  backgroundImage,
}: StatementSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const headlineEl = headlineRef.current;
    const bodyEl = bodyRef.current;
    const ctaEl = ctaRef.current;
    const bgEl = bgRef.current;

    if (!section || !headlineEl || !bodyEl || !ctaEl) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0-30%)
      scrollTl
        .fromTo(
          headlineEl,
          { x: '-60vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          bodyEl,
          { x: '30vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(
          ctaEl.children,
          { y: '18vh', opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.02, ease: 'none' },
          0.1
        );

      if (bgEl) {
        scrollTl.fromTo(
          bgEl,
          { scale: 1.1, opacity: 0 },
          { scale: 1, opacity: 0.15, ease: 'none' },
          0
        );
      }

      // SETTLE (30-70%): Hold - no animation needed

      // EXIT (70-100%)
      scrollTl
        .fromTo(
          headlineEl,
          { x: 0, opacity: 1 },
          { x: '-40vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          bodyEl,
          { x: 0, opacity: 1 },
          { x: '20vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          ctaEl.children,
          { y: 0, opacity: 1 },
          { y: '12vh', opacity: 0, stagger: 0.02, ease: 'power2.in' },
          0.75
        );

      if (bgEl) {
        scrollTl.fromTo(
          bgEl,
          { scale: 1, opacity: 0.15 },
          { scale: 1.05, opacity: 0, ease: 'power2.in' },
          0.7
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="pinned-section bg-background flex items-center"
      style={{ zIndex: 20 }}
    >
      {/* Background Image (subtle) */}
      {backgroundImage && (
        <div
          ref={bgRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover img-monochrome"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Headline */}
          <h2
            ref={headlineRef}
            className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-foreground leading-none"
          >
            {headline}
          </h2>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* Body */}
            <div ref={bodyRef}>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                {body}
              </p>
            </div>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <a
                href={ctaPrimary.href}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono text-sm tracking-wider btn-hover"
              >
                {ctaPrimary.text}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={ctaSecondary.href}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-mono text-sm tracking-wider hover:border-primary hover:text-primary transition-colors"
              >
                {ctaSecondary.text}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatementSection;
