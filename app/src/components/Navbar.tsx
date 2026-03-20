import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SignUpModal from './SignUpModal';

const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'ABOUT', to: '/about' },
  { label: 'COMPETE', to: '/schedule' },
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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0a0a0a] shadow-[0_2px_20px_rgba(0,0,0,0.5)]'
            : 'bg-[#0a0a0a]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              {/* Diamond mark */}
              <div className="w-8 h-8 rotate-45 bg-[#2E75B6] flex items-center justify-center">
                <span className="-rotate-45 font-black text-[10px] text-white tracking-tighter">
                  TZ
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display font-black text-xl tracking-tight text-white">
                  TOPAZ <span className="text-[#2E75B6]">2.0</span>
                </span>
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-white/50">
                  EST. 1972
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links - Centered like reference */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 pb-1 ${
                    isActive(link.to)
                      ? 'text-[#2E75B6]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                  {/* Active underline */}
                  <span
                    className={`absolute -bottom-0.5 left-0 w-full h-[2px] bg-[#2E75B6] transition-transform duration-300 origin-left ${
                      isActive(link.to) ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Desktop CTA - Right side */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/registration"
                className="font-bold text-[11px] uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors duration-300"
              >
                REGISTER
              </Link>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="px-5 py-2.5 font-black text-[11px] uppercase tracking-[0.12em] bg-[#2E75B6] text-white rounded hover:bg-[#1F4E78] transition-all duration-300 shadow-lg shadow-[#2E75B6]/20"
              >
                JOIN THE DANCE
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[200] bg-[#0a0a0a] transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
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
            className="p-2 text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-6 py-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-4 border-b border-white/10 font-bold text-sm tracking-wide transition-colors ${
                isActive(link.to)
                  ? 'text-[#2E75B6]'
                  : 'text-white/80 hover:text-white'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${i * 40}ms` : '0ms' }}
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
            className="w-full py-3.5 text-center font-bold text-sm uppercase tracking-widest text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
          >
            REGISTER
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowSignUpModal(true);
            }}
            className="w-full py-3.5 font-bold text-sm uppercase tracking-widest bg-[#2E75B6] text-white rounded hover:bg-[#1F4E78] transition-colors"
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
