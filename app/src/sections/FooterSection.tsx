import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Youtube, Mail, MapPin } from 'lucide-react';
import { TikTokIcon } from '../components/icons/TikTokIcon';

gsap.registerPlugin(ScrollTrigger);

const FooterSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const divider = dividerRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const bottom = bottomRef.current;

    if (!section || !divider || !left || !right || !bottom) return;

    const ctx = gsap.context(() => {
      // Divider animation
      gsap.fromTo(
        divider,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: divider,
            start: 'top 90%',
            end: 'top 70%',
            scrub: true,
          },
        }
      );

      // Left column
      gsap.fromTo(
        left,
        { x: '-4vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: left,
            start: 'top 85%',
            end: 'top 65%',
            scrub: true,
          },
        }
      );

      // Right column
      gsap.fromTo(
        right,
        { x: '4vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: right,
            start: 'top 85%',
            end: 'top 65%',
            scrub: true,
          },
        }
      );

      // Bottom row
      gsap.fromTo(
        bottom,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bottom,
            start: 'top 95%',
            end: 'top 80%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="flowing-section bg-secondary py-16 lg:py-24"
      style={{ zIndex: 60 }}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Divider */}
        <div
          ref={dividerRef}
          className="w-full h-px bg-border/20 mb-12 origin-left"
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Contact */}
          <div ref={leftRef}>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-6">
              Let's talk.
            </h3>

            <div className="space-y-4">
              <a
                href="mailto:hello@topaz2.dance"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>hello@topaz2.dance</span>
              </a>

              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>Seaside, OR / Pop-up events nationwide</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                <a
                  href="#instagram"
                  className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#youtube"
                  className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@dancetopaz2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Links */}
          <div ref={rightRef} className="md:text-right">
            <h4 className="font-mono text-xs tracking-widest text-muted-foreground mb-6">
              QUICK LINKS
            </h4>

            <nav className="flex flex-col gap-3">
              <a
                href="#register"
                className="text-foreground hover:text-primary transition-colors"
              >
                Register
              </a>
              <a
                href="#rules"
                className="text-foreground hover:text-primary transition-colors"
              >
                Rules & Categories
              </a>
              <a
                href="#faq"
                className="text-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <a
                href="#privacy"
                className="text-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          ref={bottomRef}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/20"
        >
          <span className="font-display font-black text-lg tracking-tight text-foreground">
            TOPAZ 2.0
          </span>

          <span className="font-mono text-xs text-muted-foreground">
            © 2026 Topaz 2.0. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
