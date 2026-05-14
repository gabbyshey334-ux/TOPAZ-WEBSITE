import { useState, useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Download, 
  FileText, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CompetitionRegistrationForm from '@/components/registration/CompetitionRegistrationForm';
import { siteContentText, siteContentUrl, faqListFromSiteContentJson, REGISTRATION_PAGE_FAQ_DEFAULTS } from '@/constants/siteContentDefaults';
import { useSiteContentMap } from '@/contexts/SiteContentContext';

gsap.registerPlugin(ScrollTrigger);

const Registration = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const siteContent = useSiteContentMap();

  const heroRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const registrationHeroBg = siteContentUrl(siteContent, 'registration_hero_background');
  const supportEmail = siteContentText(siteContent, 'contact_email');
  const supportPhone = siteContentText(siteContent, 'contact_phone');
  const supportPhoneDigits = supportPhone.replace(/\D/g, '');

  const faqs = useMemo(
    () => faqListFromSiteContentJson(siteContent, 'registration_faq_json', REGISTRATION_PAGE_FAQ_DEFAULTS),
    [siteContent],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const heroElements = heroRef.current?.querySelectorAll('.hero-animate');
      if (heroElements && heroElements.length > 0) {
        gsap.fromTo(
          heroElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
          }
        );
      }

      // Steps Animation
      const stepCards = stepsRef.current?.querySelectorAll('.step-card');
      if (stepCards && stepCards.length > 0) {
        gsap.fromTo(
          stepCards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Info Cards Animation
      const infoCards = infoRef.current?.querySelectorAll('.info-card');
      if (infoCards && infoCards.length > 0) {
        gsap.fromTo(
          infoCards,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: infoRef.current,
              start: 'top 75%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      
      {/* SECTION 1: HERO */}
      <section ref={heroRef} className="relative bg-[#0a0a0a] min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Modern Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${registrationHeroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />
          {/* Decorative glow */}
          <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#2E75B6]/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#2E75B6]/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
          <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-[#2E75B6]" />
            <span className="text-xs font-bold tracking-widest text-white uppercase">
              {siteContentText(siteContent, 'registration_hero_badge')}
            </span>
          </div>
          
          <h1 className="hero-animate font-display font-black text-5xl sm:text-6xl md:text-8xl lg:text-[9rem] text-white leading-[0.85] tracking-tighter uppercase mb-8 break-words">
            {siteContentText(siteContent, 'registration_hero_title_line1')} <br/>
            <span className="text-[#2E75B6] italic relative inline-block">
              {siteContentText(siteContent, 'registration_hero_title_accent')}
              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#2E75B6]/30 -rotate-2" />
            </span>
          </h1>
          
          <p className="hero-animate text-xl md:text-2xl text-white/70 max-w-2xl font-medium leading-relaxed mb-12">
            {siteContentText(siteContent, 'registration_hero_subtitle')}
            <span className="block text-base text-white/50 mt-2 font-normal">
              {siteContentText(siteContent, 'registration_hero_location_line')}
            </span>
          </p>

          <div className="hero-animate flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#2E75B6] text-white font-bold rounded-full hover:bg-white hover:text-[#0a0a0a] transition-all duration-300 shadow-[0_0_40px_-10px_rgba(46,117,182,0.5)] text-lg w-full sm:w-auto"
            >
              {siteContentText(siteContent, 'registration_hero_primary_btn')}
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              to="/registration-form"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-full hover:bg-white/10 transition-all duration-300 text-lg w-full sm:w-auto backdrop-blur-sm"
            >
              <Download className="w-5 h-5" />
              {siteContentText(siteContent, 'registration_hero_secondary_btn')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[10px] font-bold tracking-widest text-white uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-white" />
        </div>
      </section>

      {/* SECTION 2: IMPORTANT ALERTS */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Deadline Alert */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-start gap-5">
            <div className="bg-red-50 p-4 rounded-2xl shrink-0">
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#0a0a0a] mb-2 uppercase tracking-tight">
                {siteContentText(siteContent, 'registration_alert_window_title')}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                {siteContentText(siteContent, 'registration_alert_window_body')}
              </p>
            </div>
          </div>
          
          {/* Notice Alert */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-start gap-5">
            <div className="bg-amber-50 p-4 rounded-2xl shrink-0">
              <MapPin className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#0a0a0a] mb-2 uppercase tracking-tight">
                {siteContentText(siteContent, 'registration_alert_mail_title')}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {siteContentText(siteContent, 'registration_alert_mail_body')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section ref={stepsRef} className="py-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display font-black text-4xl md:text-5xl text-[#0a0a0a] mb-6 uppercase tracking-tighter break-words">
              {siteContentText(siteContent, 'registration_process_heading_main')}
              <span className="text-[#2E75B6]">{siteContentText(siteContent, 'registration_process_heading_accent')}</span>
            </h2>
            <p className="text-lg text-gray-500 font-medium">
              {siteContentText(siteContent, 'registration_process_subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Step 1 */}
            <div className="step-card relative bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-6 -right-6 text-[8rem] font-black text-gray-50 leading-none select-none z-0 group-hover:text-[#2E75B6]/5 transition-colors duration-500">1</div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2E75B6] group-hover:text-white transition-colors duration-300 text-[#0a0a0a]">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-4 uppercase tracking-tight">
                  {siteContentText(siteContent, 'registration_step1_title')}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {siteContentText(siteContent, 'registration_step1_body')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card relative bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-6 -right-6 text-[8rem] font-black text-gray-50 leading-none select-none z-0 group-hover:text-[#2E75B6]/5 transition-colors duration-500">2</div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2E75B6] group-hover:text-white transition-colors duration-300 text-[#0a0a0a]">
                  <Download className="w-10 h-10" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-4 uppercase tracking-tight">
                  {siteContentText(siteContent, 'registration_step2_title')}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {siteContentText(siteContent, 'registration_step2_body')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card relative bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-6 -right-6 text-[8rem] font-black text-gray-50 leading-none select-none z-0 group-hover:text-[#2E75B6]/5 transition-colors duration-500">3</div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2E75B6] group-hover:text-white transition-colors duration-300 text-[#0a0a0a]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-4 uppercase tracking-tight">
                  {siteContentText(siteContent, 'registration_step3_title')}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {siteContentText(siteContent, 'registration_step3_body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE FORM */}
      <section id="register" className="py-24 bg-white border-y border-gray-100 scroll-mt-20 relative">
        <div className="absolute inset-0 bg-[#fafafa]/50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl text-[#0a0a0a] mb-4 uppercase tracking-tighter break-words">
              Online <span className="text-[#2E75B6]">Registration</span>
            </h2>
            <p className="text-gray-500 font-medium">Please fill out all required fields carefully.</p>
          </div>
          
          <CompetitionRegistrationForm />
        </div>
      </section>

      {/* SECTION 5: DETAILS & FEES */}
      <section ref={infoRef} className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Left Column: Requirements */}
            <div className="info-card">
              <h3 className="font-display font-black text-3xl text-[#0a0a0a] mb-8 uppercase tracking-tight flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                What You'll Need
              </h3>
              
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100">
                <ul className="space-y-6">
                  {[
                    'Completed online registration form or PDF',
                    'Performance music: MP3 upload, or USB (due first thing in the morning on competition day)',
                    'Payment (check, money order, Zelle, or cash)',
                    'Parent or teacher signature (for minors)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-gray-700 font-medium text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Entry Fees */}
            <div className="info-card">
              <h3 className="font-display font-black text-3xl text-[#0a0a0a] mb-8 uppercase tracking-tight flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                Entry Fees
              </h3>

              <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100">
                <ul className="space-y-5 mb-8">
                  {[
                    { label: 'Solo', price: '$100', note: 'per entry' },
                    { label: 'Duo', price: '$80', note: 'per person ($160 total)' },
                    { label: 'Trio', price: '$70', note: 'per person ($210 total)' },
                    { label: 'Small Group (4-10)', price: '$60', note: 'per person' },
                    { label: 'Large Group (11+)', price: '$60', note: 'per person' },
                    { label: 'Production', price: '$60', note: 'per person' },
                  ].map((item, i) => (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <span className="text-gray-900 font-bold text-lg">{item.label}</span>
                      <div className="text-right">
                        <span className="font-black text-xl text-[#2E75B6]">{item.price}</span>
                        <span className="text-sm font-medium text-gray-500 ml-2">{item.note}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    Important Note
                  </p>
                  <p className="text-sm text-gray-500 mt-2 font-medium">
                    Duo, trio, and groups are priced per person unless noted. Solo is priced per entry.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDION */}
      <section className="py-32 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl text-[#0a0a0a] mb-6 uppercase tracking-tighter break-words">
              Common <span className="text-[#2E75B6]">Questions</span>
            </h2>
            <p className="text-lg text-gray-500 font-medium">Everything you need to know about registration.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#fafafa] rounded-[1.5rem] overflow-hidden border border-gray-100 transition-all duration-300 hover:border-gray-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 sm:px-8 py-6 flex items-center justify-between gap-4 text-left"
                >
                  <span className="flex-1 min-w-0 text-base sm:text-lg font-bold text-[#0a0a0a] break-words">
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${openFaq === index ? 'bg-[#0a0a0a] text-white rotate-180' : 'bg-white border border-gray-200 text-gray-500'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 sm:px-8 pb-8 text-gray-500 font-medium leading-relaxed break-words">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CONTACT SUPPORT */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#0a0a0a] rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Decorative BG elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2E75B6]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2E75B6]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="font-display font-black text-4xl mb-6 uppercase tracking-tight">Need Assistance?</h2>
              <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto font-medium">
                Our support team is ready to help you with the registration process. We typically respond within 24 hours.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6">
                <a href={`mailto:${supportEmail}`} className="group flex min-w-0 items-center justify-center gap-3 bg-white/5 border border-white/10 px-6 sm:px-8 py-4 rounded-full backdrop-blur-sm hover:bg-white hover:text-[#0a0a0a] transition-all duration-300 w-full sm:w-auto max-w-full">
                  <Mail className="w-5 h-5 shrink-0 group-hover:text-[#2E75B6] transition-colors" />
                  <span className="min-w-0 font-bold tracking-wide text-sm break-all">{supportEmail}</span>
                </a>
                <a href={`tel:${supportPhoneDigits}`} className="group flex min-w-0 items-center justify-center gap-3 bg-white/5 border border-white/10 px-6 sm:px-8 py-4 rounded-full backdrop-blur-sm hover:bg-white hover:text-[#0a0a0a] transition-all duration-300 w-full sm:w-auto max-w-full">
                  <Phone className="w-5 h-5 shrink-0 group-hover:text-[#2E75B6] transition-colors" />
                  <span className="min-w-0 font-bold tracking-wide text-sm break-all">{supportPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Registration;
