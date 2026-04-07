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
  Sparkles,
  Trophy,
  Heart,
} from 'lucide-react';
import HeroSection from '../sections/HeroSection';
import type { LucideIcon } from 'lucide-react';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { format } from 'date-fns';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;
const TOPAZ_OFFICIAL_BANNER = `${BASE}images/homepage/topaz-2-0-banner.png`;

/** Exactly two legacy feature cards (deduped by id when rendering). */
const LEGACY_FEATURE_CARDS: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}[] = [
  {
    id: 'prestigious-awards',
    icon: Award,
    title: 'PRESTIGIOUS AWARDS',
    description:
      'Our unique cumulative scoring system lets dancers earn bronze, silver, and gold medals as they progress through the competition season.',
    gradient: 'from-[#2E75B6]/20 to-blue-600/20',
  },
  {
    id: 'inclusive-community',
    icon: Users,
    title: 'INCLUSIVE COMMUNITY',
    description:
      'Welcoming dancers of all ages, backgrounds, and skill levels in a supportive and inspiring environment.',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
];

const promoCards = [
  {
    id: 1,
    title: 'MASTER CLASSES',
    subtitle: 'COMING SOON',
    description: 'Learn from industry professionals',
    bg: 'from-violet-600/90 via-purple-700/90 to-indigo-900/90',
    accent: '#8B5CF6',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'SPONSORS',
    subtitle: 'COMING SOON',
    description: 'Partner with excellence',
    bg: 'from-[#2E75B6]/90 via-[#1F4E78]/90 to-[#0F2847]/90',
    accent: '#2E75B6',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop',
    icon: Trophy,
  },
  {
    id: 3,
    title: 'PANEL & JUDGES',
    subtitle: 'COMING SOON',
    description: 'Expert adjudication panel',
    bg: 'from-amber-600/90 via-orange-700/90 to-red-900/90',
    accent: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=600&fit=crop',
    icon: Heart,
  },
] as const;

const legacyHistoryPhotos = [
  {
    src: `${BASE}images/homepage/boy-tuxedo-trophy.png`,
    alt: 'Vintage TOPAZ competition — young dancer in tuxedo with trophy',
    aspect: 'tall'
  },
  {
    src: `${BASE}images/homepage/duo-trophy.png`,
    alt: 'Vintage TOPAZ competition — duo with trophy',
    aspect: 'square'
  },
  {
    src: `${BASE}images/homepage/group-dancers-trophy.png`,
    alt: 'Vintage TOPAZ competition — group of dancers with trophy',
    aspect: 'square'
  },
  {
    src: `${BASE}images/homepage/newspaper-1975.png`,
    alt: '1975 newspaper clipping featuring TOPAZ',
    aspect: 'tall'
  },
] as const;

function formatEventDateLabel(dateStr: string | undefined | null, fallback: string): string {
  if (!dateStr) return fallback;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T12:00:00` : dateStr;
  try {
    return format(new Date(d), 'MMMM d, yyyy');
  } catch {
    return fallback;
  }
}

const Home = () => {
  const { event } = useActiveEvent();
  const eventTitle = event?.name?.trim() || '';
  const eventDateLabel = formatEventDateLabel(event?.date, 'August 22, 2026');
  const eventLocationLabel = event?.location?.trim() || 'Seaside, OR';
  const eventDetailLine =
    event?.description?.trim() || 'Seaside Convention Center • 415 1st Ave, Seaside, OR 97138';

  const tourRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const heritageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heritage photos - masonry stagger
      const heritagePhotos = heritageRef.current?.querySelectorAll('.heritage-photo');
      if (heritagePhotos) {
        gsap.fromTo(
          heritagePhotos,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heritageRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      const promoCardsEls = promoRef.current?.querySelectorAll('.promo-card');
      if (promoCardsEls && promoCardsEls.length > 0) {
        gsap.fromTo(
          promoCardsEls,
          { y: 60, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: promoRef.current,
              start: 'top 80%',
            },
          }
        );
      }

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

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-[#2E75B6] selection:text-white">
      <HeroSection />

      {/* Heritage Photos - Masonry Layout */}
      <section
        ref={heritageRef}
        className="relative py-12 sm:py-16 bg-white"
        aria-label="TOPAZ heritage photographs"
      >
        <div className="mx-auto max-w-md px-6 sm:max-w-lg sm:px-8 md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
          {/* Masonry Grid — object-contain + taller cells on desktop so heads are never cropped */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
            {/* Left Column */}
            <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4">
              {/* Photo 1 - Tall */}
              <div className="heritage-photo flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-md transition-shadow duration-300 hover:shadow-lg sm:min-h-[300px] sm:rounded-2xl md:min-h-[340px] lg:min-h-[380px] xl:min-h-[420px]">
                <img
                  src={legacyHistoryPhotos[0].src}
                  alt={legacyHistoryPhotos[0].alt}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-full object-contain object-top"
                />
              </div>
              {/* Photo 3 - Squareish */}
              <div className="heritage-photo flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-md transition-shadow duration-300 hover:shadow-lg sm:min-h-[260px] sm:rounded-2xl md:min-h-[300px] lg:min-h-[340px] xl:min-h-[380px]">
                <img
                  src={legacyHistoryPhotos[2].src}
                  alt={legacyHistoryPhotos[2].alt}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-full object-contain object-top"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2.5 pt-6 sm:gap-3 sm:pt-8 md:gap-4 md:pt-10 lg:pt-12">
              {/* Photo 2 - Squareish */}
              <div className="heritage-photo flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-md transition-shadow duration-300 hover:shadow-lg sm:min-h-[260px] sm:rounded-2xl md:min-h-[300px] lg:min-h-[340px] xl:min-h-[380px]">
                <img
                  src={legacyHistoryPhotos[1].src}
                  alt={legacyHistoryPhotos[1].alt}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-full object-contain object-top"
                />
              </div>
              {/* Photo 4 - Tall */}
              <div className="heritage-photo flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-md transition-shadow duration-300 hover:shadow-lg sm:min-h-[300px] sm:rounded-2xl md:min-h-[340px] lg:min-h-[380px] xl:min-h-[420px]">
                <img
                  src={legacyHistoryPhotos[3].src}
                  alt={legacyHistoryPhotos[3].alt}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-full object-contain object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Coming — Coming Soon feature cards */}
      <section
        ref={promoRef}
        className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-[#2E75B6]/20 blur-[100px]" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#2E75B6]">
              What&apos;s Coming
            </span>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Exciting <span className="italic">Features</span> Ahead
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {promoCards.map((card) => (
              <div
                key={card.id}
                className="promo-card group relative h-[400px] cursor-pointer overflow-hidden rounded-[2rem] md:h-[450px]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} transition-opacity duration-500`} />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${card.accent}30` }}
                    >
                      <card.icon
                        className="h-6 w-6"
                        style={{ color: card.accent === '#2E75B6' ? 'white' : card.accent }}
                      />
                    </div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                      {card.subtitle}
                    </p>
                    <h3 className="mb-2 font-display text-2xl font-black text-white">{card.title}</h3>
                    <p className="text-sm text-white/70">{card.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official TOPAZ 2.0 banner */}
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <img
            src={TOPAZ_OFFICIAL_BANNER}
            alt="TOPAZ 2.0 Dance and Performing Arts Competition banner"
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* TOPAZ LEGACY SECTION - Premium Cards */}
      <section ref={aboutRef} className="relative bg-white py-24 lg:py-32 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#2E75B6]/20 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#2E75B6]/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E75B6]/10 text-[#2E75B6] text-sm font-bold uppercase tracking-wider mb-4">
              <Star className="w-4 h-4" />
              Why Choose TOPAZ
            </span>
            <h2 className="about-animate font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 tracking-tight">
              TOPAZ <span className="text-[#2E75B6] italic">Legacy</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Over five decades of nurturing talent and creating unforgettable moments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {LEGACY_FEATURE_CARDS.filter(
              (card, index, arr) => arr.findIndex((c) => c.id === card.id) === index
            ).map((item) => (
              <div key={item.id} className="about-animate group relative">
                <div className="relative bg-white rounded-[2rem] p-8 lg:p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    {/* Icon with gradient background */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center mb-6 shadow-lg shadow-[#2E75B6]/25 group-hover:scale-110 transition-transform duration-500">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="font-display font-black text-xl lg:text-2xl text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOUR SECTION - Dramatic & Premium (no full-bleed photo — gradient only) */}
      <section ref={tourRef} className="relative min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111827] to-black" aria-hidden />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E75B6]/20 via-transparent to-[#2E75B6]/20 animate-pulse" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="tour-content space-y-8">
            <span className="inline-block px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 font-mono text-[#2E75B6] font-bold tracking-[0.3em] uppercase text-sm">
              The Return Of
            </span>

            <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-white leading-[0.85] tracking-tighter uppercase">
              {eventTitle ? (
                <span className="block max-w-5xl mx-auto text-[0.35em] sm:text-[0.4em] md:text-[0.45em] leading-tight normal-case tracking-tight text-white/95 mb-4">
                  {eventTitle}
                </span>
              ) : null}
              <span className="block">
                TOPAZ <span className="text-[#2E75B6] italic">2.0</span>
              </span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-white">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <Calendar className="w-6 h-6 text-[#2E75B6]" />
                <span className="font-display font-bold text-xl md:text-2xl uppercase tracking-wide">
                  {eventDateLabel}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <MapPin className="w-6 h-6 text-[#2E75B6]" />
                <span className="font-display font-bold text-xl md:text-2xl uppercase tracking-wide">
                  {eventLocationLabel}
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/registration"
                className="inline-flex items-center gap-3 px-12 py-5 bg-[#2E75B6] text-white font-bold text-lg uppercase tracking-wider rounded-full hover:bg-[#1F4E78] transition-all duration-300 hover:scale-105 shadow-2xl shadow-[#2E75B6]/50"
              >
                REGISTER NOW
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            <p className="text-white/60 text-lg max-w-2xl mx-auto pt-4 whitespace-pre-line">
              {eventDetailLine}
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white/40 rotate-90" />
        </div>
      </section>

      {/* TESTIMONIALS — Premium Glassmorphism */}
      <section
        ref={testimonialsRef}
        className="relative bg-gradient-to-br from-[#1F4E78] via-[#2E75B6] to-[#1F4E78] py-24 lg:py-32 overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 font-mono text-white/80 text-sm tracking-[0.2em] uppercase font-bold mb-4">
              What Studios Say
            </span>
            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight">
              TESTIMONIALS
            </h2>
          </div>

          <div className="testimonial-card rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur-xl px-8 py-14 sm:px-12 sm:py-16 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Coming Soon</span>
            </div>
            <p className="text-white/90 text-xl leading-relaxed font-light">
              Studio testimonials will appear here after the competition season. 
              Check back soon to hear what dance studios are saying about their TOPAZ experience.
            </p>
            <div className="mt-8 flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION — Ultra Premium */}
      <section className="relative bg-gradient-to-br from-[#0F2847] via-[#1F4E78] to-[#2E75B6] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2847]/90 via-transparent to-[#1F4E78]/80" aria-hidden />

        {/* Floating decorations */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-[60px]" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#2E75B6]/30 rounded-full blur-[80px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 font-mono text-white/80 text-sm tracking-wider uppercase font-bold mb-6">
            Join The Legacy
          </span>
          
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            READY TO TAKE THE <span className="text-[#7EB8E8] italic">STAGE</span>?
          </h2>
          
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of dancers who have made TOPAZ their home. 
            Register today and start your journey to excellence.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/registration"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#2E75B6] font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              REGISTER NOW
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
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
