import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Send,
  ChevronDown,
} from 'lucide-react';
import ContactForm from '../components/ContactForm';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'topaz2.0@yahoo.com',
      action: {
        label: 'Send Email',
        href: 'mailto:topaz2.0@yahoo.com',
      },
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '971-299-4401',
      action: {
        label: 'Call Now',
        href: 'tel:971-299-4401',
      },
    },
    {
      icon: MapPin,
      title: 'Mail Us',
      content: 'PO BOX 131\nBANKS, OR 97106',
      action: {
        label: 'Get Directions',
        href: 'https://maps.google.com/?q=PO+BOX+131+BANKS+OR+97106',
      },
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#facebook', label: 'Facebook', color: 'bg-blue-600' },
    { icon: Instagram, href: '#instagram', label: 'Instagram', color: 'bg-pink-600' },
    { icon: Twitter, href: '#twitter', label: 'Twitter', color: 'bg-sky-500' },
    { icon: Youtube, href: '#youtube', label: 'YouTube', color: 'bg-red-600' },
  ];

  const faqs = [
    {
      question: 'How do I register for a competition?',
      answer:
        'You can register online through our Schedule page. Select the competition you want to enter, fill out the registration form, and submit your payment. Early registration is recommended as spots fill up quickly!',
    },
    {
      question: 'What is the registration deadline?',
      answer:
        'Registration deadlines vary by competition but are typically 2-3 weeks before the event date. Check the specific competition page for exact deadlines. Late registrations may be accepted with an additional fee if space permits.',
    },
    {
      question: 'Can I compete in multiple categories?',
      answer:
        'Yes! Dancers are welcome to compete in multiple categories and divisions. Each entry requires a separate registration fee. Be sure to check the schedule to avoid time conflicts.',
    },
    {
      question: 'What should I bring to the competition?',
      answer:
        'Bring your costume, shoes, music backup (USB drive), registration confirmation, water, snacks, and any necessary makeup or hair supplies. Arrive at least 1 hour before your scheduled performance time.',
    },
    {
      question: 'How is the scoring system work?',
      answer:
        'Performances are judged on four criteria: Technique (25 points), Creativity & Choreography (25 points), Presentation (25 points), and Appearance & Costume (25 points), for a total of 100 points. Decimals are allowed for precise scoring.',
    },
    {
      question: 'What is the refund policy?',
      answer:
        'Full refunds are available up to 30 days before the competition. 50% refunds are available 15-29 days before. No refunds within 14 days of the event, but you may transfer your registration to another dancer.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section
        ref={heroRef}
        className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center"
      >
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
          <p className="hero-animate font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            Connect With Us
          </p>
          <h1 className="hero-animate font-display font-black text-5xl sm:text-6xl lg:text-8xl text-white mb-8 tracking-tighter uppercase">
            Get in <span className="text-primary italic">Touch</span>
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
                <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0a0a0a] mb-8 uppercase tracking-tight">
                  Send Us a <span className="text-primary">Message</span>
                </h2>
                <p className="text-lg text-gray-500 mb-12 leading-relaxed">
                  Have questions about registration, categories, or our events? 
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
                <div className="bg-[#fcfcfc] border border-gray-100 rounded-3xl p-8 lg:p-12 shadow-premium">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info (40%) */}
            <div ref={infoRef} className="lg:col-span-2 space-y-10">
              <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0a0a0a] mb-8 uppercase tracking-tight">
                Contact <span className="text-primary">Details</span>
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
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-xl text-[#0a0a0a] mb-2 group-hover:text-primary transition-colors">
                          {info.title}
                        </h3>
                        <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-line">
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
                <h3 className="font-display font-black text-2xl text-white mb-8 uppercase tracking-wider relative z-10">
                  Follow the <span className="text-primary italic">Movement</span>
                </h3>
                <div className="flex gap-4 relative z-10">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className={`w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-500 hover:scale-110 shadow-lg`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-6 h-6" />
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
            <h2 className="font-display font-black text-4xl lg:text-6xl text-[#0a0a0a] mb-8 uppercase tracking-tighter">
              Common <span className="text-primary italic">Questions</span>
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Find instant answers to our most frequently asked questions. 
              Can't find what you're looking for? Reach out above.
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
                  className="w-full px-10 py-8 flex items-center justify-between text-left transition-colors"
                >
                  <span className="text-xl font-bold text-gray-800 pr-8 group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 ${openFaq === index ? 'bg-primary text-white border-primary rotate-180' : 'text-gray-400 group-hover:border-primary/20 group-hover:text-primary'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-700 ease-in-out ${
                    openFaq === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-10 pb-10">
                    <div className="w-12 h-1 bg-primary/20 mb-6 rounded-full" />
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
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
