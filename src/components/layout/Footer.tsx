import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';

const footerLinks = {
  Legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Community Guidelines', to: '/community-guidelines' },
    { label: 'Cookie Notice', to: '/cookies' },
  ],
  Trust: [
    { label: 'Safety Tips', to: '/safety-tips' },
    { label: 'Grievance Redressal', to: '/grievance' },
    { label: 'Report a Problem', to: '/contact' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-ink-950 border-t border-white/10 text-ink-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <BrandMark />
              <span className="font-display font-extrabold text-xl tracking-tight text-white">Stumate</span>
            </Link>
            <p className="text-sm text-ink-400 max-w-xs">
              The hyper-local campus marketplace where seniors sell room essentials to juniors before they leave.
            </p>
            <p className="flex items-center gap-1 text-sm text-ink-400 mt-3">
              Made for students, by students <Heart className="w-3 h-3 fill-accent-400 text-accent-400" />
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-ink-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} Stumate. All rights reserved.</p>
          <p className="text-xs text-ink-500">
            Version 1.0 · <Link to="/terms" className="hover:text-ink-300">Terms</Link> · <Link to="/privacy" className="hover:text-ink-300">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
