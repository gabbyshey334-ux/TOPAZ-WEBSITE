import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  { src: '/assets/gallery_01.jpg', alt: 'Dancer feet in pointe shoes' },
  { src: '/assets/gallery_02.jpg', alt: 'Stage lights' },
  { src: '/assets/gallery_03.jpg', alt: 'Dancer portrait' },
  { src: '/assets/gallery_04.jpg', alt: 'Rehearsal studio' },
  { src: '/assets/gallery_05.jpg', alt: 'Audience and stage' },
  { src: '/assets/gallery_06.jpg', alt: 'Dancer stretching' },
];

const MediaWallSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;
    const about = aboutRef.current;

    if (!section || !heading || !grid || !about) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        heading,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );

      // Gallery cards animation
      const cards = grid.querySelectorAll('.gallery-card');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 55%',
              scrub: true,
            },
          }
        );
      });

      // About block animation
      gsap.fromTo(
        about,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: about,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flowing-section bg-secondary py-20 lg:py-32"
      style={{ zIndex: 30 }}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="mb-8">
          <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight text-foreground mb-4">
            THE SEASON IN FRAMES
          </h2>
          <p className="text-muted-foreground max-w-md">
            A few moments from rehearsals, stage, and the community around the
            season.
          </p>
        </div>

        {/* Gallery Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-16"
        >
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`gallery-card relative overflow-hidden group cursor-pointer ${
                index === 0
                  ? 'col-span-2 row-span-2'
                  : index === 3
                  ? 'col-span-1 row-span-2'
                  : ''
              }`}
              style={{
                aspectRatio:
                  index === 0 ? '16/10' : index === 3 ? '3/4' : '4/3',
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover img-monochrome transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* About Block */}
        <div ref={aboutRef} className="max-w-2xl">
          <div className="w-12 h-0.5 bg-primary mb-6" />
          <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
            About Topaz 2.0
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We're an independent dance competition built for dancers—not
            bureaucracy. Clear scoring. Fast scheduling. Respect for the work.
            Since 1972, we've been at the forefront of theatrical arts
            competitions, building a vibrant community of countless studios and
            thousands of contestants.
          </p>
          <a
            href="#about"
            className="inline-flex items-center gap-2 text-primary font-mono text-sm tracking-wider accent-underline"
          >
            Read our story
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MediaWallSection;
