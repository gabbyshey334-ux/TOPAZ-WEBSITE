import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ClientLogo {
  src?: string;
  alt: string;
  name?: string;
}

export interface ClientLogosProps {
  background: 'black' | 'white';
  heading: string;
  logos: ClientLogo[];
  className?: string;
}

function ClientLogoItem({ logo }: { logo: ClientLogo }) {
  const [useFallback, setUseFallback] = useState(!logo.src);

  return (
    <div className="logo-item flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 min-h-[80px]">
      {logo.src && !useFallback ? (
        <img
          src={logo.src}
          alt={logo.alt}
          loading="lazy"
          className="max-h-16 w-auto object-contain"
          onError={() => setUseFallback(true)}
        />
      ) : (
        <span className="font-display font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">
          {logo.name ?? logo.alt}
        </span>
      )}
    </div>
  );
}

const ClientLogos = ({
  background,
  heading,
  logos,
  className = '',
}: ClientLogosProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isBlack = background === 'black';
  const bgClass = isBlack ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black';

  useEffect(() => {
    const section = sectionRef.current;
    const items = gridRef.current?.querySelectorAll('.logo-item');
    if (!section || !items?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 32, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [logos.length]);

  return (
    <section
      ref={sectionRef}
      className={`${bgClass} py-24 lg:py-40 ${className} relative overflow-hidden`}
      aria-labelledby="clients-heading"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center relative z-10">
        <h2
          id="clients-heading"
          className="font-display font-black text-4xl md:text-6xl lg:text-7xl mb-24 uppercase tracking-tighter"
        >
          Our <span className="text-primary italic">Clients</span>
        </h2>

        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-12 lg:gap-20 items-center justify-items-center"
        >
          {logos.map((logo, index) => (
            <ClientLogoItem key={index} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
