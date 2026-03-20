import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Star,
  Award,
  Users,
  ChevronRight,
  Play
} from 'lucide-react';
import HeroSection from '../sections/HeroSection';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Competition data
const tourDates = [
  {
    id: '1',
    city: 'SEASIDE, OR',
    venue: 'Seaside Convention Center',
    date: 'AUG 22, 2026',
    time: '8:00 AM',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  },
  {
    id: '2',
    city: 'PORTLAND, OR',
    venue: 'Portland Convention Center',
    date: 'SEP 12, 2026',
    time: '9:00 AM',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop'
  },
  {
    id: '3',
    city: 'LAS VEGAS, NV',
    venue: 'MGM Grand',
    date: 'OCT 15, 2026',
    time: '10:00 AM',
    status: 'coming',
    image: 'https://images.unsplash.com/photo-1581351123004-7579805fb014?w=800&h=600&fit=crop'
  }
];

// Promotional cards
const promoCards = [
  {
    id: 1,
    title: 'SUMMER INTENSIVE',
    subtitle: 'TRAINING CAMP',
    description: 'Join our elite summer program',
    bg: 'from-purple-600 to-purple-900',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'THE PANEL',
    subtitle: 'JUDGES & MENTORS',
    description: 'Meet our industry experts',
    bg: 'from-pink-600 to-rose-900',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'MASTER CLASS',
    subtitle: 'EXCLUSIVE WORKSHOP',
    description: 'Learn from the best',
    bg: 'from-blue-600 to-blue-900',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=400&fit=crop'
  }
];

// Sponsors
const sponsors = [
  { name: 'CAPEZIO', logo: 'https://placehold.co/120x40/333/fff?text=CAPEZIO' },
  { name: 'BLOCH', logo: 'https://placehold.co/120x40/333/fff?text=BLOCH' },
  { name: 'DANCE SPIRIT', logo: 'https://placehold.co/120x40/333/fff?text=DANCE+SPIRIT' },
  { name: 'DISNEY', logo: 'https://placehold.co/120x40/333/fff?text=DISNEY' },
  { name: 'JOFFREY', logo: 'https://placehold.co/120x40/333/fff?text=JOFFREY' }
];

const Home = () => {
  const tourRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const magazineRef = useRef<HTMLDivElement>(null);
  const sponsorsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Tour dates animation
      const tourCards = tourRef.current?.querySelectorAll('.tour-card');
      if (tourCards) {
        gsap.fromTo(
          tourCards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
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

      // Sponsors
      const sponsorLogos = sponsorsRef.current?.querySelectorAll('.sponsor-logo');
      if (sponsorLogos) {
        gsap.fromTo(
          sponsorLogos,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sponsorsRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-[#2E75B6] selection:text-white">
      <HeroSection />

      {/* TOUR DATES BANNER - Like reference */}
      <section ref={tourRef} className="relative bg-gradient-to-r from-purple-900 via-purple-700 to-pink-600 py-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="tour-card flex items-center gap-4">
              <Calendar className="w-8 h-8 text-white" />
              <div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
                  2026/27 TOUR DATES
                </h2>
                <p className="text-white/80 text-sm">Join us on the road this season</p>
              </div>
            </div>
            <Link
              to="/schedule"
              className="tour-card inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 font-bold text-sm uppercase tracking-wider rounded hover:bg-white/90 transition-all duration-200"
            >
              VIEW DATES
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* NOW LIVE / FEATURED SECTION - Like reference */}
      <section ref={featuredRef} className="relative bg-[#0a0a0a] py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Image/Video */}
            <div className="featured-animate relative aspect-[4/3] rounded-2xl overflow-hidden group">
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
              {/* Play button */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-[#0a0a0a] ml-1" fill="currentColor" />
              </button>
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <div className="featured-animate">
                <span className="text-[#2E75B6] font-mono text-sm tracking-[0.2em] uppercase font-bold">
                  Featured Event
                </span>
                <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white mt-2 leading-[1.1]">
                  READY TO <span className="text-[#2E75B6]">REFLECT</span>?
                </h2>
              </div>
              <p className="featured-animate text-white/70 text-lg leading-relaxed">
                Join us for an unforgettable dance experience. The Reflection Tour brings together 
                the best dancers from across the nation to compete, learn, and grow together.
              </p>
              <div className="featured-animate flex flex-wrap gap-4">
                <Link
                  to="/registration"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#2E75B6] text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-[#1F4E78] transition-all duration-200"
                >
                  REGISTER NOW
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-white/10 transition-all duration-200"
                >
                  LEARN MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL CARDS - Like reference */}
      <section ref={promoRef} className="relative bg-[#0a0a0a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4">
            {promoCards.map((card) => (
              <div
                key={card.id}
                className="promo-card relative h-64 md:h-72 rounded-xl overflow-hidden group cursor-pointer"
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

      {/* ABOUT / REVELATIONS SECTION - Like reference */}
      <section ref={aboutRef} className="relative bg-[#0a0a0a] py-20 lg:py-32 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="about-animate font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight">
              TOPAZ <span className="text-[#2E75B6]">LEGACY</span>
            </h2>
            <div className="about-animate w-24 h-1 bg-[#2E75B6] mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="about-animate bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#2E75B6]/30 transition-colors duration-300">
              <Star className="w-10 h-10 text-[#2E75B6] mb-4" />
              <h3 className="font-display font-bold text-xl text-white mb-3">OVER 50 YEARS</h3>
              <p className="text-white/60 leading-relaxed">
                Since 1972, TOPAZ has been the premier dance competition, 
                nurturing talent and creating unforgettable moments for dancers nationwide.
              </p>
            </div>

            <div className="about-animate bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#2E75B6]/30 transition-colors duration-300">
              <Award className="w-10 h-10 text-[#2E75B6] mb-4" />
              <h3 className="font-display font-bold text-xl text-white mb-3">PRESTIGIOUS AWARDS</h3>
              <p className="text-white/60 leading-relaxed">
                Our unique cumulative scoring system lets dancers earn bronze, 
                silver, and gold medals as they progress through the competition season.
              </p>
            </div>

            <div className="about-animate bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#2E75B6]/30 transition-colors duration-300">
              <Users className="w-10 h-10 text-[#2E75B6] mb-4" />
              <h3 className="font-display font-bold text-xl text-white mb-3">INCLUSIVE COMMUNITY</h3>
              <p className="text-white/60 leading-relaxed">
                Welcoming dancers of all ages, backgrounds, and skill levels 
                in a supportive and inspiring environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAGAZINE / FEATURE SECTION - Like reference */}
      <section ref={magazineRef} className="relative bg-gradient-to-br from-purple-900 via-[#1a1a3e] to-[#0a0a0a] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop')] opacity-10 bg-cover bg-center" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Magazine mockup */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=1000&fit=crop"
                  alt="TOPAZ Magazine"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-[#2E75B6] text-white text-xs font-bold uppercase tracking-wider rounded mb-3">
                    Featured
                  </span>
                  <h3 className="font-display font-black text-3xl text-white leading-tight">
                    DANCE<br/>MAGAZINE
                  </h3>
                  <p className="text-white/80 mt-2">NASHVILLE, TN • AUG 15, 2026</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#2E75B6] rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-2xl" />
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <span className="text-[#2E75B6] font-mono text-sm tracking-[0.2em] uppercase font-bold">
                Press & Media
              </span>
              <h2 className="font-display font-black text-4xl md:text-5xl text-white leading-[1.1]">
                TOPAZ IN THE <span className="text-[#2E75B6]">SPOTLIGHT</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                From the trusted brands you know and love, TOPAZ has been featured in leading 
                dance publications. Our competitions are recognized for excellence, innovation, 
                and creating opportunities for dancers to shine on the national stage.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                  <Award className="w-6 h-6 text-[#2E75B6]" />
                  <span className="text-white font-bold">Voted #1 Competition</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                  <Star className="w-6 h-6 text-[#2E75B6]" />
                  <span className="text-white font-bold">Industry Leader</span>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#2E75B6] text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-[#1F4E78] transition-all duration-200 mt-4">
                READ ARTICLE
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TOUR DATES CARDS SECTION */}
      <section className="relative bg-[#0a0a0a] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#2E75B6] font-mono text-sm tracking-[0.2em] uppercase font-bold">
              Upcoming Events
            </span>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white mt-4">
              TOUR <span className="text-[#2E75B6]">DATES</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tourDates.map((tour) => (
              <div
                key={tour.id}
                className="group relative bg-gradient-to-b from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#2E75B6]/50 transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                      tour.status === 'upcoming' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tour.status === 'upcoming' ? 'OPEN' : 'COMING SOON'}
                    </span>
                    <span className="text-[#2E75B6] font-bold">{tour.date}</span>
                  </div>
                  <h3 className="font-display font-black text-2xl text-white mb-1">{tour.city}</h3>
                  <p className="text-white/60 text-sm mb-4">{tour.venue}</p>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {tour.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Register Now
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/schedule"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[#2E75B6] text-[#2E75B6] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#2E75B6] hover:text-white transition-all duration-200"
            >
              VIEW ALL DATES
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSORS SECTION - Like reference */}
      <section ref={sponsorsRef} className="relative bg-[#0a0a0a] py-16 lg:py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
              OUR <span className="text-[#2E75B6]">SPONSORS</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="sponsor-logo opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="h-10 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative bg-gradient-to-br from-purple-900 via-[#1a1a3e] to-[#0a0a0a] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop')] opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            READY TO TAKE THE <span className="text-[#2E75B6]">STAGE</span>?
          </h2>
          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of dancers who have made TOPAZ their home. 
            Register today and start your journey to excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/registration"
              className="inline-flex items-center gap-2 px-10 py-5 bg-[#2E75B6] text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-[#1F4E78] transition-all duration-200"
            >
              REGISTER NOW
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-10 py-5 border border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-white/10 transition-all duration-200"
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
