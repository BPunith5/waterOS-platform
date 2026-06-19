import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { OceanBackground } from '@/components/water/OceanBackground';
import { HeroScene3D } from '@/components/3d/HeroScene3D';
import { colors } from '@/theme/tokens';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  };
}

export function Hero() {
  const navigate = useNavigate();

  const [secAgo, setSecAgo] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecAgo((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <OceanBackground />

      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full"
        style={{ background: `radial-gradient(circle, ${colors.cyan}18, transparent 70%)`, filter: 'blur(60px)' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full"
        style={{ background: `radial-gradient(circle, ${colors.teal}14, transparent 70%)`, filter: 'blur(60px)' }}
        animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* ── LEFT ── */}
          <div>
            <motion.div className="mb-6 inline-flex" {...fadeUp(0)}>
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: `${colors.cyan}12`, borderColor: `${colors.cyan}30`, color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: colors.cyan }} />
                IoT Water Monitoring Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}
              {...fadeUp(0.1)}
            >
              Monitor Your Water.{' '}
              <span style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal}, ${colors.seafoam})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Protect What Matters.
              </span>
            </motion.h1>

            <motion.p className="mt-6 max-w-lg text-lg leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }} {...fadeUp(0.2)}>
              Real-time water quality and level monitoring for tanks, farms, and industrial systems.
              Get live alerts, analytics, and full visibility — from any device.
            </motion.p>

            <motion.div className="mt-10 flex flex-wrap gap-4" {...fadeUp(0.3)}>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="group inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(34,211,238,0.3)]"
                style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})`, color: '#01040F', fontFamily: 'var(--font-body)' }}
              >
                Get Started Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2.5 rounded-2xl border px-6 py-3.5 text-sm font-semibold transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.14)', color: colors.textPrimary, fontFamily: 'var(--font-body)' }}
              >
                Live Demo
              </button>
            </motion.div>

            <motion.div className="mt-12 flex flex-wrap gap-6" {...fadeUp(0.4)}>
              {[
                { prefix: '', numeric: 10, suffix: 'K+', label: 'Tanks Monitored', delay: 0 },
                { prefix: '', numeric: 99.9, suffix: '%', label: 'Uptime', delay: 0.2, decimals: 1 },
                { prefix: '', numeric: 5, suffix: 's', label: 'Update Interval', delay: 0.4 },
              ].map((s) => (
                <StatTicker key={s.label} {...s} />
              ))}
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              className="mt-14 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-1"
              >
                <ChevronDown size={16} color={colors.textTertiary} />
              </motion.div>
              <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                Scroll to explore features
              </span>
            </motion.div>
          </div>

          {/* ── RIGHT: 3D tank fleet scene ── */}
          <motion.div
            className="relative h-[520px] w-full lg:h-[600px]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
          >
            <HeroScene3D />

            {/* Live chip overlay */}
            <motion.div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5, ease: EASE }}
            >
              <div
                className="flex items-center gap-2 rounded-full border px-3 py-1"
                style={{ background: 'rgba(1,4,15,0.8)', borderColor: `${colors.success}40`, backdropFilter: 'blur(12px)' }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: colors.success }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.success, fontFamily: 'var(--font-body)' }}>
                  Live Preview
                </span>
                <span className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  · {secAgo}s
                </span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function StatTicker({
  numeric, suffix, label, delay = 0, decimals = 0,
}: { prefix?: string; numeric: number; suffix: string; label: string; delay?: number; decimals?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const totalDuration = 1200;
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - start - delay * 1000;
      if (elapsed < 0) { raf = requestAnimationFrame(animate); return; }
      const progress = Math.min(elapsed / totalDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const factor = Math.pow(10, decimals);
      setCount(Math.round(eased * numeric * factor) / factor);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric, delay, decimals]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-heading)', color: colors.cyan }}>
          {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
        </span>
        <span className="text-xl font-bold" style={{ color: colors.teal, fontFamily: 'var(--font-heading)' }}>
          {suffix}
        </span>
      </div>
      <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{label}</p>
    </div>
  );
}
