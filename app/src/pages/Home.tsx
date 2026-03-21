import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Star,
  Award,
  Users,
  ChevronRight,
  Play
} from 'lucide-react';
import HeroSection from '../sections/HeroSection';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;
/** Banner logo — theater masks (client asset) */
const TOPAZ_BANNER_LOGO = `${BASE}images/logos/topaz-logo-masks.png`;
const TOPAZ_BANNER_LOGO_FALLBACK = `${BASE}images/logos/topaz-logo.png`;

// Testimonials data
const testimonials = [
  {
    id: 1,
    quote: "Our dancers attended TOPAZ and had such a FABULOUS time! The faculty were so helpful with everything. Our dancers loved all of the classes so much. It was extremely personal. Teachers tried to learn names and gave personal corrections which is really awesome in a competition setting. The whole event was so professional!",
    author: "Studio Owner",
    studio: "Premier Dance Academy"
  },
  {
    id: 2,
    quote: "My students and parents are still RAVING about TOPAZ! My students had a blast! TOPAZ is truly something special. So organized and their staff is STELLAR! The kids are BEGGING to do all the combos in class. As an educator, I am so pleased with the classes my students received, as well as the entire competition experience.",
    author: "Studio Owner",
    studio: "Elite Dance Center"
  },
  {
    id: 3,
    quote: "Wow! We loved our first TOPAZ weekend! So many of our seasoned advanced dancers said it was their favorite competition weekend to date. Your faculty created a very nurturing vibe, while maintaining challenging classes. Please know how much I appreciate that. I also appreciate that your numbers don't feel too big.",
    author: "Studio Owner",
    studio: "Summit Dance Project"
  }
];

// Promotional cards
const promoCards = [
  {
    id: 1,
    title: 'SUMMER INTENSIVE',
    subtitle: 'TRAINING CAMP',
    description: 'Join our elite summer program',
    bg: 'from-blue-600 to-blue-900',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'THE PANEL',
    subtitle: 'JUDGES & MENTORS',
    description: 'Meet our industry experts',
    bg: 'from-[#2E75B6] to-[#1F4E78]',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'MASTER CLASS',
    subtitle: 'EXCLUSIVE WORKSHOP',
    description: 'Learn from the best',
    bg: 'from-indigo-600 to-indigo-900',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=400&fit=crop'
  }
];

const comingSoonSections = [
  {
    id: 'master-classes',
    title: 'Master Classes',
    text: 'Exclusive training opportunities with industry professionals. Stay tuned for announcements.',
  },
  {
    id: 'sponsors',
    title: 'Our Sponsors',
    text: "We're proud to partner with leading brands in dance and performing arts. Sponsor information coming soon.",
  },
  {
    id: 'panel',
    title: 'Panel & Judges',
    text: 'Meet our distinguished panel of judges and industry experts. Details coming soon.',
  },
];

const Home = () => {
  const tourRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const splitBannerRef = useRef<HTMLElement>(null);
  const comingSoonRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Tour section animation
      const tourSection = tourRef.current?.querySelector('.tour-content');
      if (tourSection) {
        gsap.fromTo(
          tourSection,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: tourRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Featured section
      const featuredElements = featuredRef.current?.querySelectorAll('.featured-animate');
      if (featuredElements) {
        gsap.fromTo(
          featuredElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuredRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Promo cards
      const promoCards = promoRef.current?.querySelectorAll('.promo-card');
      if (promoCards) {
        gsap.fromTo(
          promoCards,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: promoRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // About section
      const aboutElements = aboutRef.current?.querySelectorAll('.about-animate');
      if (aboutElements) {
        gsap.fromTo(
          aboutElements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: aboutRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Testimonials
      const testimonialCards = testimonialsRef.current?.querySelectorAll('.testimonial-card');
      if (testimonialCards) {
        gsap.fromTo(
          testimonialCards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      const splitBannerEls = splitBannerRef.current?.querySelectorAll('.split-banner-animate');
      if (splitBannerEls && splitBannerEls.length > 0) {
        gsap.fromTo(
          splitBannerEls,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: splitBannerRef.current,
              start: 'top 82%',
            },
          }
        );
      }

      const comingSoonCards = comingSoonRef.current?.querySelectorAll('.coming-soon-card');
      if (comingSoonCards) {
        gsap.fromTo(
          comingSoonCards,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: comingSoonRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-[#2E75B6] selection:text-white">
      <HeroSection />

      {/* NOW LIVE / FEATURED SECTION */}
      <section ref={featuredRef} className="relative bg-white py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Image/Video */}
            <div className="featured-animate relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&h=900&fit=crop"
                alt="Featured performance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#2E75B6] text-white text-xs font-bold uppercase tracking-wider rounded mb-3">
                  Now Live
                </span>
                <h3 className="font-display font-black text-2xl md:text-3xl text-white">
                  THE REFLECTION TOUR
                </h3>
              </div>
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-[#2E75B6] ml-1" fill="currentColor" />
              </button>
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <div className="featured-animate">
                <span className="text-[#2E75B6] font-mono text-sm tracking-[0.2em] uppercase font-bold">
                  Featured Event
                </span>
                <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 mt-2 leading-[1.1]">
                  READY TO <span className="text-[#2E75B6]">REFLECT</span>?
                </h2>
              </div>
              <p className="featured-animate text-gray-600 text-lg leading-relaxed">
                Join us for an unforgettable dance experience. The Reflection Tour brings together 
                the best dancers from across the nation to compete, learn, and grow together.
              </p>
              <div className="featured-animate flex flex-wrap gap-4">
                <Link
                  to="/registration"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#2E75B6] text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-[#1F4E78] transition-all duration-200"
                >
                  REGISTER NOW
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-50 transition-all duration-200"
                >
                  LEARN MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL CARDS */}
      <section ref={promoRef} className="relative bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4">
            {promoCards.map((card) => (
              <div
                key={card.id}
                className="promo-card relative h-64 md:h-72 rounded-xl overflow-hidden group cursor-pointer shadow-lg"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase">
                      {card.subtitle}
                    </p>
                    <h3 className="font-display font-black text-2xl md:text-3xl text-white mt-1">
                      {card.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-sm">{card.description}</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / LEGACY SECTION */}
      <section ref={aboutRef} className="relative bg-white py-20 lg:py-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="about-animate font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 tracking-tight">
              TOPAZ <span className="text-[#2E75B6]">LEGACY</span>
            </h2>
            <div className="about-animate w-24 h-1 bg-[#2E75B6] mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="about-animate bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#2E75B6]/30 transition-colors duration-300">
              <Star className="w-10 h-10 text-[#2E75B6] mb-4" />
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">OVER 50 YEARS</h3>
              <p className="text-gray-600 leading-relaxed">
                Since 1972, TOPAZ has been the premier dance competition, 
                nurturing talent and creating unforgettable moments for dancers nationwide.
              </p>
            </div>

            <div className="about-animate bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#2E75B6]/30 transition-colors duration-300">
              <Award className="w-10 h-10 text-[#2E75B6] mb-4" />
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">PRESTIGIOUS AWARDS</h3>
              <p className="text-gray-600 leading-relaxed">
                Our unique cumulative scoring system lets dancers earn bronze, 
                silver, and gold medals as they progress through the competition season.
              </p>
            </div>

            <div className="about-animate bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#2E75B6]/30 transition-colors duration-300">
              <Users className="w-10 h-10 text-[#2E75B6] mb-4" />
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">INCLUSIVE COMMUNITY</h3>
              <p className="text-gray-600 leading-relaxed">
                Welcoming dancers of all ages, backgrounds, and skill levels 
                in a supportive and inspiring environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOUR SECTION - After TOPAZ Legacy */}
      <section ref={tourRef} className="relative min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop"
            alt="TOPAZ Competition"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="tour-content space-y-6">
            <span className="font-mono text-[#2E75B6] font-bold tracking-[0.3em] uppercase text-sm md:text-base">
              THE RETURN OF
            </span>

            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-[10rem] text-white leading-[0.85] tracking-tighter uppercase">
              TOPAZ 2.0
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#2E75B6]" />
                <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wide">
                  August 22, 2026
                </span>
              </div>
              <span className="hidden md:block text-white/40 text-4xl">|</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#2E75B6]" />
                <span className="font-display font-bold text-2xl md:text-4xl uppercase tracking-wide">
                  SEASIDE, OR
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/registration"
                className="inline-flex items-center gap-3 px-12 py-5 bg-[#2E75B6] text-white font-bold text-lg uppercase tracking-wider rounded-full hover:bg-[#1F4E78] transition-all duration-300 hover:scale-105"
              >
                REGISTER NOW
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            <p className="text-white/60 text-lg max-w-2xl mx-auto pt-4">
              Seaside Convention Center • 415 1st Ave, Seaside, OR 97138
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white/40 rotate-90" />
        </div>
      </section>

      {/* TESTIMONIALS - Brand blue (after Tour) */}
      <section
        ref={testimonialsRef}
        className="relative bg-gradient-to-br from-[#1F4E78] via-[#2E75B6] to-[#1F4E78] py-24 lg:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.12]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-white/80 text-sm tracking-[0.2em] uppercase font-bold">
              What Studios Say
            </span>
            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mt-4">
              TESTIMONIALS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="testimonial-card relative p-8 pt-10 pb-10 flex flex-col justify-between"
              >
                {/* Custom Bracket Borders */}
                <div className="absolute top-0 right-0 h-[4px] bg-white w-[calc(100%-3.5rem)]" />
                <div className="absolute top-0 right-0 w-[4px] bg-white h-[calc(100%-3.5rem)]" />
                <div className="absolute bottom-0 left-0 h-[4px] bg-white w-[calc(100%-3.5rem)]" />
                <div className="absolute bottom-0 left-0 w-[4px] bg-white h-[calc(100%-3.5rem)]" />

                {/* Typography Quotes */}
                <div className="absolute top-[-3.5rem] left-[-0.5rem] text-white text-[7rem] font-serif font-black leading-none select-none">
                  “
                </div>
                <div className="absolute bottom-[-5rem] right-[-0.5rem] text-white text-[7rem] font-serif font-black leading-none select-none">
                  ”
                </div>

                <div className="relative z-10 flex-grow flex flex-col justify-between">
                  <p className="text-white leading-relaxed text-sm md:text-base text-center md:text-justify mb-8 font-medium">
                    {testimonial.quote}
                  </p>
                  <div className="text-right">
                    <p className="font-bold text-sky-200 text-lg">— {testimonial.author}</p>
                    <p className="text-white/90 text-sm font-medium">{testimonial.studio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Single promo banner — blends Revel-style split (logo frame + meta below) + bold story column + ghost CTA */}
      <section
        ref={splitBannerRef}
        className="relative overflow-hidden border-y border-white/10"
        aria-labelledby="split-banner-heading"
      >
        {/* TOPAZ site colors only — no photo overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1F4E78] via-[#2E75B6] to-[#1F4E78]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Left: white frame = logo only; city + dates sit BELOW frame (Revel layout) */}
            <div className="split-banner-animate flex flex-col gap-4 sm:gap-5">
              <div className="flex min-h-[320px] items-center justify-center border-4 border-white bg-black/10 px-6 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:min-h-[380px] sm:px-10 sm:py-14 lg:min-h-[440px] lg:px-12 lg:py-16">
                <img
                  src={TOPAZ_BANNER_LOGO}
                  alt="TOPAZ logo"
                  className="h-auto w-full max-w-[min(100%,420px)] object-contain sm:max-w-[min(100%,480px)] lg:max-w-[min(100%,560px)] xl:max-w-[min(100%,640px)]"
                  data-fallback-tried=""
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.dataset.fallbackTried) {
                      el.dataset.fallbackTried = '1';
                      el.src = TOPAZ_BANNER_LOGO_FALLBACK;
                    }
                  }}
                />
              </div>
              <div className="flex justify-between gap-4 px-1 font-serif text-[0.8125rem] font-medium tracking-[0.12em] text-white sm:text-base md:text-lg">
                <span className="uppercase">Seaside, OR</span>
                <span className="uppercase">Aug 22, 2026</span>
              </div>
            </div>

            {/* Right: bold condensed copy (Revel paragraph) + trust line (second ref tone) + ghost button */}
            <div className="split-banner-animate flex flex-col justify-center space-y-6 text-white lg:space-y-8">
              <h2
                id="split-banner-heading"
                className="font-display text-[1.35rem] font-black uppercase leading-[1.12] tracking-[0.02em] sm:text-2xl md:text-3xl lg:text-[1.65rem] xl:text-4xl xl:leading-[1.15]"
              >
                From the legacy you know and love comes{' '}
                <span className="text-white">The Return of TOPAZ 2.0</span> — a theatrical arts
                competition featuring respected adjudication, studio community, awards recognition,
                and one powerful weekend on the Oregon coast.
              </h2>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-white/88 sm:text-base">
                Professionally run scheduling, clear registration, and a welcoming environment for
                dancers and educators — the same standards TOPAZ has stood for since 1972.
                Seaside Convention Center. Registration closes July 22, 2026.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-10 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-white hover:text-[#1F4E78] sm:text-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMING SOON — Master Classes, Sponsors, Panel */}
      <section
        ref={comingSoonRef}
        className="relative bg-gray-50 py-20 lg:py-28 border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#2E75B6] font-mono text-sm tracking-[0.2em] uppercase font-bold">
              More to come
            </span>
            <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-gray-900 tracking-tight mt-3">
              WHAT&apos;S <span className="text-[#2E75B6] italic">NEXT</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {comingSoonSections.map((block) => (
              <div
                key={block.id}
                className="coming-soon-card flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:border-[#2E75B6]/35 hover:shadow-md transition-all duration-300 text-center"
              >
                <span className="inline-flex self-center items-center rounded-full border border-[#2E75B6]/30 bg-[#2E75B6]/5 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2E75B6] mb-5">
                  Coming Soon
                </span>
                <h3 className="font-display font-black text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-tight">
                  {block.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed flex-1">
                  {block.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative bg-gradient-to-br from-[#1F4E78] to-[#2E75B6] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop')] opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F4E78] via-transparent to-[#1F4E78]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            READY TO TAKE THE <span className="text-white/90 italic">STAGE</span>?
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of dancers who have made TOPAZ their home. 
            Register today and start your journey to excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/registration"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#2E75B6] font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/90 transition-all duration-200"
            >
              REGISTER NOW
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-10 py-5 border border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/10 transition-all duration-200"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
