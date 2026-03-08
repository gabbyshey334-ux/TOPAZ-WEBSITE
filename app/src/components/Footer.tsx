import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, Download } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Schedule', to: '/schedule' },
    { label: 'Rules', to: '/rules' },
    { label: 'Contact', to: '/contact' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#facebook', label: 'Facebook' },
    { icon: Instagram, href: '#instagram', label: 'Instagram' },
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Youtube, href: '#youtube', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-24 pb-12 overflow-hidden relative">
      {/* Background visual decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px]" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-24">
          {/* Column 1: Brand */}
          <div className="space-y-8">
            <Link to="/" className="inline-block group">
              <span className="font-display font-black text-3xl tracking-tighter text-white">
                TOPAZ <span className="text-primary group-hover:text-secondary transition-colors duration-500">2.0</span>
              </span>
            </Link>
            <p className="text-white/50 text-lg leading-relaxed max-w-xs">
              Celebrating over five decades of excellence in dance and theatrical arts.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-500"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-8">
              Experience
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/40 hover:text-primary transition-colors duration-300 text-base font-medium flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`${import.meta.env.BASE_URL}pdfs/topaz-rules.pdf`}
                  download="TOPAZ_Rules_2026.pdf"
                  className="text-white/40 hover:text-primary transition-colors duration-300 text-base font-medium flex items-center gap-2 group"
                >
                  <Download className="w-4 h-4" />
                  Rules Portfolio
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-8">
              Connect
            </h3>
            <div className="space-y-6">
              <a
                href="mailto:info@dancetopaz.com"
                className="flex items-start gap-4 text-white/40 hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium pt-2">info@dancetopaz.com</span>
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-start gap-4 text-white/40 hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium pt-2">(555) 123-4567</span>
              </a>
              <div className="flex items-start gap-4 text-white/40 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium pt-2 leading-relaxed">
                  123 Dance Avenue<br />New York, NY 10001
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-8">
              Stay Updated
            </h3>
            <p className="text-white/40 text-base mb-8 leading-relaxed font-medium">
              Join our mailing list for exclusive competition updates and early bird registrations.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-white/20"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary !rounded-2xl shadow-none hover:shadow-primary/20"
              >
                {subscribed ? 'You are subscribed!' : 'Subscribe Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-white/20 text-sm font-medium">
              © 2026 TOPAZ DANCE COMPETITION. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-8">
              <Link
                to="#privacy"
                className="text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Privacy Policy
              </Link>
              <Link
                to="#terms"
                className="text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
