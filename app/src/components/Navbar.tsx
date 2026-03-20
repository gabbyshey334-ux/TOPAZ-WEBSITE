import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SignUpModal from './SignUpModal';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Schedule', to: '/schedule' },
  { label: 'Rules', to: '/rules' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Shop', to: '/shop' },
  { label: 'Contact', to: '/contact' },
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white shadow-[0_2px_24px_rgba(0,0,0,0.10)] py-0'
            : 'bg-transparent py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 md:h-18">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group shrink-0"
          >
            {/* Diamond mark */}
            <div
              className={`w-8 h-8 rotate-45 flex items-center justify-center transition-colors duration-500 ${
                isScrolled ? 'bg-[#2E75B6]' : 'bg-white/20 border border-white/40'
              }`}
            >
              <span
                className={`-rotate-45 font-black text-[10px] tracking-tighter transition-colors duration-500 ${
                  isScrolled ? 'text-white' : 'text-white'
                }`}
              >
                TZ
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className={`font-display font-black text-xl tracking-tight transition-colors duration-500 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                TOPAZ{' '}
                <span className="text-[#2E75B6]">2.0</span>
              </span>
              <span
                className={`font-mono text-[8px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                  isScrolled ? 'text-gray-400' : 'text-white/50'
                }`}
              >
                EST. 1972
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative font-bold text-[11px] uppercase tracking-widest transition-all duration-300 pb-0.5 ${
                  isActive(link.to)
                    ? isScrolled
                      ? 'text-[#2E75B6]'
                      : 'text-white'
                    : isScrolled
                    ? 'text-gray-500 hover:text-gray-900'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
                {/* Active underline */}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#2E75B6] rounded-full transition-transform duration-300 origin-left ${
                    isActive(link.to) ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/registration"
              className={`font-bold text-[11px] uppercase tracking-widest transition-all duration-300 ${
                isScrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Register
            </Link>
            <button
              onClick={() => setShowSignUpModal(true)}
              className={`px-6 py-2.5 font-black text-[11px] uppercase tracking-widest rounded transition-all duration-300 ${
                isScrolled
                  ? 'bg-[#2E75B6] text-white hover:bg-[#1F4E78] shadow-md hover:shadow-lg'
                  : 'bg-white text-[#1F4E78] hover:bg-white/90 shadow-lg'
              }`}
            >
              Join the Dance
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden p-2 rounded transition-colors duration-300 ${
              isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu — Full-screen slide-in */}
      <div
        className={`fixed inset-0 z-[200] bg-[#0a1628] transition-transform duration-400 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rotate-45 bg-[#2E75B6] flex items-center justify-center">
              <span className="-rotate-45 font-black text-[9px] text-white tracking-tighter">TZ</span>
            </div>
            <span className="font-display font-black text-lg text-white tracking-tight">
              TOPAZ <span className="text-[#2E75B6]">2.0</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-white/60 hover:text-white transition-colors rounded hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-6 pt-8 gap-1">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between py-4 border-b border-white/8 font-bold text-lg tracking-wide transition-colors duration-200 ${
                isActive(link.to)
                  ? 'text-[#2E75B6]'
                  : 'text-white/80 hover:text-white'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${i * 40}ms` : '0ms' }}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E75B6]" />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile CTAs */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 border-t border-white/10">
          <Link
            to="/registration"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-3.5 text-center font-bold text-sm uppercase tracking-widest text-white border border-white/20 rounded hover:bg-white/10 transition-colors"
          >
            Register Now
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowSignUpModal(true);
            }}
            className="w-full py-3.5 font-black text-sm uppercase tracking-widest bg-[#2E75B6] text-white rounded hover:bg-[#1F4E78] transition-colors shadow-lg"
          >
            Join the Dance
          </button>
        </div>
      </div>

      <SignUpModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} />
    </>
  );
};

export default Navbar;
