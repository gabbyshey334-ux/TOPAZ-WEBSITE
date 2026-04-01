import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { TikTokIcon } from './icons/TikTokIcon';

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://www.facebook.com/profile.php?id=61583857120063',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://x.com/0topaz20',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/dancetopaz2.0',
  },
  {
    name: 'TikTok',
    icon: TikTokIcon,
    url: 'https://www.tiktok.com',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: '#',
  },
];

const footerLinks = [
  {
    title: 'COMPETITION',
    links: [
      { label: 'Schedule', to: '/schedule' },
      { label: 'Rules', to: '/rules' },
      { label: 'Registration', to: '/registration' },
      { label: 'Categories', to: '/rules' },
    ]
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Gallery', to: '/gallery' },
      { label: 'Shop', to: '/shop' },
      { label: 'FAQ', to: '/contact' },
      { label: 'Contact', to: '/contact' },
    ]
  },
  {
    title: 'ABOUT',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Team', to: '/about' },
      { label: 'Sponsors', to: '/' },
      { label: 'Press', to: '/' },
    ]
  }
];

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display font-black text-2xl text-white tracking-tight">
                TOPAZ<span className="text-[#2E75B6]">2.0</span>
              </span>
            </Link>
            <p className="text-white/60 leading-relaxed mb-6 max-w-sm">
              The premier dance competition since 1972. Creating unforgettable moments 
              for dancers nationwide. Excellence in dance, built by dancers, for dancers.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const isSoon = link.name === 'TikTok';
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-[#2E75B6] ${isSoon ? 'opacity-65 hover:opacity-90' : ''}`}
                    aria-label={isSoon ? `${link.name} (coming soon)` : link.name}
                    title={isSoon ? 'TikTok — coming soon' : undefined}
                  >
                    <link.icon className="h-5 w-5" />
                    {isSoon ? (
                      <span className="absolute -right-1 -top-1 rounded bg-[#2E75B6] px-1 py-px text-[7px] font-bold uppercase leading-none text-white">
                        Soon
                      </span>
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-display font-bold text-sm text-white mb-4 tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-white/60 hover:text-[#2E75B6] transition-colors duration-200 text-sm"
                >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <a href="tel:971-299-4401" className="flex items-center gap-2 hover:text-[#2E75B6] transition-colors">
                <Phone className="w-4 h-4" />
                971-299-4401
              </a>
              <a href="mailto:topaz2.0@yahoo.com" className="flex items-center gap-2 hover:text-[#2E75B6] transition-colors">
                <Mail className="w-4 h-4" />
                topaz2.0@yahoo.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                PO BOX 131, BANKS, OR 97106
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link to="/" className="text-white/60 hover:text-[#2E75B6] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/" className="text-white/60 hover:text-[#2E75B6] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2026 TOPAZ 2.0 LLC. All rights reserved.
            </p>
            <p className="text-white/40 text-sm font-mono tracking-wider">
              EST. 1972 • EXCELLENCE IN DANCE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
