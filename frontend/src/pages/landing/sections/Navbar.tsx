import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Menu, X } from 'lucide-react';
import { colors } from '@/theme/tokens';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(href: string) {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(1,4,15,0.75)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? `1px solid rgba(255,255,255,0.08)` : '1px solid transparent',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 outline-none">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})` }}
            >
              <Droplets size={16} color="#01040F" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
              WaterOS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium transition-colors hover:opacity-100"
                style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
              style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})`,
                color: '#01040F',
                fontFamily: 'var(--font-body)',
              }}
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl md:hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {mobileOpen ? <X size={18} color={colors.textPrimary} /> : <Menu size={18} color={colors.textPrimary} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-x-0 top-16 z-40 md:hidden"
            style={{
              background: 'rgba(1,4,15,0.92)',
              backdropFilter: 'blur(24px)',
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-xl border px-4 py-3 text-sm font-semibold"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: colors.textPrimary }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="rounded-xl px-4 py-3 text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})`, color: '#01040F' }}
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
