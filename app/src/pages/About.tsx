import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextSection from '../components/TextSection';
import TeamSection from '../components/TeamSection';
import ClientLogos from '../components/ClientLogos';

gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;

/* About Us: Pat & Bob vintage (pat-and-bob.jpg from gallery PNG); Our Story: our-story.jpg + same fallback */
const ABOUT_IMAGES = {
  founders: `${BASE}images/about/pat-and-bob.jpg`,
  aboutUsFallback: `${BASE}about/about-us.jpg`,
  ourStory: `${BASE}about/our-story.jpg`,
  ourStoryFallback: `${BASE}images/about/pat-and-bob.jpg`,
  meetTheTeam: `${BASE}about/meet-the-team.jpg`,
} as const;

const ABOUT_US_CONTENT =
  "Topaz has proudly been at the forefront of theatrical arts competitions since 1972. Throughout the years and across numerous cities, we've built a vibrant community of countless studios and thousands of contestants who form our extended Topaz family. Many of the dedicated teachers who now inspire students were once competitors in our events, showcasing the lasting impact of our competitions. Join us in the love for the arts and the journey of growth that it fosters!";

const OUR_STORY_CONTENT =
  "Pat and Bob Heath were visionaries in the world of theatrical arts, pioneering a competition framework that set a standard for excellence. Their innovative approach not only captured the imagination of audiences but also inspired countless others to adopt and adapt their model. With dedication and passion, their work continues to resonate, proving that great ideas can transcend time and influence generations.\n\nTopaz alumni have had the incredible opportunity to perform alongside legends like Cher, Michael Jackson, Madonna, and The Pointer Sisters, captivating audiences around the globe.\n\nToday, Randy and Ric, the youngest sons, play vital roles in shaping the future of Topaz. While Randy is dedicated to guiding the organization forward, Ric and his wife run a thriving gymnastics school with students competing on the international stage.\n\nThough we mourn the loss of Bob in 2023, Pat remains passionate about Topaz and is currently enjoying her time in Las Vegas.";

/* Client logos: use filenames client-logo-01.png through client-logo-05.png in about/ */
const CLIENT_LOGO_IMAGES = {
  logo1: `${import.meta.env.BASE_URL}about/client-logo-01.png`,
  logo2: `${import.meta.env.BASE_URL}about/client-logo-02.png`,
  logo3: `${import.meta.env.BASE_URL}about/client-logo-03.png`,
  logo4: `${import.meta.env.BASE_URL}about/client-logo-04.png`,
  logo5: `${import.meta.env.BASE_URL}about/client-logo-05.png`,
} as const;

const TEAM_MEMBERS = [
  { role: 'President' },
  { role: 'Vice President' },
  { role: 'Founder' },
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
        imageSrc={ABOUT_IMAGES.founders}
        imageFallbackSrc={ABOUT_IMAGES.aboutUsFallback}
        imageAlt="Pat and Bob Heath — TOPAZ founders"
        content={ABOUT_US_CONTENT}
      />

      <TextSection
        background="white"
        heading="Our Story"
        alignment="right"
        imageSrc={ABOUT_IMAGES.ourStory}
        imageFallbackSrc={ABOUT_IMAGES.ourStoryFallback}
        imageAlt="TOPAZ — our story"
        content={OUR_STORY_CONTENT}
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
        logos={CLIENT_LOGOS}
      />
    </div>
  );
};

export default About;
