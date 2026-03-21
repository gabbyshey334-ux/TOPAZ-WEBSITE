import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const EventCardSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const cta = ctaRef.current;

    if (!section || !image || !content || !cta) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0-30%)
      scrollTl
        .fromTo(
          image,
          { x: '-60vw', opacity: 0, scale: 1.06 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0
        )
        .fromTo(
          content.children,
          { x: '40vw', opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.03, ease: 'none' },
          0.05
        )
        .fromTo(
          cta,
          { y: '14vh', opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, ease: 'none' },
          0.12
        );

      // SETTLE (30-70%): Hold

      // EXIT (70-100%)
      scrollTl
        .fromTo(
          image,
          { x: 0, opacity: 1 },
          { x: '-20vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          content.children,
          { x: 0, opacity: 1 },
          { x: '20vw', opacity: 0, stagger: 0.02, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          cta,
          { y: 0, opacity: 1 },
          { y: '10vh', opacity: 0, ease: 'power2.in' },
          0.75
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="event"
      className="pinned-section bg-background"
      style={{ zIndex: 40 }}
    >
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Image Panel */}
        <div
          ref={imageRef}
          className="relative h-[45vh] lg:h-full overflow-hidden bg-black"
        >
          <img
            src={`${import.meta.env.BASE_URL}images/events/trophy-gold.jpg`}
            alt="The Return of TOPAZ 2.0"
            className="w-full h-full object-cover object-center img-monochrome scale-[1.08] rotate-[1.25deg]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 lg:to-background/40" />
        </div>

        {/* Right Content Panel */}
        <div className="flex flex-col justify-center px-6 lg:px-12 py-8 lg:py-0">
          <div ref={contentRef} className="max-w-md">
            {/* Label */}
            <span className="font-mono text-xs tracking-[0.2em] text-primary mb-4 block">
              SEASON 2026
            </span>

            {/* Title */}
            <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight text-foreground mb-8 leading-tight">
              THE RETURN OF TOPAZ 2.0
            </h2>

            {/* Meta List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-foreground">Sat, Aug 22, 2026</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 w-full">
                <MapPin className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <div>
                  <span className="text-foreground block font-semibold">
                    Seaside Convention Center
                  </span>
                  <span className="text-muted-foreground text-sm block">
                    415 1st Ave, Seaside, OR
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-foreground">8:00 AM – 12:00 PM</span>
              </div>
            </div>

            {/* CTA */}
            <a
              ref={ctaRef}
              href="#register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-mono text-sm tracking-wider btn-hover"
            >
              Register Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCardSection;
