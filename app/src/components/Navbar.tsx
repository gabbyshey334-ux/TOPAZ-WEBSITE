import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SignUpModal from './SignUpModal';

const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'ABOUT', to: '/about' },
  { label: 'TOUR', to: '/schedule' },
  { label: 'RULES', to: '/rules' },
  { label: 'GALLERY', to: '/gallery' },
  { label: 'SHOP', to: '/shop' },
  { label: 'CONTACT', to: '/contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed top-0 left-0 right-0 z-[100] border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.55)] transition-[background-color,box-shadow] duration-300 bg-[#0a0a0a] ${
          isScrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.65)]' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex items-center justify-between h-20">
            {/* Logo - Clean minimal style */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <span className="font-display font-black text-2xl md:text-3xl tracking-tight text-white uppercase drop-shadow-sm">
                TOPAZ<span className="text-[#2E75B6]">2.0</span>
              </span>
            </Link>

            {/* Desktop Nav Links - Minimal style */}
            <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 gap-5 xl:gap-8 px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`shrink-0 font-bold text-[11px] xl:text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
                    isActive(link.to)
                      ? 'text-[#2E75B6]'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA - Minimal */}
            <div className="hidden lg:flex items-center shrink-0 gap-3">
              <Link
                to="/registration"
                className="font-bold text-[11px] xl:text-xs uppercase tracking-[0.18em] text-white/90 hover:text-white transition-colors duration-200"
              >
                REGISTER
              </Link>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="px-5 py-2.5 font-bold text-xs uppercase tracking-[0.15em] bg-[#2E75B6] text-white rounded-full hover:bg-[#1F4E78] transition-all duration-200"
              >
                JOIN
              </button>
            </div>

            {/* Mobile Hamburger - Minimal */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — pointer-events disabled when closed so it never blocks the bar or page */}
      <div
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 z-[200] bg-[#0a0a0a] transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen
            ? 'translate-x-0 pointer-events-auto'
            : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-white/10">
          <span className="font-display font-black text-xl text-white tracking-tight uppercase">
            TOPAZ<span className="text-[#2E75B6]">2.0</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-white"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-4 py-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-5 border-b border-white/10 font-bold text-lg uppercase tracking-[0.15em] transition-colors ${
                isActive(link.to)
                  ? 'text-[#2E75B6]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile CTAs */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 border-t border-white/10 bg-[#0a0a0a]">
          <Link
            to="/registration"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-4 text-center font-bold text-sm uppercase tracking-[0.2em] text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
          >
            REGISTER
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowSignUpModal(true);
            }}
            className="w-full py-4 font-bold text-sm uppercase tracking-[0.2em] bg-[#2E75B6] text-white rounded-full hover:bg-[#1F4E78] transition-colors"
          >
            JOIN THE DANCE
          </button>
        </div>
      </div>

      <SignUpModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} />
    </>
  );
};

export default Navbar;
