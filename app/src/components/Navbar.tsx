import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SignUpModal from './SignUpModal';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ to, children, onClick, isDark }: NavLinkProps & { isDark?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
        isActive
          ? 'text-primary'
          : isDark 
            ? 'text-white/70 hover:text-white' 
            : 'text-gray-600 hover:text-primary'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const location = useLocation();

  // All pages currently start with a dark hero section
  const isHomePage = location.pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Schedule', to: '/schedule' },
    { label: 'Rules', to: '/rules' },
    { label: 'Contact', to: '/contact' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
          isScrolled
            ? 'glass shadow-premium py-4'
            : 'bg-transparent py-8'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className={`font-display font-black text-2xl tracking-tighter transition-colors duration-500 ${
              isScrolled ? 'text-[#0a0a0a]' : 'text-white'
            }`}>
              TOPAZ <span className="text-primary italic">2.0</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                isDark={!isScrolled}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => setShowSignUpModal(true)}
              className={`btn-primary !px-8 !py-3 !text-xs !font-black uppercase tracking-widest transition-all duration-500 ${
                !isScrolled ? 'shadow-[0_0_20px_rgba(46,117,182,0.4)]' : ''
              }`}
            >
              Join the Dance
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden p-2 transition-colors duration-500 ${
              isScrolled ? 'text-[#0a0a0a]' : 'text-white'
            }`}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-white transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="w-full h-full flex flex-col">
          {/* Mobile Menu Header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
            <span className="font-display font-black text-xl text-[#1F4E78]">
              TOPAZ <span className="text-[#2E75B6]">2.0</span>
            </span>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-700 hover:text-[#2E75B6] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Links */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className="font-display font-bold text-2xl text-gray-800 hover:text-[#2E75B6] transition-colors"
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="px-4 py-8">
            <button
              onClick={() => {
                closeMobileMenu();
                setShowSignUpModal(true);
              }}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Join the Dance
            </button>
          </div>
        </div>
      </div>

      <SignUpModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} />
    </>
  );
};

export default Navbar;
