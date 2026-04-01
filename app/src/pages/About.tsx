import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextSection from '../components/TextSection';
import TeamSection from '../components/TeamSection';
import ClientLogos from '../components/ClientLogos';

gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;

/* pat-and-bob.png beside About Us; founders trio in heritage band before Meet The Team. */
const ABOUT_IMAGES = {
  patAndBob: `${BASE}about/pat-and-bob.png`,
  founders: `${BASE}images/gallery/history/stage-colorful-trio-vegas.jpg`,
  aboutUsFallback: `${BASE}about/about-us.jpg`,
  ricPortrait: `${BASE}about/ric-heath.png`,
  meetTheTeam: `${BASE}about/meet-the-team.jpg`,
} as const;

const ABOUT_US_CONTENT =
  "Topaz has proudly been at the forefront of theatrical arts competitions since 1972. Throughout the years and across numerous cities, we've built a vibrant community of countless studios and thousands of contestants who form our extended Topaz family. Many of the dedicated teachers who now inspire students were once competitors in our events, showcasing the lasting impact of our competitions. Join us in the love for the arts and the journey of growth that it fosters!";

const OUR_STORY_PART_A =
  "Pat and Bob Heath were visionaries in the world of theatrical arts, pioneering a competition framework that set a standard for excellence. Their innovative approach not only captured the imagination of audiences but also inspired countless others to adopt and adapt their model. With dedication and passion, their work continues to resonate, proving that great ideas can transcend time and influence generations.\n\nTopaz alumni have had the incredible opportunity to perform alongside legends like Cher, Michael Jackson, Madonna, and The Pointer Sisters, captivating audiences around the globe.";

const OUR_STORY_PART_B =
  "Today, Randy and Ric, the youngest sons, play vital roles in shaping the future of Topaz. While Randy is dedicated to guiding the organization forward, Ric and his wife run a thriving gymnastics school with students competing on the international stage.\n\nThough we mourn the loss of Bob in 2023, Pat remains passionate about Topaz and is currently enjoying her time in Las Vegas.";

/* Client logos are placeholders until partner list is finalized. */

const TEAM_MEMBERS = [
  { role: 'President' },
  { role: 'Vice President' },
  { role: 'Founder' },
];

/* Placeholder cards until client list is ready. */
const CLIENT_LOGOS = [
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
];

const About = () => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const els = section.querySelectorAll('.hero-animate');
      gsap.fromTo(
        els,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power2.out',
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white">
      {/* Section 1: Hero Banner */}
      <section
        ref={heroRef}
        className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center"
      >
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <p className="hero-animate font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            ESTABLISHED 1972
          </p>
          <h1
            id="about-hero-heading"
            className="hero-animate font-display font-black text-5xl sm:text-6xl lg:text-[8rem] text-white leading-[0.85] tracking-tighter uppercase mb-8"
          >
            About <span className="text-primary italic">Us</span>
          </h1>
          <div className="hero-animate w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>
      </section>

      {/* Section 2: About Us (Black) - text left, image right */}
      <TextSection
        background="black"
        heading="About Us"
        alignment="left"
        imageSrc={ABOUT_IMAGES.patAndBob}
        imageFallbackSrc={ABOUT_IMAGES.aboutUsFallback}
        imageAlt="Pat and Bob Heath dancing"
        imageObjectFit="contain"
        stackImageFirst
        content={ABOUT_US_CONTENT}
      />

      {/* Our Story (warm stage photo removed). Ric portrait sits before the Randy & Ric paragraph. */}
      <section
        className="bg-[#fcfcfc] text-black border-y border-gray-100 py-24 lg:py-40"
        aria-labelledby="our-story-heading"
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <h2
            id="our-story-heading"
            className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-10 leading-tight uppercase tracking-tighter max-w-[800px]"
          >
            Our <span className="text-primary italic">Story</span>
          </h2>
          <p className="text-xl leading-relaxed text-gray-500 font-medium whitespace-pre-line max-w-[800px]">
            {OUR_STORY_PART_A}
          </p>

          <figure className="my-14 sm:my-16 max-w-lg mx-auto lg:mx-0 lg:max-w-xl">
            <div className="overflow-hidden rounded-[2.5rem] border border-gray-200 bg-gray-100 shadow-premium p-4 sm:p-6 flex items-center justify-center">
              <img
                src={ABOUT_IMAGES.ricPortrait}
                alt="Ric Heath"
                loading="lazy"
                className="w-full h-auto max-h-[min(75vh,720px)] object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center lg:text-left font-display font-semibold text-lg text-gray-800 tracking-wide">
              Ric Heath
            </figcaption>
          </figure>

          <p className="text-xl leading-relaxed text-gray-500 font-medium whitespace-pre-line max-w-[800px]">
            {OUR_STORY_PART_B}
          </p>
        </div>
      </section>

      {/* Former About Us side image — heritage / founders era (still in project, new placement) */}
      <section
        className="bg-gray-50 py-16 lg:py-24 border-t border-gray-100"
        aria-label="TOPAZ performers on stage, early years"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-gray-200 bg-white shadow-md">
            <img
              src={ABOUT_IMAGES.founders}
              alt="TOPAZ performers on stage during the competition era"
              loading="lazy"
              className="w-full h-auto object-contain max-h-[min(90vh,900px)] mx-auto block"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Meet The Team (Black) */}
      <TeamSection
        background="black"
        heading="Meet The Team"
        teamImageSrc={ABOUT_IMAGES.meetTheTeam}
        teamImageAlt="TOPAZ team with banner"
        members={TEAM_MEMBERS}
      />

      {/* Section 5: Our Clients (White) */}
      <ClientLogos
        background="white"
        logos={CLIENT_LOGOS}
      />
    </div>
  );
};

export default About;
