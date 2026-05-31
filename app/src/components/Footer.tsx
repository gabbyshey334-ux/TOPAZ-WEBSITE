import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import RegistrationLink from '@/components/RegistrationLink';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { TikTokIcon } from './icons/TikTokIcon';
import { siteContentText } from '@/constants/siteContentDefaults';
import { useSiteContentMap } from '@/contexts/SiteContentContext';

const footerLinks = [
  {
    title: 'COMPETITION',
    links: [
      { label: 'Schedule', to: '/schedule' },
      { label: 'Rules', to: '/rules' },
      { label: 'Registration', to: '/registration', registration: true },
      { label: 'Categories', to: '/rules' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Gallery', to: '/gallery' },
      { label: 'Shop', to: '/shop' },
      { label: 'FAQ', to: '/contact' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'ABOUT',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Team', to: '/about' },
      { label: 'Sponsors', to: '/' },
      { label: 'Press', to: '/' },
    ],
  },
];

const Footer = () => {
  const siteContent = useSiteContentMap();

  const tagline = siteContentText(siteContent, 'footer_tagline');
  const address = siteContentText(siteContent, 'footer_address');
  const copyrightLine = siteContentText(siteContent, 'footer_copyright');
  const estLine = siteContentText(siteContent, 'footer_est_line');
  const phone = siteContentText(siteContent, 'contact_phone');
  const email = siteContentText(siteContent, 'contact_email');

  const socialLinks = useMemo(
    () => [
      { name: 'Facebook', icon: Facebook, url: siteContentText(siteContent, 'footer_social_facebook_url') },
      { name: 'Twitter', icon: Twitter, url: siteContentText(siteContent, 'footer_social_twitter_url') },
      { name: 'Instagram', icon: Instagram, url: siteContentText(siteContent, 'footer_social_instagram_url') },
      { name: 'TikTok', icon: TikTokIcon, url: siteContentText(siteContent, 'footer_social_tiktok_url') },
    ],
    [siteContent],
  );

  const phoneDigits = phone.replace(/\D/g, '');

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display font-black text-2xl text-white tracking-tight">
                TOPAZ<span className="text-[#2E75B6]">2.0</span>
              </span>
            </Link>
            <p className="text-white/60 leading-relaxed mb-6 max-w-sm break-words">{tagline}</p>

            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-[#2E75B6]"
                  aria-label={link.name}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-display font-bold text-sm text-white mb-4 tracking-wider">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {'registration' in link && link.registration ? (
                      <RegistrationLink className="text-white/60 hover:text-[#2E75B6] transition-colors duration-200 text-sm">
                        {link.label}
                      </RegistrationLink>
                    ) : (
                      <Link
                        to={link.to!}
                        className="text-white/60 hover:text-[#2E75B6] transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm text-white/60 min-w-0 w-full md:w-auto">
              <a href={`tel:${phoneDigits}`} className="flex min-w-0 max-w-full items-center gap-2 hover:text-[#2E75B6] transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="min-w-0 break-words">{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex min-w-0 max-w-full items-center gap-2 hover:text-[#2E75B6] transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="min-w-0 break-all">{email}</span>
              </a>
              <span className="flex min-w-0 max-w-full items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">{address}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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

      <div className="bg-black/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-white/40 text-sm break-words">{copyrightLine}</p>
            <p className="text-white/40 text-sm font-mono tracking-wider break-words">{estLine}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
