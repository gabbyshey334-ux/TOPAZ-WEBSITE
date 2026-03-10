import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Download,
  Music,
  Sparkles,
  Star,
  Users,
  Award,
  Baby,
  User,
  UserCircle,
  Crown,
  Clock,
  Target,
  Shirt,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import CategoryCard from '../components/CategoryCard';

gsap.registerPlugin(ScrollTrigger);

const Rules = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const abilityRef = useRef<HTMLDivElement>(null);
  const divisionRef = useRef<HTMLDivElement>(null);
  const scoringRef = useRef<HTMLDivElement>(null);
  const medalRef = useRef<HTMLDivElement>(null);
  const generalRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'age', label: 'Age Divisions' },
    { id: 'ability', label: 'Ability Levels' },
    { id: 'division', label: 'Division Types' },
    { id: 'scoring', label: 'Scoring' },
    { id: 'medal', label: 'Medal Program' },
    { id: 'general', label: 'General Rules' },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const sectionMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      categories: categoriesRef,
      age: ageRef,
      ability: abilityRef,
      division: divisionRef,
      scoring: scoringRef,
      medal: medalRef,
      general: generalRef,
    };
    const section = sectionMap[sectionId]?.current;
    if (section) {
      const offset = 120;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

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

      const sections = [
        categoriesRef,
        ageRef,
        abilityRef,
        divisionRef,
        scoringRef,
        medalRef,
        generalRef,
      ];

      sections.forEach((ref) => {
        const elements = ref.current?.querySelectorAll('.section-animate');
        if (elements && elements.length > 0) {
          gsap.fromTo(
            elements,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                start: 'top 75%',
              },
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  // Performing Arts Categories
  const performingArtsCategories = [
    {
      name: 'Tap',
      description: 'Traditional and contemporary tap dance styles.',
      icon: 'music' as const,
      details: [
        'Emphasis on rhythm, timing, and footwork precision',
        'Traditional, Broadway, and contemporary styles accepted',
        'Props allowed with prior approval',
      ],
    },
    {
      name: 'Jazz',
      description: 'Energetic and expressive jazz dance forms.',
      icon: 'sparkles' as const,
      details: [
        'Includes Broadway, contemporary, and traditional jazz',
        'Focus on technique, style, and performance quality',
        'Leaps, turns, and floor work encouraged',
      ],
    },
    {
      name: 'Ballet',
      description: 'Classical and contemporary ballet techniques.',
      icon: 'star' as const,
      details: [
        'Classical, neoclassical, and contemporary ballet accepted',
        'Pointe work allowed for advanced levels',
        'Proper technique and form essential',
      ],
    },
    {
      name: 'Hip Hop',
      description: 'Urban dance styles and street dance forms.',
      icon: 'users' as const,
      details: [
        'Breaking, popping, locking, and freestyle accepted',
        'Authentic street style encouraged',
        'Freestyle battles available in select divisions',
      ],
    },
    {
      name: 'Lyrical/Contemporary',
      description: 'Emotional and expressive modern dance.',
      icon: 'music' as const,
      details: [
        'Focus on emotional expression and storytelling',
        'Blend of ballet, jazz, and modern techniques',
        'Interpretation of music and lyrics valued',
      ],
    },
    {
      name: 'Vocal',
      description: 'Singing performances with or without movement.',
      icon: 'award' as const,
      details: [
        'Solo and group vocal performances',
        'May include minimal choreography',
        'Original songs and covers accepted',
      ],
    },
    {
      name: 'Acting',
      description: 'Theatrical and dramatic performances.',
      icon: 'star' as const,
      details: [
        'Monologues, scenes, and theatrical pieces',
        'Character development and emotional depth valued',
        'Props and minimal set pieces allowed',
      ],
    },
  ];

  // Variety Arts Categories
  const varietyArtsCategories = [
    {
      name: 'Variety A',
      description: 'Song & Dance, Character, or Combination performances.',
      icon: 'sparkles' as const,
      details: [
        'Combines multiple performance styles',
        'Character work and theatrical elements encouraged',
        'Creative combinations of singing, dancing, and acting',
      ],
    },
    {
      name: 'Variety B',
      description: 'Dance with Prop - Incorporates props into choreography.',
      icon: 'star' as const,
      details: [
        'Props must be integral to the choreography',
        'Safe prop handling required',
        'Props must be approved prior to performance',
      ],
    },
    {
      name: 'Variety C',
      description: 'Dance with Acrobatics - Features acrobatic elements.',
      icon: 'award' as const,
      details: [
        'Gymnastics and acrobatic skills integrated into dance',
        'Safe execution of tricks required',
        'Proper spotting and technique essential',
      ],
    },
    {
      name: 'Variety D',
      description: 'Dance with Acrobatics & Prop - Combines both elements.',
      icon: 'sparkles' as const,
      details: [
        'Combines acrobatics and props in choreography',
        'Advanced category for experienced performers',
        'Safety is paramount in all elements',
      ],
    },
    {
      name: 'Variety E',
      description: 'Hip Hop with Floor Work & Acrobatics.',
      icon: 'users' as const,
      details: [
        'Urban styles with advanced floor techniques',
        'Breaking, power moves, and freezes encouraged',
        'Authentic hip hop style with acrobatic flair',
      ],
    },
    {
      name: 'Variety F - Ballroom',
      description: 'Partner dance styles and social dance forms.',
      icon: 'users' as const,
      details: [
        'Standard and Latin styles accepted',
        'Couples and group formations welcome',
        'Proper technique and partnership emphasized',
      ],
    },
    {
      name: 'Variety G - Line Dancing',
      description: 'Choreographed group dances in lines or rows.',
      icon: 'users' as const,
      details: [
        'Country, pop, and themed line dances',
        'Synchronization and group unity valued',
        'Minimum 3 contestants required',
      ],
    },
  ];

  // Special Categories
  const specialCategories = [
    {
      name: 'Production',
      description: 'Large ensemble performances with 10+ members.',
      icon: 'users' as const,
      badge: 'PARTICIPATION ONLY',
      details: [
        'Minimum 10 performers required',
        'Themed productions with full staging',
        'Showcases group talent and creativity',
      ],
    },
    {
      name: 'Student Choreography',
      description: 'Pieces choreographed by students.',
      icon: 'star' as const,
      badge: 'PARTICIPATION ONLY',
      details: [
        'Choreographer must be current student',
        'Showcases emerging choreographic talent',
        'Original work encouraged',
      ],
    },
    {
      name: 'Teacher/Student',
      description: 'Performances featuring teachers with students.',
      icon: 'award' as const,
      badge: 'PARTICIPATION ONLY',
      details: [
        'Teacher and student perform together',
        'Celebrates the mentor-student relationship',
        'Any dance style accepted',
      ],
    },
  ];

  // Age Divisions
  const ageDivisions = [
    {
      name: 'Junior Primary',
      age: 'Ages 3-7',
      icon: Baby,
      color: 'bg-sky-100 text-sky-600 border-sky-200',
    },
    {
      name: 'Junior Advanced',
      age: 'Ages 8-12',
      icon: User,
      color: 'bg-blue-100 text-blue-600 border-blue-200',
    },
    {
      name: 'Senior Youth',
      age: 'Ages 13-18',
      icon: UserCircle,
      color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    },
    {
      name: 'Senior Adult',
      age: 'Ages 19-99',
      icon: Crown,
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ];

  // Ability Levels
  const abilityLevels = [
    {
      name: 'Beginning',
      description: 'Less than 2 years training',
      icon: Star,
      stars: 1,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      name: 'Intermediate',
      description: '2-4 years training',
      icon: Star,
      stars: 2,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      name: 'Advanced',
      description: '5+ years training',
      icon: Star,
      stars: 3,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  // Division Types
  const divisionTypes = [
    { name: 'Solo', count: '1 person', icon: User },
    { name: 'Duo', count: '2 people', icon: Users },
    { name: 'Trio', count: '3 people', icon: Users },
    { name: 'Small Group', count: '4-10 people', icon: Users },
    { name: 'Large Group', count: '11+ people', icon: Users },
    { name: 'Production', count: '10+ people', icon: Award },
  ];

  // Scoring Categories
  const scoringCategories = [
    { name: 'Technique', points: 25, color: 'bg-blue-500' },
    { name: 'Creativity & Choreography', points: 25, color: 'bg-purple-500' },
    { name: 'Presentation', points: 25, color: 'bg-green-500' },
    { name: 'Appearance & Costume', points: 25, color: 'bg-amber-500' },
  ];

  // Medal Program
  const medalTiers = [
    {
      name: 'Bronze Medal',
      points: 25,
      color: '#CD7F32',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      name: 'Silver Medal',
      points: 35,
      color: '#C0C0C0',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    {
      name: 'Gold Medal',
      points: 50,
      color: '#FFD700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
  ];

  // General Rules
  const generalRules = [
    {
      icon: Clock,
      title: 'Time Limits',
      content: 'Most performances are limited to 2-4 minutes. Production numbers may be up to 6 minutes.',
    },
    {
      icon: Music,
      title: 'Music Submission',
      content: 'All music must be submitted at least 2 weeks prior to the competition. Clean, edited versions required.',
    },
    {
      icon: Shirt,
      title: 'Costume Requirements',
      content: 'Costumes should be age-appropriate and suitable for family audiences. No explicit content.',
    },
    {
      icon: Camera,
      title: 'Photo & Video Policy',
      content: 'Professional photography and videography by TOPAZ only. Personal photos allowed from designated areas.',
    },
    {
      icon: Target,
      title: 'Code of Conduct',
      content: 'Respectful behavior expected from all participants, parents, and instructors. Unsportsmanlike conduct may result in disqualification.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
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

        <div className="relative w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center z-10 pt-20">
          <p className="hero-animate font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            Standards of Excellence
          </p>
          <h1 className="hero-animate font-display font-black text-5xl sm:text-6xl lg:text-8xl text-white mb-8 tracking-tighter uppercase leading-[0.9]">
            Rules & <span className="text-primary italic border-b-4 border-primary pb-2">Regulations</span>
          </h1>
          <p className="hero-animate text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Ensuring a professional and fair environment for every performer
          </p>
          <div className="hero-animate flex flex-wrap justify-center gap-6">
          <a
              href={`${import.meta.env.BASE_URL}pdfs/topaz-rules.pdf`}
              download="TOPAZ_Rules_2026.pdf"
              className="btn-primary !px-10 !py-4"
          >
              <Download className="w-5 h-5 flex-shrink-0" />
              Download Full Rules (PDF)
          </a>
          </div>
        </div>
      </section>

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-[80px] z-40 glass border-b border-gray-100 shadow-sm overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-24 lg:py-40 relative">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mb-24">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              Competition <span className="text-primary italic">Categories</span>
          </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed">
              We offer a diverse range of categories designed to showcase every 
              style and skill level. From classical ballet to high-energy hip hop.
            </p>
          </div>

          {/* Performing Arts */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="section-animate font-display font-bold text-2xl text-[#0a0a0a] uppercase tracking-wider">
                Performing Arts
            </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {performingArtsCategories.map((category) => (
                <div key={category.name} className="section-animate h-full">
                  <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-premium hover:shadow-2xl transition-all duration-500">
                  <CategoryCard {...category} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Variety Arts */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="section-animate font-display font-bold text-2xl text-[#0a0a0a] uppercase tracking-wider">
                Variety Arts
            </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {varietyArtsCategories.map((category) => (
                <div key={category.name} className="section-animate h-full">
                  <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-premium hover:shadow-2xl transition-all duration-500">
                  <CategoryCard {...category} variant="variety" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Categories */}
          <div className="bg-[#0a0a0a] rounded-[3rem] p-12 lg:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[100px] pointer-events-none" />
            
            <div className="section-animate glass-dark border-none rounded-3xl p-8 mb-16 flex items-start gap-6">
              <AlertTriangle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div>
                <p className="text-white text-xl font-bold mb-2">Participation Recognition Only</p>
                <p className="text-white/60 leading-relaxed">
                  Special categories are designed for showcase and feedback. 
                  They are not eligible for placement awards or medals.
              </p>
            </div>
            </div>

            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="section-animate font-display font-bold text-2xl text-white uppercase tracking-wider">
              Special Categories
            </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialCategories.map((category) => (
                <div key={category.name} className="section-animate h-full">
                  <div className="h-full glass-dark border-white/5 rounded-3xl shadow-2xl p-8">
                  <CategoryCard {...category} variant="special" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Age Divisions */}
      <section ref={ageRef} className="py-24 lg:py-40 bg-[#fcfcfc] border-y border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              Age <span className="text-primary italic">Divisions</span>
          </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed">
              To ensure fair competition, performers are grouped by age. 
              Our divisions cater to everyone from preschoolers to adults.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {ageDivisions.map((division) => (
              <div
                key={division.name}
                className={`section-animate group bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-premium hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
              >
                <div className={`w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center transition-all duration-500 ${division.color.split(' ')[0]} group-hover:scale-110`}>
                  <division.icon className="w-10 h-10" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-2">
                  {division.name}
                </h3>
                <p className="text-primary font-mono font-bold tracking-widest uppercase text-sm">{division.age}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ability Levels */}
      <section ref={abilityRef} className="py-24 lg:py-40">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              Ability <span className="text-primary italic">Levels</span>
          </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed">
              We provide levels that match your training experience, ensuring 
              you compete against others with similar technical backgrounds.
          </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {abilityLevels.map((level) => (
              <div
                key={level.name}
                className={`section-animate group p-12 rounded-[2.5rem] text-center border-2 border-transparent hover:border-primary/10 shadow-premium hover:shadow-2xl transition-all duration-700 ${level.color}`}
              >
                <div className="flex justify-center gap-2 mb-8">
                  {Array.from({ length: level.stars }).map((_, i) => (
                    <Star key={i} className="w-8 h-8 fill-current group-hover:scale-110 transition-transform duration-500" style={{ transitionDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <h3 className="font-display font-black text-3xl mb-4 uppercase tracking-tighter">
                  {level.name}
                </h3>
                <div className="w-12 h-1 bg-current mx-auto mb-6 opacity-30" />
                <p className="text-lg font-medium opacity-80 leading-relaxed">{level.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Division Types */}
      <section ref={divisionRef} className="py-24 lg:py-40 bg-[#0a0a0a] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-8 leading-[1.1]">
              Division <span className="text-primary italic">Types</span>
          </h2>
            <p className="section-animate text-lg text-white/50 leading-relaxed">
              From intimate solos to grand-scale productions, find the perfect 
              format for your choreography.
          </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {divisionTypes.map((type) => (
              <div
                key={type.name}
                className="section-animate group text-center"
              >
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary group-hover:border-primary transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <type.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-primary transition-colors">
                  {type.name}
                </h3>
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest">{type.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section ref={scoringRef} className="py-24 lg:py-40 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              Scoring <span className="text-primary italic">System</span>
          </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed">
              Our comprehensive evaluation framework ensures transparency and 
              constructive feedback for every performance.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] p-12 lg:p-24 shadow-premium border border-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              {/* Scoring Categories */}
              <div>
                <h3 className="font-display font-black text-3xl text-[#0a0a0a] mb-12 uppercase tracking-tight">
                  Evaluation <span className="text-primary">Criteria</span>
                </h3>
                <div className="space-y-10">
                  {scoringCategories.map((category) => (
                    <div key={category.name} className="section-animate group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                          {category.name}
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {category.points} PTS
                        </span>
                      </div>
                      <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                        <div
                          className={`h-full ${category.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Score */}
              <div className="relative group">
                <div className="absolute inset-0 bg-primary opacity-5 rounded-[2.5rem] blur-2xl group-hover:opacity-10 transition-opacity duration-500" />
                <div className="relative flex flex-col justify-center items-center bg-[#fcfcfc] border border-gray-100 rounded-[2.5rem] p-16 shadow-inner text-center">
                  <span className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-6">Total Performance Value</span>
                  <div className="relative inline-block mb-6">
                    <span className="font-display font-black text-8xl lg:text-9xl text-[#0a0a0a] tracking-tighter">
                  100
                </span>
                    <div className="absolute -bottom-2 left-0 w-full h-4 bg-primary/20 -rotate-2 -z-10" />
                  </div>
                  <span className="text-primary font-mono font-black text-2xl tracking-[0.2em] uppercase">Points</span>
                  <p className="text-gray-500 text-sm mt-10 max-w-xs leading-relaxed italic">
                    "Precision meets artistry. Decimals are used for professional-grade accuracy."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medal Program */}
      <section ref={medalRef} className="py-24 lg:py-40 bg-[#fcfcfc] border-y border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              Medal <span className="text-primary italic">Program</span>
          </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed mb-8">
              Celebrate your journey. Earn prestigious medals as you accumulate 
              points throughout the competition season.
            </p>
            <div className="section-animate inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl text-primary font-bold text-sm uppercase tracking-widest">
              <Award className="w-5 h-5" />
              Cumulative Achievement Rewards
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {medalTiers.map((tier) => (
              <div
                key={tier.name}
                className={`section-animate group relative ${tier.bgColor} ${tier.borderColor} border-2 rounded-[3rem] p-16 text-center shadow-premium hover:shadow-2xl transition-all duration-700 h-full`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
                  <Award className="w-full h-full" style={{ color: tier.color }} />
                </div>
                
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundColor: tier.color }}
                >
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h3
                  className="font-display font-black text-3xl mb-4 uppercase tracking-tighter"
                  style={{ color: tier.color }}
                >
                  {tier.name}
                </h3>
                <div className="w-12 h-1 bg-current mx-auto mb-10 opacity-30" style={{ color: tier.color }} />
                <p className="text-6xl font-display font-black text-[#0a0a0a] mb-2 tracking-tighter">
                  {tier.points}
                </p>
                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Target Points</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Rules */}
      <section ref={generalRef} className="py-24 lg:py-40 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="max-w-3xl mb-24">
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] mb-8 leading-[1.1]">
              General <span className="text-primary italic">Guidelines</span>
          </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed">
              Standard operating procedures to ensure every TOPAZ event runs 
              smoothly, safely, and professionally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {generalRules.map((rule) => (
              <div
                key={rule.title}
                className="section-animate group bg-white border border-gray-50 rounded-3xl p-10 flex flex-col sm:flex-row gap-8 shadow-premium hover:shadow-xl transition-all duration-500"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <rule.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-4 uppercase tracking-tight">
                    {rule.title}
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium opacity-80 group-hover:text-gray-700 transition-colors">
                    {rule.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="download" className="py-32 lg:py-48 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[150px] pointer-events-none" />
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display font-black text-4xl lg:text-6xl text-white mb-8 tracking-tighter uppercase leading-[0.9]">
            Need a <span className="text-primary italic underline decoration-4 underline-offset-8">Physical Copy</span>?
          </h2>
          <p className="text-white/50 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Download the complete rules portfolio to share with your studio 
            directors, team members, or instructors.
          </p>
          <a
            href={`${import.meta.env.BASE_URL}pdfs/topaz-rules.pdf`}
            download="TOPAZ_Rules_2026.pdf"
            className="btn-primary !px-12 !py-5 text-lg shadow-2xl shadow-primary/40"
          >
            <Download className="w-6 h-6 flex-shrink-0" />
            Download Rules PDF
          </a>
        </div>
      </section>
    </div>
  );
};

export default Rules;
