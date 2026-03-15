import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://www.facebook.com/profile.php?id=61583857120063',
    hoverColor: 'hover:bg-blue-600',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://x.com/0topaz20',
    hoverColor: 'hover:bg-black',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/dancetopaz2.0',
    hoverColor: 'hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: '#',
    hoverColor: 'hover:bg-red-600',
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white py-16 lg:py-20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Social Media Icons - Top Center */}
        <div className="flex justify-center gap-4 mb-16">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white transition-all hover:scale-110 ${link.hoverColor}`}
              aria-label={link.name}
            >
              <link.icon className="w-6 h-6" />
            </a>
          ))}
        </div>

        {/* Main Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Company Info & Contact */}
          <div>
            <h3 className="font-display font-bold text-xl text-white mb-3">Topaz 2.0 LLC</h3>
            <div className="w-16 h-0.5 bg-white mb-6" />
            <div className="space-y-4">
              <a
                href="tel:971-299-4401"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>971-299-4401</span>
              </a>
              <a
                href="mailto:topaz2.0@yahoo.com"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>topaz2.0@yahoo.com</span>
              </a>
              <div className="flex items-start gap-2 text-white/90">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p>PO BOX 131</p>
                  <p>BANKS, OR 97106</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Competitions */}
          <div>
            <h3 className="font-display font-bold text-xl text-white mb-3">Competitions</h3>
            <div className="w-16 h-0.5 bg-white mb-4" />
            <h4 className="font-semibold text-white mb-2">Join Us</h4>
            <p className="text-white/70 leading-relaxed text-sm">
              Participate in our upcoming competitions to showcase your skills and artistry. Connect
              with fellow dancers and gain valuable experience as you compete.
            </p>
          </div>

          {/* Column 3: Workshops */}
          <div>
            <h3 className="font-display font-bold text-xl text-white mb-3">Workshops</h3>
            <div className="w-16 h-0.5 bg-white mb-4" />
            <h4 className="font-semibold text-white mb-2">Skill Building</h4>
            <p className="text-white/70 leading-relaxed text-sm">
              Our workshops provide dancers with unique opportunities to enhance their skills through
              expert-led classes. Grow as an artist and make new connections with like-minded peers.
            </p>
          </div>

          {/* Column 4: Community & Sponsorships */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-3">Community</h3>
              <div className="w-16 h-0.5 bg-white mb-4" />
              <h4 className="font-semibold text-white mb-2">Connect</h4>
              <p className="text-white/70 leading-relaxed text-sm">
                Engage with fellow dancers through our online community. Connect, share experiences,
                and grow together.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-3">Sponsorships</h3>
              <div className="w-16 h-0.5 bg-white mb-4" />
              <h4 className="font-semibold text-white mb-2">Get Involved</h4>
              <p className="text-white/70 leading-relaxed text-sm">
                We offer sponsorship opportunities for local businesses and organizations. Partner
                with us to support the arts.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-bold text-lg text-white hover:text-primary transition-colors">
            Topaz 2.0 LLC
          </Link>
          <span className="text-white/60 text-sm">© 2026 Topaz 2.0. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
