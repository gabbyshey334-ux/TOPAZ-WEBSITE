import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TeamMember {
  role: string;
  name?: string;
}

export interface TeamSectionProps {
  background: 'black' | 'white';
  heading: string;
  teamImageSrc: string;
  teamImageAlt?: string;
  members: TeamMember[];
  className?: string;
}

const TeamSection = ({
  background,
  heading: _heading,
  teamImageSrc,
  teamImageAlt = 'TOPAZ team',
  members,
  className = '',
}: TeamSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const rolesRef = useRef<HTMLDivElement>(null);

  const isBlack = background === 'black';
  const bgClass = isBlack ? 'bg-[#0a0a0a] text-white' : 'bg-[#fcfcfc] text-black border-y border-gray-100';

  useEffect(() => {
    const section = sectionRef.current;
    const imageEl = imageRef.current;
    const rolesEl = rolesRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const animatables = [imageEl, rolesEl].filter(Boolean) as HTMLElement[];
      gsap.fromTo(
        animatables,
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${bgClass} py-24 lg:py-40 ${className} relative overflow-hidden`}
      aria-labelledby="team-heading"
    >
      {isBlack && (
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] pointer-events-none" />
      )}
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto text-center relative z-10">
        <h2
          id="team-heading"
          className="font-display font-black text-4xl md:text-6xl lg:text-7xl mb-24 uppercase tracking-tighter"
        >
          Meet The <span className="text-primary italic underline decoration-4 underline-offset-8">Team</span>
        </h2>

        {/* PLACEHOLDER - Replace with real team photo */}
        <div
          ref={imageRef}
          className="relative overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl mb-24 max-w-5xl mx-auto group"
        >
          <img
            src={teamImageSrc}
            alt={teamImageAlt}
            loading="lazy"
            className="w-full aspect-[16/9] object-cover object-center transition-transform duration-[2s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        <div
          ref={rolesRef}
          className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-16 max-w-4xl mx-auto"
          role="list"
          aria-label="Team roles, left to right: President, Vice President, Founder"
        >
          {members.map((member, index) => (
            <div key={index} className="group text-center" role="listitem">
              <div className="mb-2 sm:mb-4">
                <p className="font-display font-black text-base sm:text-xl lg:text-2xl uppercase tracking-tight text-white group-hover:text-primary transition-colors duration-500 leading-tight">
                  {member.role}
                </p>
                <div className="mx-auto mt-2 h-1 max-w-[4rem] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center sm:origin-center" />
              </div>
              {member.name ? (
                <p className="text-xs sm:text-lg font-mono text-white/40 uppercase tracking-widest mt-2">
                  {member.name}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
