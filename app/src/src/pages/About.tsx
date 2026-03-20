import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextSection from '../components/TextSection';
import TeamSection from '../components/TeamSection';
import ClientLogos from '../components/ClientLogos';

gsap.registerPlugin(ScrollTrigger);

/* Images from assets/about – replace files in public/about to update */
const ABOUT_IMAGES = {
  aboutUs: `${import.meta.env.BASE_URL}about/about-us.jpg`,
  ourStory: `${import.meta.env.BASE_URL}about/our-story.jpg`,
  meetTheTeam: `${import.meta.env.BASE_URL}about/meet-the-team.jpg`,
} as const;

/* Client logos: use filenames client-logo-01.png through client-logo-05.png in about/ */
const CLIENT_LOGO_IMAGES = {
  logo1: `${import.meta.env.BASE_URL}about/client-logo-01.png`,
  logo2: `${import.meta.env.BASE_URL}about/client-logo-02.png`,
  logo3: `${import.meta.env.BASE_URL}about/client-logo-03.png`,
  logo4: `${import.meta.env.BASE_URL}about/client-logo-04.png`,
  logo5: `${import.meta.env.BASE_URL}about/client-logo-05.png`,
} as const;

const TEAM_MEMBERS = [
  { role: 'Vice President', name: 'TBD' },
  { role: 'Founder', name: 'TBD' },
  { role: 'President', name: 'TBD' },
];

/* Add src when you add client-logo-01.png … client-logo-05.png to public/about/ */
const CLIENT_LOGOS = [
  { src: CLIENT_LOGO_IMAGES.logo1, alt: 'Client 1', name: 'Client 1' },
  { src: CLIENT_LOGO_IMAGES.logo2, alt: 'Client 2', name: 'Client 2' },
  { src: CLIENT_LOGO_IMAGES.logo3, alt: 'Client 3', name: 'Client 3' },
  { src: CLIENT_LOGO_IMAGES.logo4, alt: 'Client 4', name: 'Client 4' },
  { src: CLIENT_LOGO_IMAGES.logo5, alt: 'Client 5', name: 'Client 5' },
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
        className="relative bg-[#0a0a0a] py-32 lg:py-48 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 max-w-4xl mx-auto text-center pt-20">
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
        imageSrc={ABOUT_IMAGES.aboutUs}
        imageAlt="TOPAZ dance competition heritage"
        content="Topaz has proudly been at the forefront of theatrical arts competitions since 1972. Throughout the years we have extended our family to countless studios and thousands of contestants who have become our extended family. Many of the impactful leaders we now feature—choreographers and celebrities in theater—performed at our competitions in the early days. Just as in the core for the line and the journey that led us full circle."
      />

      {/* Section 3: Our Story (White) - image left, text right. Use bob-pat-heath.jpg when available. */}
      <TextSection
        background="white"
        heading="Our Story"
        alignment="right"
        imageSrc={ABOUT_IMAGES.ourStory}
        imageAlt="Pat and Bob Heath, founders"
        content="Pat and Bob Heath were visionaries in the world of theatrical arts, pioneering a competition framework that not only redefined excellence. Their innovative approach not only captured the imagination of many but also provided a platform where talent could shine, establishing their model. With that their work excellence continue to resonate, proving that great ideas can transcend time and influence generations."
      />

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
        heading="Our Clients"
        logos={CLIENT_LOGOS}
      />
    </div>
  );
};

export default About;
