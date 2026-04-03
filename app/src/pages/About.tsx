import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Star, Award, Heart, Sparkles, Quote } from 'lucide-react';
import TextSection from '../components/TextSection';
import TeamSection from '../components/TeamSection';
import ClientLogos from '../components/ClientLogos';

gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;

const ABOUT_IMAGES = {
  /** Vintage B&W duo — beside About Us and in story/heritage sections. */
  vintageDuo: `${BASE}images/gallery/history/topaz-performers-vintage-duo.png`,
  aboutUsFallback: `${BASE}about/about-us.jpg`,
  ricPortrait: `${BASE}about/ric-heath.png`,
  meetTheTeam: `${BASE}about/meet-the-team.jpg`,
} as const;

const ABOUT_US_CONTENT =
  "Topaz has proudly been at the forefront of theatrical arts competitions since 1972. Throughout the years and across numerous cities, we've built a vibrant community of countless studios and thousands of contestants who form our extended Topaz family. Many of the dedicated teachers who now inspire students were once competitors in our events, showcasing the lasting impact of our competitions. Join us in the love for the arts and the journey of growth that it fosters!";

const OUR_STORY_PART_A =
  "Pat and Bob Heath were visionaries in the world of theatrical arts, pioneering a competition framework that set a standard for excellence. Their innovative approach not only captured the imagination of audiences but also inspired countless others to adopt and adapt their model. With dedication and passion, their work continues to resonate, proving that great ideas can transcend time and influence generations.";

const LEGACY_QUOTE = "Topaz alumni have had the incredible opportunity to perform alongside legends like Cher, Michael Jackson, Madonna, and The Pointer Sisters, captivating audiences around the globe.";

const TRIBUTE_TEXT = "Though we mourn the loss of Bob in 2023, Pat remains passionate about Topaz and is currently enjoying her time in Las Vegas.";

const TEAM_MEMBERS = [
  { role: 'President' },
  { role: 'Founder' },
  { role: 'Vice President' },
];

const CLIENT_LOGOS = [
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
  { alt: 'Clients coming soon', name: 'Coming Soon' },
];

const MILESTONES = [
  { year: '1972', title: 'Founded', description: 'Pat & Bob Heath establish TOPAZ' },
  { year: '1980s', title: 'Expansion', description: 'Competitions across multiple states' },
  { year: '1990s', title: 'Alumni Success', description: 'Dancers performing with global stars' },
  { year: '2023', title: 'Evolution', description: 'TOPAZ 2.0 relaunch begins' },
  { year: '2026', title: 'The Return', description: 'New era of excellence' },
];

const About = () => {
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const els = section.querySelectorAll('.hero-animate');
      gsap.fromTo(
        els,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Story section animations
      const storyElements = storyRef.current?.querySelectorAll('.story-animate');
      if (storyElements) {
        gsap.fromTo(
          storyElements,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Timeline animation
      const timelineItems = timelineRef.current?.querySelectorAll('.timeline-item');
      if (timelineItems) {
        gsap.fromTo(
          timelineItems,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Quote animation
      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: quoteRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white">
      {/* PREMIUM HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden flex items-center"
      >
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/70 to-[#0a0a0a]/90" />
        </div>

        {/* Animated accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E75B6]/20 via-transparent to-[#2E75B6]/20" />

        <div className="relative z-10 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Star className="w-4 h-4 text-[#2E75B6]" />
            <span className="font-mono text-white/80 font-bold tracking-[0.3em] uppercase text-sm">
              Established 1972
            </span>
          </div>
          
          <h1
            id="about-hero-heading"
            className="hero-animate font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-[9rem] text-white leading-[0.85] tracking-tighter uppercase mb-8"
          >
            About <span className="text-[#2E75B6] italic">Us</span>
          </h1>
          
          <div className="hero-animate w-32 h-1 bg-gradient-to-r from-transparent via-[#2E75B6] to-transparent mx-auto rounded-full mb-8" />
          
          <p className="hero-animate text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Over five decades of nurturing talent, building community, and creating 
            unforgettable moments in theatrical arts.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION — Premium Layout */}
      <TextSection
        background="black"
        heading="About Us"
        alignment="left"
        imageSrc={ABOUT_IMAGES.vintageDuo}
        imageFallbackSrc={ABOUT_IMAGES.aboutUsFallback}
        imageAlt="Vintage TOPAZ performers — duo portrait"
        imageObjectFit="contain"
        stackImageFirst
        content={ABOUT_US_CONTENT}
      />

      {/* TIMELINE SECTION — Premium Milestones */}
      <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
        {/* Decorative line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2E75B6]/30 to-transparent hidden lg:block" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E75B6]/10 text-[#2E75B6] text-sm font-bold uppercase tracking-wider mb-4">
              <Calendar className="w-4 h-4" />
              Our Journey
            </span>
            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 tracking-tight">
              Milestones of <span className="text-[#2E75B6] italic">Excellence</span>
            </h2>
          </div>

          <div ref={timelineRef} className="relative space-y-8 lg:space-y-0">
            {MILESTONES.map((milestone, index) => (
              <div 
                key={milestone.year}
                className={`timeline-item relative lg:grid lg:grid-cols-2 lg:gap-16 ${
                  index % 2 === 0 ? '' : 'lg:direction-rtl'
                }`}
              >
                {/* Content */}
                <div className={`${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16 lg:col-start-2'}`}>
                  <div className={`bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${
                    index % 2 === 0 ? '' : 'lg:direction-ltr'
                  }`}>
                    <div className={`inline-flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center">
                        <span className="font-display font-black text-white text-sm">{milestone.year}</span>
                      </div>
                      <h3 className="font-display font-black text-xl text-gray-900">{milestone.title}</h3>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                {/* Center dot for desktop */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2E75B6] border-4 border-white shadow-lg z-10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY SECTION — Premium Narrative Design */}
      <section
        ref={storyRef}
        className="relative bg-gradient-to-b from-[#fcfcfc] to-white py-24 lg:py-32 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#2E75B6]/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2E75B6]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Story Content */}
            <div>
              <div className="story-animate">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E75B6]/10 text-[#2E75B6] text-sm font-bold uppercase tracking-wider mb-6">
                  <Sparkles className="w-4 h-4" />
                  The Founders
                </span>
                <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight uppercase tracking-tighter">
                  Our <span className="text-[#2E75B6] italic">Story</span>
                </h2>
              </div>

              <p className="story-animate text-xl leading-relaxed text-gray-600 font-medium mb-8">
                {OUR_STORY_PART_A}
              </p>

              {/* Legacy Quote Card */}
              <div 
                ref={quoteRef}
                className="story-animate relative bg-gradient-to-br from-[#2E75B6]/10 to-[#1F4E78]/10 rounded-[2rem] p-8 border border-[#2E75B6]/20 mb-8"
              >
                <Quote className="absolute top-6 left-6 w-8 h-8 text-[#2E75B6]/30" />
                <p className="relative pl-12 text-lg italic text-gray-700 leading-relaxed">
                  {LEGACY_QUOTE}
                </p>
              </div>
            </div>

            {/* Right: Ric Portrait Card */}
            <div className="story-animate lg:sticky lg:top-24">
              <figure className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2E75B6]/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#2E75B6]/10 rounded-full blur-3xl" />
                
                <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white shadow-2xl p-6 sm:p-8">
                  <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-gray-100 to-gray-50">
                    <img
                      src={ABOUT_IMAGES.ricPortrait}
                      alt="Ric Heath"
                      loading="lazy"
                      className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  
                  <figcaption className="mt-6 text-center">
                    <p className="font-display font-black text-2xl text-gray-900">Ric Heath</p>
                  </figcaption>
                </div>
              </figure>
            </div>
          </div>

          {/* Next Generation Section */}
          <div className="mt-20 lg:mt-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="story-animate order-2 lg:order-1">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                  <img
                    src={ABOUT_IMAGES.vintageDuo}
                    alt="Vintage TOPAZ performers — duo portrait"
                    loading="lazy"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              </div>

              <div className="story-animate order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-bold uppercase tracking-wider mb-6">
                  <Heart className="w-4 h-4" />
                  The Next Generation
                </span>
                <h3 className="font-display font-black text-3xl md:text-4xl text-gray-900 mb-6">
                  Continuing the <span className="text-[#2E75B6] italic">Dream</span>
                </h3>

                {/* Tribute card */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-l-4 border-[#2E75B6]">
                  <p className="text-gray-600 italic">{TRIBUTE_TEXT}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERITAGE GALLERY SECTION */}
      <section className="relative bg-gray-50 py-24 lg:py-32 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E75B6]/10 text-[#2E75B6] text-sm font-bold uppercase tracking-wider mb-4">
              <Award className="w-4 h-4" />
              Through The Years
            </span>
            <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-gray-900 tracking-tight">
              TOPAZ <span className="text-[#2E75B6] italic">Heritage</span>
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white shadow-2xl">
              <img
                src={ABOUT_IMAGES.vintageDuo}
                alt="Vintage TOPAZ performers — duo portrait"
                loading="lazy"
                className="w-full h-auto object-contain max-h-[min(80vh,800px)] mx-auto block"
              />
            </div>
            
            {/* Floating caption */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl px-6 py-3 border border-gray-100">
              <p className="font-display font-bold text-gray-900 whitespace-nowrap">Performers on Stage — Early Years</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <TeamSection
        background="black"
        heading="Meet The Team"
        teamImageSrc={ABOUT_IMAGES.meetTheTeam}
        teamImageAlt="TOPAZ team with banner"
        members={TEAM_MEMBERS}
      />

      {/* CLIENTS SECTION */}
      <ClientLogos
        background="white"
        logos={CLIENT_LOGOS}
      />

      {/* FINAL CTA */}
      <section className="relative bg-gradient-to-br from-[#0F2847] via-[#1F4E78] to-[#2E75B6] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2847]/90 via-transparent to-[#1F4E78]/80" aria-hidden />

        {/* Floating orbs */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-[60px]" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#2E75B6]/30 rounded-full blur-[80px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Be Part of the <span className="text-[#7EB8E8] italic">Legacy</span>
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of dancers who have made TOPAZ their home. 
            Experience the magic of theatrical arts competition.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/registration"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#2E75B6] font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Register Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
