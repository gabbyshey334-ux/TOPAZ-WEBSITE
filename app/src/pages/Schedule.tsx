import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, ChevronDown, Calendar } from 'lucide-react';
import CompetitionCard, { type CompetitionCardProps } from '../components/CompetitionCard';

gsap.registerPlugin(ScrollTrigger);

const Schedule = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroElements = heroRef.current?.querySelectorAll('.hero-animate');
      if (heroElements && heroElements.length > 0) {
        gsap.fromTo(
          heroElements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
          }
        );
      }

      const cardElements = upcomingRef.current?.querySelectorAll('.competition-card');
      if (cardElements && cardElements.length > 0) {
        gsap.fromTo(
          cardElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: upcomingRef.current,
              start: 'top 70%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const upcomingCompetitions: CompetitionCardProps[] = [
    {
      id: '1',
      name: 'The Return of TOPAZ 2.0',
      subtitle: 'Join us for the return of TOPAZ 2.0',
      date: 'Saturday, August 22, 2026',
      time: '8:00 AM – 12:00 PM',
      location: 'Seaside Convention Center',
      address: '415 1st Ave, Seaside, OR 97138',
      registrationDeadline: 'July 30, 2026, 12:00 AM',
      status: 'open',
      description: 'Event time: 8:00 AM – 12:00 PM. Registration opens April 1, 2026. Deadline: July 30, 2026, 12:00 AM.',
      image: `${import.meta.env.BASE_URL}images/events/trophy-gold.jpg`,
    },
  ];

  const pastCompetitions: CompetitionCardProps[] = [];

  const filterCompetitions = (competitions: CompetitionCardProps[]) => {
    return competitions.filter((comp) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'open' && comp.status === 'open') ||
        (filter === 'upcoming' && comp.status === 'coming') ||
        (filter === 'past' && comp.status === 'closed');

      const matchesSearch =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  };

  const filteredUpcoming = filterCompetitions(upcomingCompetitions);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section
        ref={heroRef}
        className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center"
      >
        {/* Background visual */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
          <p className="hero-animate font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            Season 2026
          </p>
          <h1 className="hero-animate font-display font-black text-5xl sm:text-6xl lg:text-8xl text-white mb-8 tracking-tighter uppercase">
            Competition <span className="text-primary italic">Schedule</span>
          </h1>
          <div className="hero-animate w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 glass sticky top-[80px] z-30 border-b border-gray-100 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full sm:w-auto">
              {(['all', 'open', 'upcoming', 'past'] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Competitions */}
      <section ref={upcomingRef} className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Upcoming Competitions
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl">
              Don&apos;t miss your chance to shine on the TOPAZ stage.
            </p>
          </div>

          {filteredUpcoming.length > 0 ? (
            <div className="space-y-12 lg:space-y-16">
              {filteredUpcoming.map((competition) => (
                <div key={competition.id} className="competition-card w-full">
                  <CompetitionCard {...competition} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                No competitions found matching your criteria.
              </p>
              <button 
                onClick={() => {setFilter('all'); setSearchQuery('');}}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Past Competitions Toggle */}
      <section className="py-24 lg:py-32 bg-[#fcfcfc] border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <button
            onClick={() => setShowPast(!showPast)}
            className="group flex items-center justify-between w-full p-8 bg-white border border-gray-100 rounded-3xl shadow-premium hover:shadow-xl transition-all duration-500"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <Calendar className="w-6 h-6 text-gray-400 group-hover:text-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-display font-black text-2xl lg:text-3xl text-[#0a0a0a]">
                  Past <span className="text-gray-400 italic">Competitions</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Review results and highlights from previous events</p>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 ${showPast ? 'bg-primary text-white border-primary rotate-180' : 'text-gray-400'}`}>
              <ChevronDown className="w-6 h-6" />
            </div>
          </button>

          {showPast && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 animate-in fade-in slide-in-from-top-8 duration-700">
              {pastCompetitions.map((competition) => (
                <div key={competition.id} className="h-full opacity-70 hover:opacity-100 transition-opacity duration-500">
                  <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-premium">
                    <CompetitionCard {...competition} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 lg:py-48 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[150px] opacity-20" />
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-8 leading-tight tracking-tighter uppercase">
            Ready to <span className="italic text-secondary">Compete</span>?
          </h2>
          <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Register early to secure your spot and take advantage of early bird
            pricing. Join the TOPAZ family today.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/rules"
              className="btn-secondary !bg-white !text-primary !border-none !px-10 !py-4"
            >
              View Competition Rules
            </Link>
            <button
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              className="btn-secondary !bg-transparent !text-white !border-white/30 hover:!bg-white/10 !px-10 !py-4"
            >
              Back to Top
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Schedule;
