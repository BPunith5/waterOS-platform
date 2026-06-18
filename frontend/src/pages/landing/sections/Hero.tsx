import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { OceanBackground } from '@/components/water/OceanBackground';
import { LiquidGauge } from '@/components/water/LiquidGauge';
import { WaterVessel } from '@/components/water/WaterVessel';
import { PulseRing } from '@/components/water/PulseRing';
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

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <motion.div className="mb-6 inline-flex" {...fadeUp(0)}>
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: `${colors.cyan}12`, borderColor: `${colors.cyan}30`, color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                <span className="status-dot-live h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.cyan, color: colors.cyan }} />
                IoT Water Monitoring Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}
              {...fadeUp(0.1)}
            >
              Monitor Your Water.{' '}
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal}, ${colors.seafoam})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Protect What Matters.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
              {...fadeUp(0.2)}
            >
              Real-time water quality and level monitoring for tanks, farms, and industrial systems.
              Get live alerts, analytics, and full visibility — from any device.
            </motion.p>

            {/* CTAs */}
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
                <Play size={14} />
                Live Demo
              </button>
            </motion.div>

            {/* Trust stats */}
            <motion.div className="mt-12 flex flex-wrap gap-8" {...fadeUp(0.4)}>
              {[
                { value: '10K+', label: 'Tanks Monitored' },
                { value: '99.9%', label: 'Uptime' },
                { value: '5s', label: 'Update Interval' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.cyan }}>{s.value}</p>
                  <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: visual */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            <div
              className="relative w-full max-w-sm rounded-3xl p-6"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: `0 0 80px ${colors.cyan}18, inset 0 1px 0 rgba(255,255,255,0.12)`,
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>Live Dashboard</p>
                  <p className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>Main Drinking Tank</p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ backgroundColor: `${colors.success}14`, borderColor: `${colors.success}40`, color: colors.success }}
                >
                  <span className="status-dot-live h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.success, color: colors.success }} />
                  Live
                </span>
              </div>

              <div className="mb-5 flex items-end justify-around gap-4">
                {[
                  { level: 0.78, color: colors.cyan, label: 'Drinking' },
                  { level: 0.52, color: colors.teal, label: 'Farm' },
                  { level: 0.91, color: colors.seafoam, label: 'Reserve' },
                ].map((v) => (
                  <div key={v.label} className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <PulseRing size={56} color={v.color} duration={2400} delay={0} />
                      <WaterVessel width={44} height={64} percentage={v.level} color={v.color} shape="rect" radius={8} showBubbles />
                    </div>
                    <p className="text-[10px] font-semibold" style={{ color: v.color, fontFamily: 'var(--font-body)' }}>{Math.round(v.level * 100)}%</p>
                    <p className="text-[9px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{v.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-around">
                <LiquidGauge size={72} percentage={0.94} color={colors.success} value="94" unit="%" label="Quality" />
                <div className="h-12 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <LiquidGauge size={72} percentage={0.87} color={colors.electricBlue} value="87" unit="%" label="Health" />
                <div className="h-12 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <LiquidGauge size={72} percentage={0.72} color={colors.warning} value="22" unit="°C" label="Temp" />
              </div>
            </div>

            <motion.div
              className="absolute -right-4 top-8 rounded-2xl border px-3 py-2 shadow-xl"
              style={{ background: 'rgba(1,4,15,0.85)', backdropFilter: 'blur(20px)', borderColor: `${colors.success}40` }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.success }}>✓ All Clear</p>
              <p className="text-[9px]" style={{ color: colors.textTertiary }}>No active alerts</p>
            </motion.div>

            <motion.div
              className="absolute -left-4 bottom-12 rounded-2xl border px-3 py-2 shadow-xl"
              style={{ background: 'rgba(1,4,15,0.85)', backdropFilter: 'blur(20px)', borderColor: `${colors.cyan}30` }}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <p className="text-[10px] font-bold" style={{ color: colors.cyan }}>3 Sensors Online</p>
              <p className="text-[9px]" style={{ color: colors.textTertiary }}>Updated 2s ago</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
