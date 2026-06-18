import { Link } from 'react-router-dom';
import { Droplets, ExternalLink, Code2 } from 'lucide-react';
import { colors } from '@/theme/tokens';

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Live Demo', href: '/login' },
  ],
  Developers: [
    { label: 'API Docs', href: '#' },
    { label: 'REST Endpoints', href: '#' },
    { label: 'WebSocket Events', href: '#' },
    { label: 'GitHub', href: 'https://github.com/BPunith5/waterOS-platform' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact', href: '#' },
  ],
};

export function Footer() {
  function scrollTo(href: string) {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <footer className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})` }}
              >
                <Droplets size={16} color="#01040F" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>WaterOS</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Real-time IoT water monitoring for tanks, farms, and industrial systems. Built with NestJS, React, and Socket.IO.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Code2, href: 'https://github.com/BPunith5/waterOS-platform', label: 'GitHub' },
                { icon: ExternalLink, href: '#', label: 'Twitter' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <s.icon size={15} color={colors.textSecondary} />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('http') ? (
                      <a href={link.href} target="_blank" rel="noreferrer"
                        className="text-sm transition-colors hover:opacity-100"
                        style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                        {link.label}
                      </a>
                    ) : link.href.startsWith('#') ? (
                      <button type="button" onClick={() => scrollTo(link.href)}
                        className="text-sm transition-colors hover:opacity-100"
                        style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href}
                        className="text-sm transition-colors hover:opacity-100"
                        style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            © 2026 WaterOS. Built by B Punith.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="status-dot-live h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.success, color: colors.success }} />
            <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
