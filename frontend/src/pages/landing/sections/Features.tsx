import { motion } from 'framer-motion';
import { Activity, Bell, BarChart3, Cpu, Droplet, Map, Shield, Zap } from 'lucide-react';
import { colors } from '@/theme/tokens';

const FEATURES = [
  {
    icon: Activity,
    color: colors.cyan,
    title: 'Real-Time Monitoring',
    description: 'Watch water levels, quality, pH, temperature and dissolved oxygen update live every 5 seconds — across all your tanks from one dashboard.',
    bullets: ['Water level & volume', 'pH & dissolved oxygen', 'Turbidity & TDS', 'Temperature tracking'],
  },
  {
    icon: Bell,
    color: colors.warning,
    title: 'Smart Alerts',
    description: 'Automatic threshold detection triggers instant alerts before problems become disasters. 12 alert types, zero false positives.',
    bullets: ['Critical level warnings', 'Water quality alerts', 'Sensor offline detection', 'Dedup within 30 min'],
  },
  {
    icon: BarChart3,
    color: colors.teal,
    title: 'Analytics & Insights',
    description: 'Trend analysis over 7, 30, and 90-day windows. Spot usage patterns, forecast demand, and prove compliance with one click.',
    bullets: ['7/30/90-day trends', 'Fleet health overview', 'Export-ready reports', 'Per-tank breakdowns'],
  },
];

const SECONDARY = [
  { icon: Map, label: 'GPS Map View', color: colors.electricBlue },
  { icon: Cpu, label: 'Multi-Sensor', color: colors.seafoam },
  { icon: Shield, label: 'Secure JWT Auth', color: colors.success },
  { icon: Zap, label: '5s Live Updates', color: colors.warning },
  { icon: Droplet, label: '4 Tank Types', color: colors.cyan },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.cyan}40, transparent)` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span
            className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${colors.teal}12`, borderColor: `${colors.teal}30`, color: colors.teal }}
          >
            Features
          </span>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
            Everything your water needs.{' '}
            <span style={{ color: colors.cyan }}>Nothing it doesn't.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            From a single household tank to a multi-site industrial fleet — WaterOS gives you complete visibility in real time.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
                }}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE }}
                whileHover={{ y: -4, boxShadow: `0 20px 48px ${f.color}14, inset 0 1px 0 rgba(255,255,255,0.1)` }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }}
                />

                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  <Icon size={22} color={f.color} />
                </div>

                <h3 className="mb-3 text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
                  {f.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                  {f.description}
                </p>

                <ul className="space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: f.color }} />
                      <span style={{ color: colors.textSecondary }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        >
          {SECONDARY.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: `${s.color}0A`, borderColor: `${s.color}25`, color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
              >
                <Icon size={14} color={s.color} />
                {s.label}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
