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
  logos: ClientLogo[];
  className?: string;
}

function ClientLogoItem({ logo, isBlack }: { logo: ClientLogo; isBlack: boolean }) {
  const [useFallback, setUseFallback] = useState(!logo.src);

  return (
    <div className={`logo-item group relative flex items-center justify-center p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-105 min-h-[140px] w-full ${
      isBlack 
        ? 'bg-white/5 border-white/10 hover:border-white/30' 
        : 'bg-white border-gray-200 hover:border-[#2E75B6]/50'
    }`}>
      {logo.src && !useFallback ? (
        <img
          src={logo.src}
          alt={logo.alt}
          loading="lazy"
          className={`max-h-20 w-auto object-contain transition-all duration-300 ${
            isBlack ? 'grayscale group-hover:grayscale-0' : 'grayscale group-hover:grayscale-0'
          }`}
          onError={() => setUseFallback(true)}
        />
      ) : (
        <span className={`font-display font-bold text-2xl transition-colors ${
          isBlack 
            ? 'text-white/60 group-hover:text-white' 
            : 'text-gray-400 group-hover:text-[#2E75B6]'
        }`}>
          {logo.name ?? logo.alt}
        </span>
      )}
    </div>
  );
}

const ClientLogos = ({
  background,
  logos,
  className = '',
}: ClientLogosProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isBlack = background === 'black';
  const bgClass = isBlack ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900';

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
      className={`${bgClass} py-24 lg:py-32 ${className} relative overflow-hidden`}
      aria-labelledby="clients-heading"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center relative z-10">
        <span className={`font-mono text-sm tracking-[0.2em] uppercase font-bold ${
          isBlack ? 'text-white/60' : 'text-[#2E75B6]'
        }`}>
          Trusted Partners
        </span>
        <h2
          id="clients-heading"
          className={`font-display font-black text-4xl md:text-5xl lg:text-6xl mt-4 mb-5 uppercase tracking-tighter ${
            isBlack ? 'text-white' : 'text-gray-900'
          }`}
        >
          Our <span className="text-primary italic">Clients</span>
        </h2>
        <p className={`mx-auto mb-10 max-w-2xl text-sm sm:text-base ${isBlack ? 'text-white/65' : 'text-gray-500'}`}>
          Client and partner features are coming soon. We will add the right information as soon as it is finalized.
        </p>
        <div className={`w-24 h-1 mx-auto mb-16 ${isBlack ? 'bg-white/30' : 'bg-[#2E75B6]'}`} />

        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 lg:gap-12 items-center justify-items-center"
        >
          {logos.map((logo, index) => (
            <ClientLogoItem key={index} logo={logo} isBlack={isBlack} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
