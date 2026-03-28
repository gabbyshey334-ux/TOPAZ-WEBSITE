import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
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
  Shirt,
  Camera,
  AlertTriangle,
  Mic2,
  ShieldCheck,
  Trophy,
  Info,
  Medal,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PERFORMING_ARTS = [
  {
    name: 'Tap',
    text: 'Strictly tap technique. No props, acrobatics, or vocal.',
    icon: Music,
  },
  {
    name: 'Ballet',
    text: 'Strictly classical Ballet/Pointe. No props, acrobatics, or vocal.',
    icon: Star,
  },
  {
    name: 'Jazz',
    text: 'Strictly jazz. No props, acrobatics, or vocal.',
    icon: Sparkles,
  },
  {
    name: 'Lyrical/Contemporary',
    text: 'Interpretive dance using lyrics and musicality; floor work and rolls allowed. No acrobatics, prop, or vocal.',
    icon: Users,
  },
  {
    name: 'Vocal',
    text: 'Strictly vocal—no dance choreography. Chairs or stools allowed; microphone provided.',
    icon: Mic2,
  },
  {
    name: 'Acting',
    text: 'Strictly acting—no dance choreography. Poems, monologues, and readings allowed within time limits; props allowed.',
    icon: User,
  },
  {
    name: 'Hip Hop',
    text: 'No acro, floor work, or props. May include Street Funk, Break Dancing, Pop & Lock.',
    icon: Users,
  },
] as const;

const VARIETY_ARTS = [
  {
    name: 'Variety A',
    subtitle: 'Song & Dance / Character',
    text: 'Can-Cans, Charlestons, Hawaiian, folk dance, song and dance, or any combination of performing arts. No props or acrobatics.',
    icon: Sparkles,
  },
  {
    name: 'Variety B',
    subtitle: 'Dance With Props',
    text: 'Any style of dance with a prop; the prop must be essential. No acrobatics.',
    icon: Trophy,
  },
  {
    name: 'Variety C',
    subtitle: 'Dance With Acrobatics',
    text: 'Any style of dance with acrobatics or supported lifts; judged on both dance and acrobatic skills. No props.',
    icon: ShieldCheck,
  },
  {
    name: 'Variety D',
    subtitle: 'Dance With Acrobatics & Prop',
    text: 'Any style of dance and acrobatics with a prop; prop and acrobatics must be essential.',
    icon: Star,
  },
  {
    name: 'Variety E',
    subtitle: 'Hip Hop',
    text: 'Street dance incorporating Hip Hop, Pop & Lock, and Break Dance choreography—including acro, props, and floor work.',
    icon: Users,
  },
  {
    name: 'Variety F',
    subtitle: 'Ballroom',
    text: 'Couples or groups of couples only; age and ability levels apply. Lifts, gymnastics, props, and all forms of Ballroom allowed.',
    icon: UserCircle,
  },
  {
    name: 'Variety G',
    subtitle: 'Line Dancing',
    text: 'Must include at least 3 contestants; age and ability levels apply. Props and gymnastics allowed.',
    icon: Users,
  },
] as const;

const SPECIAL_CATEGORIES = [
  {
    name: 'Production',
    badge: 'Not eligible for high scoring awards',
    text: 'Anything goes—any combination of TOPAZ categories; musicals in miniature or themed production numbers. At least 10 participants; must run 5–8 minutes. Props allowed; set-up time limited to 3 minutes.',
  },
  {
    name: 'Student Choreography',
    badge: 'Not eligible for high scoring awards',
    text: 'Must be 100% student choreography with no teacher help. Advanced students age 13 and up only. Fees based on section entered.',
  },
  {
    name: 'Teacher/Student',
    badge: 'Not eligible for high scoring awards',
    text: 'Must include a teacher performing with a student or students. No age group, ability level, or designated category. Teachers may also enter solos. Fees based on section entered.',
  },
] as const;

const AGE_DIVISIONS = [
  { name: 'Junior Division', lines: ['Ages 3–7 years', 'Ages 8–12 years'], icon: Baby },
  { name: 'Senior Division', lines: ['Ages 13–18 years', '19 and up'], icon: Crown },
] as const;

const ABILITY_LEVELS = [
  {
    name: 'Beginning',
    text: '2 years or less of training.',
    stars: 1,
    color: 'from-sky-50 to-sky-100 text-sky-800 border-sky-200 hover:border-sky-300 shadow-sky-200/50',
    iconColor: 'text-sky-500',
  },
  {
    name: 'Intermediate',
    text: '3 through 4 years of training.',
    stars: 2,
    color: 'from-blue-50 to-blue-100 text-blue-800 border-blue-200 hover:border-blue-300 shadow-blue-200/50',
    iconColor: 'text-blue-500',
  },
  {
    name: 'Advanced',
    text: 'Starting 5th year or more of training.',
    stars: 3,
    color: 'from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200 hover:border-indigo-300 shadow-indigo-200/50',
    iconColor: 'text-indigo-500',
  },
] as const;

const GROUP_ENTRIES = [
  { name: 'Solo', detail: 'Single contestant', time: '2½ min limit' },
  { name: 'Duo', detail: 'Two contestants', time: '2½ min limit' },
  { name: 'Trio', detail: 'Three contestants', time: '3 min limit' },
  { name: 'Small Group', detail: '4–10 contestants', time: '3 min limit' },
  { name: 'Large Group', detail: '11+ contestants', time: '3½ min limit' },
  { name: 'Production', detail: '10+ contestants', time: '8 min limit' },
] as const;

const ENTRY_FEES = [
  { label: 'Solo', amount: '$100' },
  { label: 'Duo', amount: '$80 / person' },
  { label: 'Trio', amount: '$70 / person' },
  { label: 'Small Group', amount: '$60 / person' },
  { label: 'Large Group', amount: '$60 / person' },
  { label: 'Production', amount: '$60 / person' },
] as const;

const SCORING_CRITERIA = [
  { name: 'Technique', points: 25, color: 'bg-blue-500' },
  { name: 'Creativity & Choreography', points: 25, color: 'bg-indigo-500' },
  { name: 'Presentation', points: 25, color: 'bg-sky-500' },
  { name: 'Appearance & Costume', points: 25, color: 'bg-teal-500' },
] as const;

const OTHER_RULES = [
  {
    icon: Mic2,
    title: 'Music',
    content:
      'A USB drive with music recorded at the correct tempo is required. Each entry must be on a separate USB; a backup USB is recommended. Music must be turned in one hour before scheduled competition time.',
  },
  {
    icon: Shirt,
    title: 'Costume Changes',
    content:
      'Students may enter as many numbers as they like but must change within 10 minutes (approximately 3 numbers). Judges can deduct points for excessive delay.',
  },
  {
    icon: Camera,
    title: 'Video Recording',
    content: 'You may only video your own contestants; do not block the view of others.',
  },
  {
    icon: Users,
    title: 'Admission',
    content: 'TOPAZ competitions never have an admission charge.',
  },
  {
    icon: Award,
    title: 'Sportsmanship',
    content: 'Poor behavior will not be tolerated and can result in disqualification.',
  },
  {
    icon: AlertTriangle,
    title: 'Food & Beverage',
    content:
      'No food in dressing rooms or the audience area; bottled water allowed. No outside food may be brought into the venue.',
  },
] as const;

const Rules = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const abilityRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const scoringRef = useRef<HTMLDivElement>(null);
  const medalRef = useRef<HTMLDivElement>(null);
  const generalRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'age', label: 'Age Divisions' },
    { id: 'ability', label: 'Ability Levels' },
    { id: 'entries', label: 'Entries & Fees' },
    { id: 'scoring', label: 'Judging & Awards' },
    { id: 'medal', label: 'Medal Program' },
    { id: 'general', label: 'Other Rules' },
  ] as const;

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const sectionMap: Record<string, RefObject<HTMLDivElement | null>> = {
      categories: categoriesRef,
      age: ageRef,
      ability: abilityRef,
      entries: entriesRef,
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
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
          }
        );
      }

      const sections = [
        categoriesRef,
        ageRef,
        abilityRef,
        entriesRef,
        scoringRef,
        medalRef,
        generalRef,
      ];

      sections.forEach((ref) => {
        const elements = ref.current?.querySelectorAll('.section-animate');
        if (elements && elements.length > 0) {
          gsap.fromTo(
            elements,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                start: 'top 80%',
              },
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const pdfHref = `${import.meta.env.BASE_URL}pdfs/topaz-rules.pdf`;

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-[#2E75B6] selection:text-white">
      {/* Hero Banner */}
      <section
        ref={heroRef}
        className="relative bg-[#0a0a0a] min-h-[85vh] overflow-hidden flex items-center justify-center pt-20"
      >
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop"
            className="w-full h-full object-cover grayscale mix-blend-overlay"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2E75B6]/20 to-transparent mix-blend-color-dodge" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
          <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <ShieldCheck className="w-4 h-4 text-[#2E75B6]" />
            <span className="font-mono text-white/80 text-xs font-bold tracking-[0.2em] uppercase">
              Standards of Excellence
            </span>
          </div>
          <h1 className="hero-animate font-display font-black text-6xl sm:text-7xl lg:text-[8rem] text-white mb-6 tracking-tighter uppercase leading-[0.85]">
            Rules & <span className="text-[#2E75B6] italic relative">
              Regulations
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#2E75B6]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
              </svg>
            </span>
          </h1>
          <p className="hero-animate text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Official TOPAZ 2.0 competition rules—categories, divisions, scoring, and policies ensuring a professional environment.
          </p>
          <div className="hero-animate flex flex-wrap justify-center gap-4">
            <a href={pdfHref} download="TOPAZ_Rules_2026.pdf" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#2E75B6] border border-transparent rounded-full hover:bg-transparent hover:border-[#2E75B6] hover:text-[#2E75B6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E75B6]">
              <Download className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
              Download Rules PDF
            </a>
          </div>
        </div>
      </section>

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeTab === tab.id
                    ? 'bg-[#2E75B6] border-[#2E75B6] text-white shadow-lg shadow-[#2E75B6]/25 transform scale-105'
                    : 'bg-transparent border-gray-200 text-gray-500 hover:border-[#2E75B6]/50 hover:text-[#2E75B6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section ref={categoriesRef} className="py-24 lg:py-32 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-50 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mb-16 lg:mb-24">
            <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">01. The Styles</p>
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] leading-[1.1] mb-6">
              Competition <span className="text-[#2E75B6] italic relative">Categories<div className="absolute -bottom-2 left-0 w-full h-2 bg-[#2E75B6]/20 rounded-full" /></span>
            </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed font-medium">
              Explore the diverse range of styles offered at TOPAZ 2.0. Performing Arts categories are eligible for high scoring awards.
            </p>
          </div>

          {/* Performing Arts */}
          <div className="mb-20 lg:mb-28">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E75B6] to-[#1F4E78] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="section-animate font-display font-black text-2xl lg:text-3xl text-[#0a0a0a] uppercase tracking-wide">
                  Performing Arts
                </h3>
                <p className="text-sm font-bold text-[#2E75B6] tracking-wide uppercase mt-1">Eligible for high scoring awards</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {PERFORMING_ARTS.map((cat) => (
                <div
                  key={cat.name}
                  className="section-animate group relative bg-white border border-gray-100 rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2E75B6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-[#2E75B6] transition-colors duration-300">
                    <cat.icon className="w-6 h-6 text-[#2E75B6] group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-display font-black text-xl text-[#0a0a0a] tracking-tight mb-3 group-hover:text-[#2E75B6] transition-colors">{cat.name}</h4>
                  <p className="text-gray-500 leading-relaxed text-sm font-medium">{cat.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Variety Arts */}
          <div className="mb-20 lg:mb-28">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="section-animate font-display font-black text-2xl lg:text-3xl text-[#0a0a0a] uppercase tracking-wide">
                Variety Arts
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VARIETY_ARTS.map((v) => (
                <div
                  key={v.name}
                  className="section-animate group relative bg-[#fcfcfc] border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-display font-black text-xl text-[#0a0a0a] mb-1">{v.name}</h4>
                      <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{v.subtitle}</span>
                    </div>
                    <v.icon className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-gray-500 leading-relaxed text-sm font-medium mt-4">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Special Categories */}
          <div className="bg-[#0a0a0a] rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#2E75B6]/10 to-transparent opacity-50" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2E75B6]/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20">
              <div className="lg:w-1/3">
                <div className="section-animate inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 mb-8">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-amber-500 text-xs font-bold tracking-[0.15em] uppercase">
                    Participation Only
                  </span>
                </div>
                <h3 className="section-animate font-display font-black text-3xl lg:text-4xl text-white uppercase tracking-tight mb-6">
                  Special <br/><span className="text-[#2E75B6]">Categories</span>
                </h3>
                <p className="section-animate text-white/60 leading-relaxed text-lg">
                  Designed for showcase and creativity, these categories are not eligible for high scoring awards.
                </p>
              </div>

              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {SPECIAL_CATEGORIES.map((s) => (
                  <div
                    key={s.name}
                    className="section-animate rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:bg-white/10 transition-colors"
                  >
                    <h4 className="font-display font-bold text-xl text-white mb-3">{s.name}</h4>
                    <p className="text-white/60 leading-relaxed text-sm">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age Divisions & Ability Levels */}
      <section className="py-24 lg:py-32 bg-[#f8fafc] border-y border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          
          {/* Age Divisions */}
          <div ref={ageRef} className="mb-24 lg:mb-32">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">02. Demographics</p>
              <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] leading-[1.1] mb-6">
                Age <span className="text-[#2E75B6] italic">Divisions</span>
              </h2>
              <p className="section-animate text-lg text-gray-500 leading-relaxed">
                For fair competition, groups are entered by the <strong className="text-[#0a0a0a] bg-[#2E75B6]/10 px-2 py-0.5 rounded">oldest</strong> entry age at the time of competition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {AGE_DIVISIONS.map((d) => (
                <div
                  key={d.name}
                  className="section-animate group flex items-center gap-8 bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:border-[#2E75B6]/20 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-full bg-[#f8fafc] border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2E75B6] group-hover:border-[#2E75B6] transition-colors duration-500">
                    <d.icon className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-2">{d.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {d.lines.map((line) => (
                        <span key={line} className="inline-flex px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-bold rounded-md uppercase tracking-wider">
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ability Levels */}
          <div ref={abilityRef}>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">03. Skill Tiers</p>
              <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] leading-[1.1] mb-6">
                Ability <span className="text-[#2E75B6] italic">Levels</span>
              </h2>
              <p className="section-animate text-lg text-gray-500 leading-relaxed">
                Enter according to the <strong className="text-[#0a0a0a]">highest</strong> level of training. Group entries follow the <strong className="text-[#0a0a0a]">most experienced</strong> participant—no averaging.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ABILITY_LEVELS.map((level) => (
                <div
                  key={level.name}
                  className={`section-animate group relative bg-gradient-to-br ${level.color} border-2 rounded-[2.5rem] p-10 text-center transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex justify-center gap-1 mb-6">
                      {Array.from({ length: level.stars }).map((_, i) => (
                        <Star key={i} className={`w-8 h-8 fill-current ${level.iconColor} drop-shadow-sm group-hover:scale-110 transition-transform`} style={{ transitionDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                    <h3 className="font-display font-black text-3xl mb-4 tracking-tight">{level.name}</h3>
                    <p className="text-[15px] font-medium leading-relaxed opacity-90">{level.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Entries & Fees */}
      <section ref={entriesRef} className="py-24 lg:py-32 bg-white relative">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">04. Logistics</p>
              <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] leading-[1.1] mb-6">
                Group Size, <br/><span className="text-[#2E75B6] italic">Limits & Fees</span>
              </h2>
              <p className="section-animate text-lg text-gray-500 leading-relaxed mb-8">
                Strict adherence to time limits ensures a smooth schedule. Entrances and exits must not exceed 10 seconds. Points will be deducted for overtime performances.
              </p>
              <div className="section-animate hidden lg:flex items-center gap-4 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                <Info className="w-8 h-8 text-[#2E75B6] flex-shrink-0" />
                <p className="text-sm font-medium text-gray-600">All fees are calculated per person for group routines. Registration is subject to availability.</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#0a0a0a] rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 pb-4 mb-6">
                  <div className="col-span-5 sm:col-span-4">
                    <span className="font-mono text-white/40 text-xs font-bold uppercase tracking-widest">Entry Type</span>
                  </div>
                  <div className="col-span-4 sm:col-span-4 hidden sm:block">
                    <span className="font-mono text-white/40 text-xs font-bold uppercase tracking-widest">Time Limit</span>
                  </div>
                  <div className="col-span-7 sm:col-span-4 text-right">
                    <span className="font-mono text-[#2E75B6] text-xs font-bold uppercase tracking-widest">Fee (USD)</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="space-y-4">
                  {GROUP_ENTRIES.map((g, idx) => (
                    <div key={g.name} className="section-animate grid grid-cols-12 gap-4 items-center bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 hover:bg-white/10 hover:border-[#2E75B6]/30 transition-colors">
                      <div className="col-span-12 sm:col-span-4 flex flex-col">
                        <span className="font-display font-bold text-white text-lg">{g.name}</span>
                        <span className="text-white/40 text-xs">{g.detail}</span>
                      </div>
                      <div className="col-span-6 sm:col-span-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#2E75B6]" />
                        <span className="text-white/80 text-sm font-medium">{g.time}</span>
                      </div>
                      <div className="col-span-6 sm:col-span-4 text-right">
                        <span className="font-display font-black text-[#2E75B6] text-xl">{ENTRY_FEES[idx].amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Judging & Scoring */}
      <section ref={scoringRef} className="py-24 lg:py-32 bg-[#f8fafc] border-y border-gray-200 overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">05. Evaluation</p>
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] leading-[1.1] mb-6">
              Judging <span className="text-[#2E75B6] italic">& Awards</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            {/* Scoring Visual */}
            <div className="section-animate bg-white rounded-[3rem] p-10 lg:p-12 shadow-premium border border-gray-100">
              <div className="relative mb-12 text-center">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10rem] font-display font-black text-gray-50 select-none pointer-events-none -z-10 leading-none">100</span>
                <h3 className="font-display font-black text-3xl text-[#0a0a0a] tracking-tight">Maximum Points</h3>
                <p className="text-[#2E75B6] font-mono text-sm uppercase tracking-widest mt-2 font-bold">Per Judge</p>
              </div>

              <div className="space-y-6">
                {SCORING_CRITERIA.map((c) => (
                  <div key={c.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">{c.name}</span>
                      <span className="font-mono text-sm font-bold text-[#2E75B6] bg-blue-50 px-2 py-1 rounded">{c.points} PTS</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full ${c.color} w-full rounded-full transform origin-left group-hover:scale-x-[1.02] transition-transform`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Awards Text */}
            <div className="space-y-10">
              <div className="section-animate">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-3">Category Awards</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  1st, 2nd, 3rd, and 4th place trophy in each category. Ties are broken by judges, or occasionally stand as equal placements.
                </p>
              </div>
              
              <div className="section-animate">
                <div className="w-12 h-12 bg-[#2E75B6]/10 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-[#2E75B6]" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-3">High Scoring Awards</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  Given to the highest scores across all categories within <strong className="text-[#0a0a0a] bg-white border border-gray-200 px-1 rounded">12 divisions</strong>: (Junior/Senior × Beg/Int/Adv × Perf/Variety). Each division awards 1st–4th place trophies.
                </p>
              </div>

              <div className="section-animate">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Medal className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-3">Trophies & Ribbons</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  Winning <strong>solos</strong> receive a trophy. <strong>Duos/Trios</strong> receive 1 trophy + ribbons for all. <strong>Groups</strong> receive 1 trophy + ribbons for all. <strong>Production</strong> 1st place receives an award for every participant!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medal Program */}
      <section ref={medalRef} className="py-24 lg:py-32 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">06. Long-Term</p>
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] leading-[1.1] mb-6">
              TOPAZ <span className="text-[#2E75B6] italic">Medal Program</span>
            </h2>
            <p className="section-animate text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Compile points across competitions to earn prestigious medals. This program replaces expensive yearly finals requiring travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="section-animate group relative rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-amber-50/30 p-10 text-center shadow-premium hover:-translate-y-2 transition-all">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Medal className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h3 className="font-display font-black text-3xl text-amber-700 uppercase tracking-tight mb-2">Bronze</h3>
              <p className="text-gray-500 font-medium">First Milestone</p>
            </div>

            <div className="section-animate group relative rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-slate-50/50 p-10 text-center shadow-premium hover:-translate-y-2 transition-all transform md:-translate-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform">
                <Medal className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h3 className="font-display font-black text-3xl text-slate-700 uppercase tracking-tight mb-2">Silver</h3>
              <p className="text-gray-500 font-medium">Elite Achievement</p>
            </div>

            <div className="section-animate group relative rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-yellow-50/50 p-10 text-center shadow-premium hover:-translate-y-2 transition-all">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                <Medal className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h3 className="font-display font-black text-3xl text-yellow-600 uppercase tracking-tight mb-2">Gold</h3>
              <p className="text-gray-500 font-medium">Pinnacle Award</p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Rules */}
      <section ref={generalRef} className="py-24 lg:py-32 bg-[#0a0a0a] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="section-animate font-mono text-[#2E75B6] font-bold tracking-[0.2em] uppercase mb-4">07. Guidelines</p>
            <h2 className="section-animate font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              General <span className="text-[#2E75B6] italic">Policies</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OTHER_RULES.map((rule) => (
              <div
                key={rule.title}
                className="section-animate bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <rule.icon className="w-8 h-8 text-[#2E75B6] mb-5" />
                <h3 className="font-display font-bold text-xl text-white mb-3 tracking-wide">{rule.title}</h3>
                <p className="text-white/60 leading-relaxed text-[15px]">{rule.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="download" className="py-24 lg:py-32 bg-[#2E75B6] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?w=1600&h=900&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-6 uppercase leading-[1.1]">
            Need a <span className="italic font-light">Physical Copy</span>?
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Download the complete rules PDF to share with studio directors, team members, or instructors.
          </p>
          <a href={pdfHref} download="TOPAZ_Rules_2026.pdf" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#2E75B6] font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/90 hover:scale-105 transition-all shadow-xl shadow-black/10">
            <Download className="w-5 h-5" />
            Download Rules PDF
          </a>
        </div>
      </section>
    </div>
  );
};

export default Rules;
