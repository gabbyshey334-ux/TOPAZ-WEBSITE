import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Send,
  ChevronDown,
} from 'lucide-react';
import ContactForm from '../components/ContactForm';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { siteContentText, siteContentUrl, faqListFromSiteContentJson, CONTACT_PAGE_FAQ_DEFAULTS } from '@/constants/siteContentDefaults';
import { useSiteContentMap } from '@/contexts/SiteContentContext';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const siteContent = useSiteContentMap();

  const contactHeroBg = siteContentUrl(siteContent, 'contact_hero_background');
  const contactEmail = siteContentText(siteContent, 'contact_email');
  const contactPhone = siteContentText(siteContent, 'contact_phone');

  const contactMailAddress = siteContentText(siteContent, 'contact_mail_address');

  const contactInfo = useMemo(
    () => [
      {
        icon: Mail,
        title: siteContentText(siteContent, 'contact_card_email_title'),
        content: contactEmail,
        action: {
          label: siteContentText(siteContent, 'contact_card_email_action'),
          href: `mailto:${contactEmail}`,
        },
      },
      {
        icon: Phone,
        title: siteContentText(siteContent, 'contact_card_phone_title'),
        content: contactPhone,
        action: {
          label: siteContentText(siteContent, 'contact_card_phone_action'),
          href: `tel:${contactPhone.replace(/\D/g, '')}`,
        },
      },
      {
        icon: MapPin,
        title: siteContentText(siteContent, 'contact_card_mail_title'),
        content: contactMailAddress,
        action: {
          label: siteContentText(siteContent, 'contact_card_mail_action'),
          href: `https://maps.google.com/?q=${encodeURIComponent(contactMailAddress.replace(/\n/g, ' '))}`,
        },
      },
    ],
    [contactEmail, contactPhone, contactMailAddress, siteContent],
  );

  const faqs = useMemo(
    () => faqListFromSiteContentJson(siteContent, 'contact_faq_json', CONTACT_PAGE_FAQ_DEFAULTS),
    [siteContent],
  );

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

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      const infoElements = infoRef.current?.querySelectorAll('.info-card');
      if (infoElements && infoElements.length > 0) {
        gsap.fromTo(
          infoElements,
          { x: 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: infoRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      const faqElements = faqRef.current?.querySelectorAll('.faq-item');
      if (faqElements && faqElements.length > 0) {
        gsap.fromTo(
          faqElements,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: faqRef.current,
              start: 'top 75%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const socialLinks = useMemo(
    () => [
      { icon: Facebook, href: siteContentText(siteContent, 'footer_social_facebook_url'), label: 'Facebook' },
      { icon: Instagram, href: siteContentText(siteContent, 'footer_social_instagram_url'), label: 'Instagram' },
      { icon: Twitter, href: siteContentText(siteContent, 'footer_social_twitter_url'), label: 'Twitter / X' },
      { icon: TikTokIcon, href: siteContentText(siteContent, 'footer_social_tiktok_url'), label: 'TikTok' },
    ],
    [siteContent],
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section
        ref={heroRef}
        className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center"
      >
        <div className="absolute inset-0 opacity-20">
          <img 
            src={contactHeroBg}
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
          <p className="hero-animate font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            {siteContentText(siteContent, 'contact_hero_kicker')}
          </p>
          <h1 className="hero-animate font-display font-black text-5xl sm:text-6xl lg:text-8xl text-white mb-8 tracking-tighter uppercase break-words">
            {siteContentText(siteContent, 'contact_hero_heading_prefix')}
            <span className="text-primary italic">{siteContentText(siteContent, 'contact_hero_heading_accent')}</span>
          </h1>
          <div className="hero-animate w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 lg:py-40">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-20">
            {/* Left Column - Contact Form (60%) */}
            <div ref={formRef} className="lg:col-span-3">
              <div className="max-w-2xl">
                <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0a0a0a] mb-8 uppercase tracking-tight break-words">
                  {siteContentText(siteContent, 'contact_form_heading_prefix')}
                  <span className="text-primary">{siteContentText(siteContent, 'contact_form_heading_accent')}</span>
                </h2>
                <p className="text-lg text-gray-500 mb-12 leading-relaxed">
                  {siteContentText(siteContent, 'contact_form_intro')}
                </p>
                <div className="bg-[#fcfcfc] border border-gray-100 rounded-3xl p-8 lg:p-12 shadow-premium">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info (40%) */}
            <div ref={infoRef} className="lg:col-span-2 space-y-10">
              <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0a0a0a] mb-8 uppercase tracking-tight break-words">
                {siteContentText(siteContent, 'contact_details_heading_prefix')}
                <span className="text-primary">{siteContentText(siteContent, 'contact_details_heading_accent')}</span>
              </h2>
              {/* Contact Cards */}
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div
                    key={info.title}
                    className="info-card group bg-white border border-gray-100 rounded-3xl p-8 shadow-premium hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                        <info.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-xl text-[#0a0a0a] mb-2 group-hover:text-primary transition-colors break-words">
                          {info.title}
                        </h3>
                        <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-line break-words">
                          {info.content}
                        </p>
                        {info.action && (
                          <a
                            href={info.action.href}
                            className="inline-flex items-center gap-2 text-primary font-bold text-sm mt-4 hover:underline uppercase tracking-widest"
                          >
                            {info.action.label}
                            <Send className="w-3 h-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media Card */}
              <div className="info-card bg-[#0a0a0a] rounded-3xl p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="font-display font-black text-2xl text-white mb-3 uppercase tracking-wider relative z-10 break-words">
                  {siteContentText(siteContent, 'contact_social_heading_prefix')}
                  <span className="text-primary italic">{siteContentText(siteContent, 'contact_social_heading_accent')}</span>
                </h3>
                <p className="text-white/55 text-sm mb-8 relative z-10 max-w-sm leading-relaxed">
                  {siteContentText(siteContent, 'contact_social_body')}
                </p>
                <div className="flex flex-wrap gap-4 relative z-10">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg transition-all duration-500 hover:scale-110 hover:border-primary hover:bg-primary"
                      aria-label={social.label}
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-24 lg:py-40 bg-[#fcfcfc] border-t border-gray-100 relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="font-display font-black text-4xl lg:text-6xl text-[#0a0a0a] mb-8 uppercase tracking-tighter break-words">
              {siteContentText(siteContent, 'contact_faq_section_heading_prefix')}
              <span className="text-primary italic">{siteContentText(siteContent, 'contact_faq_section_heading_accent')}</span>
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              {siteContentText(siteContent, 'contact_faq_section_intro')}
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="faq-item group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-premium hover:shadow-xl transition-all duration-500"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 sm:px-10 py-8 flex items-center justify-between gap-4 text-left transition-colors"
                >
                  <span className="flex-1 min-w-0 text-lg sm:text-xl font-bold text-gray-800 group-hover:text-primary transition-colors break-words">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 ${openFaq === index ? 'bg-primary text-white border-primary rotate-180' : 'text-gray-400 group-hover:border-primary/20 group-hover:text-primary'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-700 ease-in-out ${
                    openFaq === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 sm:px-10 pb-10">
                    <div className="w-12 h-1 bg-primary/20 mb-6 rounded-full" />
                    <p className="text-gray-500 text-base sm:text-lg leading-relaxed font-medium break-words">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
