import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Trophy,
  Heart,
  MapPin,
  Clock,
} from 'lucide-react';
import CompetitionCard from '../components/CompetitionCard';
import HeroSection from '../sections/HeroSection';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const upcomingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Upcoming competitions
      const cardElements = upcomingRef.current?.querySelectorAll('.competition-card');
      if (cardElements && cardElements.length > 0) {
        gsap.fromTo(
          cardElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: upcomingRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Features
      const featureElements = featuresRef.current?.querySelectorAll('.feature-card');
      if (featureElements && featureElements.length > 0) {
        gsap.fromTo(
          featureElements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // CTA section
      const ctaElements = ctaRef.current?.querySelectorAll('.cta-animate');
      if (ctaElements && ctaElements.length > 0) {
        gsap.fromTo(
          ctaElements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 75%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const upcomingCompetitions = [
    {
      id: '1',
      name: 'The Return of TOPAZ 2.0',
      subtitle: 'Join us for the return of TOPAZ 2.0',
      date: 'Saturday, August 22, 2026',
      time: '8:00 AM – 12:00 PM',
      location: 'Seaside Convention Center',
      address: '415 1st Ave, Seaside, OR 97138',
      registrationDeadline: 'July 22, 2026, 12:00 AM',
      status: 'open' as const,
      description: 'Event time: 8:00 AM – 12:00 PM. Join us for the return of TOPAZ 2.0.',
      image: `${import.meta.env.BASE_URL}images/events/trophy-gold.jpg`,
    },
    {
      id: '2',
      name: 'National Finals 2026',
      subtitle: 'The pinnacle of the TOPAZ season',
      date: 'June 20-22, 2026',
      location: 'MGM Grand, Las Vegas, NV',
      registrationDeadline: 'May 31, 2026',
      status: 'coming' as const,
      description: 'The pinnacle of the TOPAZ season with national titles.',
      image: `${import.meta.env.BASE_URL}images/events/competition-2026.jpg`,
    },
  ];

  const features = [
    {
      icon: Award,
      title: 'Professional Judging',
      description:
        'Experienced judges provide fair evaluation and constructive feedback for all performers.',
    },
    {
      icon: Heart,
      title: 'Inclusive Community',
      description:
        'Welcoming dancers of all ages, backgrounds, and skill levels in a supportive environment.',
    },
    {
      icon: Trophy,
      title: 'Prestigious Awards',
      description:
        'Earn medals, trophies, and scholarships as you progress through the competition season.',
    },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white">
      <HeroSection />

      {/* Upcoming Competitions */}
      <section ref={upcomingRef} id="about" className="py-24 lg:py-40 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-6 leading-[1.1]">
                Upcoming <span className="text-primary italic">Competitions</span>
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Don't miss your chance to shine on the TOPAZ stage. Join the legacy 
                of excellence and compete with the best in the industry.
              </p>
            </div>
            <Link
              to="/schedule"
              className="btn-secondary group whitespace-nowrap"
            >
              View Full Schedule
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {upcomingCompetitions.map((competition) => (
              <div key={competition.id} className="competition-card group">
                <div className="relative overflow-hidden rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-700 h-full bg-white border border-gray-100">
                  <CompetitionCard {...competition} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 lg:py-40 bg-[#fcfcfc] border-y border-gray-100 relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              Why Choose <span className="text-primary">TOPAZ</span>?
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Experience the difference of a competition built by dancers, for
              dancers. We provide an unparalleled platform for growth and recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card glass-dark hover:bg-black group p-10 rounded-3xl shadow-premium shadow-premium-hover border border-white/5 transition-all duration-700"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-6 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore the Collection - Merchandise Section */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-4 uppercase tracking-tighter">
              Explore the <span className="text-primary italic">Collection</span>
            </h2>
            <h3 className="font-mono text-xl md:text-2xl text-primary font-bold tracking-[0.2em]">
              PRE ORDER NOW!
            </h3>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
            {/* Product images in app/public/images/products/ */}
            {[
              {
                id: 1,
                image: `${import.meta.env.BASE_URL}images/products/tshirt-black-1.jpg`,
                fallback: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=800&fit=crop',
                name: 'Heritage Tee',
                subtitle: 'DANCE AND PERFORMING ARTS',
              },
              {
                id: 2,
                image: `${import.meta.env.BASE_URL}images/products/tshirt-blue-1.jpg`,
                fallback: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
                name: 'Performance Blue',
                subtitle: 'ESTABLISHED 1972',
              },
              {
                id: 3,
                image: `${import.meta.env.BASE_URL}images/products/tshirt-black-2.jpg`,
                fallback: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=800&fit=crop',
                name: 'Legacy Black',
                subtitle: 'DANCE COMPETITION',
              },
              {
                id: 4,
                image: `${import.meta.env.BASE_URL}images/products/sweatshirt-black-1.jpg`,
                fallback: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
                name: 'Signature Hoodie',
                subtitle: 'THEATRICAL ARTS',
              },
            ].map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-3xl mb-8 relative shadow-premium shadow-premium-hover">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    onError={(e) => {
                      e.currentTarget.src = product.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button className="w-full py-3 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-xl shadow-xl">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center px-4">
                  <h4 className="font-display font-bold text-xl text-[#0a0a0a] mb-1">
                    {product.name}
                  </h4>
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                    {product.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Shop Now Button */}
          <div className="text-center">
            <button
              onClick={() => alert('Shop coming soon!')}
              className="btn-primary"
            >
              Shop All Merchandise
            </button>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-24 lg:py-40 border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left - Image Grid */}
            <div className="grid grid-cols-2 gap-6 relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl translate-y-12">
                <img
                  src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=800&fit=crop"
                  alt="Dance performance"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&h=800&fit=crop"
                  alt="Dancer portrait"
                  className="w-full h-full object-cover transition-all duration-1000"
                />
              </div>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl translate-y-12">
                <img
                  src="https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=800&fit=crop"
                  alt="Group dance"
                  className="w-full h-full object-cover transition-all duration-1000"
                />
              </div>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&h=800&fit=crop"
                  alt="Dance competition"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
            </div>

            {/* Right - Info */}
            <div className="lg:pl-10">
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-12 leading-[1.1]">
                Everything You <span className="text-primary italic">Need</span> to Know
              </h2>
              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <MapPin className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#0a0a0a] mb-2 group-hover:text-primary transition-colors">
                      Multiple Locations
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      Competitions held across the country in world-class venues 
                      and major metropolitan cities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <Clock className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#0a0a0a] mb-2 group-hover:text-primary transition-colors">
                      Flexible Scheduling
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      We offer multiple dates throughout the year to perfectly fit 
                      your studio's competition season.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <Award className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#0a0a0a] mb-2 group-hover:text-primary transition-colors">
                      Medal Program
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      Our unique cumulative scoring system lets dancers earn bronze, 
                      silver, and gold as they progress.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-16">
                <Link
                  to="/rules"
                  className="btn-primary group"
                >
                  View All Rules & Categories
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-24 lg:py-40 bg-[#0a0a0a] relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto text-center relative z-10">
          <h2 className="cta-animate font-display font-black text-5xl lg:text-8xl text-white mb-10 tracking-tighter">
            READY TO TAKE THE <span className="text-primary italic">STAGE</span>?
          </h2>
          <p className="cta-animate text-white/60 text-xl lg:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed">
            Join thousands of dancers who have made TOPAZ their home. 
            Register today and start your journey.
          </p>
          <div className="cta-animate flex flex-wrap justify-center gap-6">
            <Link
              to="/schedule"
              className="btn-primary !px-12 !py-5 text-lg"
            >
              Register Now
            </Link>
            <Link
              to="/contact"
              className="btn-secondary !bg-transparent !text-white !border-white/20 hover:!bg-white/10 !px-12 !py-5 text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
