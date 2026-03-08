import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Download, Handshake, Check, Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ClosingCTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const form = formRef.current;

    if (!section || !image || !content || !form) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.8,
        },
      });

      // ENTRANCE
      scrollTl
        .fromTo(
          image,
          { xPercent: -100, scale: 1.2 },
          { xPercent: 0, scale: 1, ease: 'none' },
          0
        )
        .fromTo(
          content.querySelectorAll('.cta-item'),
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.1, ease: 'none' },
          0.1
        )
        .fromTo(
          form.querySelectorAll('.form-item'),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, ease: 'none' },
          0.2
        );

      // EXIT
      scrollTl
        .to(image, { opacity: 0, scale: 1.1, ease: 'none' }, 1.2)
        .to(content.querySelectorAll('.cta-item'), { x: -50, opacity: 0, stagger: 0.05, ease: 'none' }, 1.2)
        .to(form.querySelectorAll('.form-item'), { y: 30, opacity: 0, stagger: 0.05, ease: 'none' }, 1.3);

    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);
    setEmail('');
    setName('');
  };

  const rulesPdfUrl = `${import.meta.env.BASE_URL}pdfs/topaz-rules.pdf`;

  return (
    <section
      ref={sectionRef}
      id="register"
      className="pinned-section bg-[#0a0a0a] overflow-hidden"
      style={{ zIndex: 50 }}
    >
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Image Panel */}
        <div
          ref={imageRef}
          className="relative h-[40vh] lg:h-full overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=1600&fit=crop"
            alt="Dancer in motion"
            className="w-full h-full object-cover grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/80" />
          <div className="absolute bottom-20 left-20 hidden lg:block">
            <p className="font-mono text-primary font-bold tracking-[0.5em] uppercase mb-4 opacity-50">Est. 1972</p>
            <h3 className="font-display font-black text-6xl text-white uppercase tracking-tighter leading-none">
              Legacy <br />
              <span className="text-primary italic underline decoration-primary/20 decoration-4">Defined</span>
            </h3>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex flex-col justify-center px-8 lg:px-24 py-16 lg:py-0 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-primary/5 blur-[150px] pointer-events-none" />
          
          <div className="max-w-xl relative z-10">
            <div ref={contentRef} className="mb-16">
              <h2 className="cta-item font-display font-black text-5xl lg:text-[6rem] tracking-tighter text-white mb-8 leading-[0.9] uppercase">
                THE STAGE <br />
                <span className="text-primary italic border-b-8 border-primary pb-4">IS YOURS.</span>
              </h2>
              <p className="cta-item text-white/50 text-xl lg:text-2xl leading-relaxed max-w-lg font-medium">
                Be the first to know about competition drops, deadlines, and early bird registration.
              </p>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-10 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-display font-black text-2xl uppercase tracking-tight mb-2">Registration Secured</h3>
                <p className="text-white/60 font-medium">You are now on the official TOPAZ 2.0 list.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="form-item grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First & Last Name"
                    required
                    className="w-full px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl placeholder:text-white/20 focus:outline-none focus:border-primary transition-all duration-300 font-medium"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl placeholder:text-white/20 focus:outline-none focus:border-primary transition-all duration-300 font-medium"
                  />
                </div>
                <div className="form-item">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary !py-5 text-lg shadow-2xl shadow-primary/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <span>Get the VIP Pass</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Secondary Links */}
                <div className="form-item flex flex-wrap gap-10 pt-8 border-t border-white/5">
                  <a
                    href={rulesPdfUrl}
                    download="TOPAZ_Rules_2026.pdf"
                    className="group flex items-center gap-3 text-white/30 hover:text-primary transition-all duration-500 font-bold text-xs tracking-widest uppercase"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                    Portfolio PDF
                  </a>
                  <button
                    onClick={() => alert('Feature coming soon!')}
                    className="group flex items-center gap-3 text-white/30 hover:text-primary transition-all duration-500 font-bold text-xs tracking-widest uppercase"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Handshake className="w-4 h-4" />
                    </div>
                    Partner with us
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosingCTASection;
