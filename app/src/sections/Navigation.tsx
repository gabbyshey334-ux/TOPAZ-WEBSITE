import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', href: '#hero' },
    { label: 'Compete', href: '#compete' },
    { label: 'Create', href: '#create' },
    { label: 'Move', href: '#move' },
    { label: 'Event', href: '#event' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Fixed Navigation */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="font-display font-black text-lg tracking-tight text-foreground hover:text-primary transition-colors"
          >
            TOPAZ 2.0
          </a>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 font-mono text-xs tracking-widest text-foreground hover:text-primary transition-colors"
          >
            <span>MENU</span>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-background transition-all duration-500 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full h-full flex flex-col">
          {/* Menu Header */}
          <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
            <span className="font-display font-black text-lg tracking-tight text-foreground">
              TOPAZ 2.0
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 font-mono text-xs tracking-widest text-foreground hover:text-primary transition-colors"
            >
              <span>CLOSE</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {menuItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="font-display font-black text-4xl md:text-6xl lg:text-7xl text-foreground hover:text-primary transition-all duration-300 tracking-tight"
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Menu Footer */}
          <div className="w-full px-6 lg:px-12 py-8 flex items-center justify-between text-muted-foreground font-mono text-xs">
            <span>EST. 1972</span>
            <span>DANCE & PERFORMING ARTS</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
