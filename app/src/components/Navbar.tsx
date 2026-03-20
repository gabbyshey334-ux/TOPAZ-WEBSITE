import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SignUpModal from './SignUpModal';

const navLinks = [
  { label: 'HOME', to: '/' },
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#1a1a2e] shadow-lg py-2'
            : 'bg-[#1a1a2e] py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <span className="font-display font-black text-xl text-white tracking-tight">
                TOPAZ<span className="text-[#c9a227]">2.0</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-200 rounded ${
                    isActive(link.to)
                      ? 'text-[#c9a227] bg-white/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/registration"
                className="px-5 py-2 font-bold text-[11px] uppercase tracking-[0.15em] text-white border border-white/30 rounded hover:bg-white/10 transition-all duration-200"
              >
                REGISTER
              </Link>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="px-5 py-2 font-bold text-[11px] uppercase tracking-[0.15em] bg-[#c9a227] text-[#1a1a2e] rounded hover:bg-[#b8921f] transition-all duration-200"
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
        className={`fixed inset-0 z-[200] bg-[#1a1a2e] transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <span className="font-display font-black text-lg text-white tracking-tight">
            TOPAZ<span className="text-[#c9a227]">2.0</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-4 py-6">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-4 border-b border-white/10 font-bold text-sm tracking-wide transition-colors ${
                isActive(link.to)
                  ? 'text-[#c9a227]'
                  : 'text-white/80 hover:text-white'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${i * 40}ms` : '0ms' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile CTAs */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-3 border-t border-white/10 bg-[#1a1a2e]">
          <Link
            to="/registration"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-3 text-center font-bold text-sm uppercase tracking-widest text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
          >
            REGISTER
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowSignUpModal(true);
            }}
            className="w-full py-3 font-bold text-sm uppercase tracking-widest bg-[#c9a227] text-[#1a1a2e] rounded hover:bg-[#b8921f] transition-colors"
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
