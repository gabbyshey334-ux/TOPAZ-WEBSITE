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
  Play,
  Sparkles,
  Trophy,
  Heart
} from 'lucide-react';
import HeroSection from '../sections/HeroSection';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;
const TOPAZ_BANNER_LOGO = `${BASE}images/logos/topaz-logo-masks.png`;
const TOPAZ_BANNER_LOGO_FALLBACK = `${BASE}images/logos/topaz-logo.png`;

// Enhanced promo cards with glassmorphism
const promoCards = [
  {
    id: 1,
    title: 'MASTER CLASSES',
    subtitle: 'COMING SOON',
    description: 'Learn from industry professionals',
    bg: 'from-violet-600/90 via-purple-700/90 to-indigo-900/90',
    accent: '#8B5CF6',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop',
    icon: Sparkles
  },
  {
    id: 2,
    title: 'SPONSORS',
    subtitle: 'COMING SOON',
    description: 'Partner with excellence',
    bg: 'from-[#2E75B6]/90 via-[#1F4E78]/90 to-[#0F2847]/90',
    accent: '#2E75B6',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop',
    icon: Trophy
  },
  {
    id: 3,
    title: 'PANEL & JUDGES',
    subtitle: 'COMING SOON',
    description: 'Expert adjudication panel',
    bg: 'from-amber-600/90 via-orange-700/90 to-red-900/90',
    accent: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=600&fit=crop',
    icon: Heart
  }
];

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

const Home = () => {
  const tourRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const splitBannerRef = useRef<HTMLElement>(null);
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

      // Promo cards - enhanced scale animation
      const promoCards = promoRef.current?.querySelectorAll('.promo-card');
      if (promoCards) {
        gsap.fromTo(
          promoCards,
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-[#2E75B6] selection:text-white">
      <HeroSection />

      {/* Heritage Photos - Masonry Layout */}
      <section
        ref={heritageRef}
        className="relative py-16 sm:py-20 bg-white"
        aria-label="TOPAZ heritage photographs"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Masonry Grid - 2 columns with varying heights like screenshot */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Left Column */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Photo 1 - Tall */}
              <div className="heritage-photo overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={legacyHistoryPhotos[0].src}
                  alt={legacyHistoryPhotos[0].alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Photo 3 - Squareish */}
              <div className="heritage-photo overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={legacyHistoryPhotos[2].src}
                  alt={legacyHistoryPhotos[2].alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-3 sm:gap-4 pt-8 sm:pt-12">
              {/* Photo 2 - Squareish */}
              <div className="heritage-photo overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={legacyHistoryPhotos[1].src}
                  alt={legacyHistoryPhotos[1].alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Photo 4 - Tall */}
              <div className="heritage-photo overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={legacyHistoryPhotos[3].src}
                  alt={legacyHistoryPhotos[3].alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOW LIVE / FEATURED SECTION - Premium asymmetric layout */}
      <section ref={featuredRef} className="relative bg-white py-20 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#2E75B6]/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2E75B6]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Featured Image with play button */}
            <div className="featured-animate relative">
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&h=900&fit=crop"
                  alt="Featured performance"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Play button */}
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 hover:bg-[#2E75B6]">
                  <Play className="w-8 h-8 text-[#2E75B6] group-hover:text-white ml-1 transition-colors" fill="currentColor" />
                </button>

                {/* Badge */}
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-bold text-sm text-gray-900 uppercase tracking-wider">Now Live</span>
                  </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-display font-black text-2xl md:text-3xl text-white">
                    THE REFLECTION TOUR
                  </h3>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">August 22, 2026</p>
                    <p className="text-sm text-gray-500">Seaside, Oregon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-8">
              <div className="featured-animate">
                <span className="inline-block px-4 py-2 bg-[#2E75B6]/10 text-[#2E75B6] font-mono text-sm tracking-wider uppercase font-bold rounded-full mb-4">
                  Featured Event
                </span>
                <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-[1.1]">
                  READY TO <span className="text-[#2E75B6] italic">REFLECT</span>?
                </h2>
              </div>
              
              <p className="featured-animate text-gray-600 text-lg leading-relaxed max-w-lg">
                Join us for an unforgettable dance experience. The Reflection Tour brings together 
                the best dancers from across the nation to compete, learn, and grow together in an 
                atmosphere of excellence and celebration.
              </p>

              <div className="featured-animate flex flex-wrap gap-4">
                <Link
                  to="/registration"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#2E75B6] text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-[#1F4E78] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#2E75B6]/25"
                >
                  REGISTER NOW
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider rounded-full hover:border-[#2E75B6] hover:text-[#2E75B6] transition-all duration-300"
                >
                  LEARN MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL CARDS - Glassmorphism Premium */}
      <section ref={promoRef} className="relative py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#2E75B6]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="text-[#2E75B6] font-mono text-sm tracking-[0.2em] uppercase font-bold">
              What's Coming
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 mt-3 tracking-tight">
              Exciting <span className="italic">Features</span> Ahead
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {promoCards.map((card) => (
              <div
                key={card.id}
                className="promo-card group relative h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden cursor-pointer"
              >
                {/* Background image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} transition-opacity duration-500`} />
                
                {/* Glassmorphism content card */}
                <div className="absolute inset-x-6 bottom-6">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${card.accent}30` }}
                    >
                      <card.icon className="w-6 h-6" style={{ color: card.accent === '#2E75B6' ? 'white' : card.accent }} />
                    </div>

                    <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                      {card.subtitle}
                    </p>
                    <h3 className="font-display font-black text-2xl text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {card.description}
                    </p>

                    {/* Coming Soon badge */}
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: 'OVER 50 YEARS',
                description: 'Since 1972, TOPAZ has been the premier dance competition, nurturing talent and creating unforgettable moments for dancers nationwide.',
                gradient: 'from-amber-500/20 to-orange-500/20'
              },
              {
                icon: Award,
                title: 'PRESTIGIOUS AWARDS',
                description: 'Our unique cumulative scoring system lets dancers earn bronze, silver, and gold medals as they progress through the competition season.',
                gradient: 'from-[#2E75B6]/20 to-blue-600/20'
              },
              {
                icon: Users,
                title: 'INCLUSIVE COMMUNITY',
                description: 'Welcoming dancers of all ages, backgrounds, and skill levels in a supportive and inspiring environment.',
                gradient: 'from-purple-500/20 to-pink-500/20'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="about-animate group relative"
              >
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

      {/* TOUR SECTION - Dramatic & Premium */}
      <section ref={tourRef} className="relative min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop"
            alt="TOPAZ Competition"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E75B6]/20 via-transparent to-[#2E75B6]/20 animate-pulse" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="tour-content space-y-8">
            <span className="inline-block px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 font-mono text-[#2E75B6] font-bold tracking-[0.3em] uppercase text-sm">
              The Return Of
            </span>

            <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-white leading-[0.85] tracking-tighter uppercase">
              TOPAZ <span className="text-[#2E75B6] italic">2.0</span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-white">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <Calendar className="w-6 h-6 text-[#2E75B6]" />
                <span className="font-display font-bold text-xl md:text-2xl uppercase tracking-wide">
                  August 22, 2026
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <MapPin className="w-6 h-6 text-[#2E75B6]" />
                <span className="font-display font-bold text-xl md:text-2xl uppercase tracking-wide">
                  Seaside, OR
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

            <p className="text-white/60 text-lg max-w-2xl mx-auto pt-4">
              Seaside Convention Center • 415 1st Ave, Seaside, OR 97138
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

      {/* PREMIUM SPLIT BANNER — Revel-inspired */}
      <section
        ref={splitBannerRef}
        className="relative overflow-hidden"
        aria-labelledby="split-banner-heading"
      >
        {/* Luxurious gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2847] via-[#1F4E78] to-[#2E75B6]" />
        
        {/* Animated spotlight effect */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Left: Logo Frame */}
            <div className="split-banner-animate flex flex-col gap-4 sm:gap-5">
              <div className="relative flex min-h-[340px] items-center justify-center rounded-[2rem] border-2 border-white/30 bg-white/5 backdrop-blur-sm px-6 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:min-h-[400px] sm:px-10 sm:py-14 lg:min-h-[460px] lg:px-12 lg:py-16 overflow-hidden group">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <img
                  src={TOPAZ_BANNER_LOGO}
                  alt="TOPAZ logo"
                  className="relative z-10 h-auto w-full max-w-[min(100%,400px)] object-contain drop-shadow-2xl sm:max-w-[min(100%,460px)] lg:max-w-[min(100%,520px)] xl:max-w-[min(100%,600px)]"
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
              
              {/* Meta info with glass effect */}
              <div className="flex justify-between gap-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 sm:px-6 sm:py-4">
                <span className="font-serif text-sm font-medium tracking-[0.12em] text-white/90 uppercase sm:text-base">
                  Seaside, OR
                </span>
                <span className="font-serif text-sm font-medium tracking-[0.12em] text-white/90 uppercase sm:text-base">
                  Aug 22, 2026
                </span>
              </div>
            </div>

            {/* Right: Content */}
            <div className="split-banner-animate flex flex-col justify-center space-y-6 text-white lg:space-y-8">
              <h2
                id="split-banner-heading"
                className="font-display text-[1.5rem] font-black uppercase leading-[1.15] tracking-[0.02em] sm:text-2xl md:text-3xl lg:text-[1.85rem] xl:text-4xl"
              >
                From the legacy you know and love comes{' '}
                <span className="text-[#7EB8E8]">The Return of TOPAZ 2.0</span> — a theatrical arts
                competition featuring respected adjudication, studio community, awards recognition,
                and one powerful weekend on the Oregon coast.
              </h2>
              
              <p className="max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg">
                Professionally run scheduling, clear registration, and a welcoming environment for
                dancers and educators — the same standards TOPAZ has stood for since 1972.
              </p>

              {/* Date pills */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
                  <Calendar className="w-4 h-4 text-[#7EB8E8]" />
                  <span className="text-sm font-bold uppercase tracking-wider">Registration opens April 1, 2026</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
                  <span className="text-sm font-bold uppercase tracking-wider">Closes July 30, 2026</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-[#1F4E78] sm:text-base"
                >
                  Learn More
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION — Ultra Premium */}
      <section className="relative bg-gradient-to-br from-[#0F2847] via-[#1F4E78] to-[#2E75B6] py-24 lg:py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop')] opacity-10 bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2847] via-transparent to-[#1F4E78]" />
        </div>

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
