import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, BarChart3, Cpu, Droplet, Map, Shield, Zap } from 'lucide-react';
import { TiltCard } from '@/components/effects/TiltCard';
import { colors } from '@/theme/tokens';

const FEATURES = [
  {
    icon: Activity,
    color: colors.cyan,
    title: 'Real-Time Monitoring',
    description: 'Watch water levels, quality, pH, temperature and dissolved oxygen update live every 5 seconds — across all your tanks from one dashboard.',
    bullets: ['Water level & volume', 'pH & dissolved oxygen', 'Turbidity & TDS', 'Temperature tracking'],
    preview: 'monitoring',
  },
  {
    icon: Bell,
    color: colors.warning,
    title: 'Smart Alerts',
    description: 'Automatic threshold detection triggers instant alerts before problems become disasters. 12 alert types, zero false positives.',
    bullets: ['Critical level warnings', 'Water quality alerts', 'Sensor offline detection', 'Dedup within 30 min'],
    preview: 'alerts',
  },
  {
    icon: BarChart3,
    color: colors.teal,
    title: 'Analytics & Insights',
    description: 'Trend analysis over 7, 30, and 90-day windows. Spot usage patterns, forecast demand, and prove compliance with one click.',
    bullets: ['7/30/90-day trends', 'Fleet health overview', 'Export-ready reports', 'Per-tank breakdowns'],
    preview: 'analytics',
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

/* ── Mini preview components ─────────────────────────────────────── */

function MonitoringPreview({ color }: { color: string }) {
  const metrics = [
    { label: 'pH', value: '7.2', unit: '', base: 7.2, delta: 0.15 },
    { label: 'Temp', value: '24°C', unit: '°', base: 24, delta: 1.2 },
    { label: 'O₂', value: '89%', unit: '%', base: 89, delta: 3 },
  ];

  return (
    <div className="flex gap-2">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5"
          style={{ background: `${color}10`, border: `1px solid ${color}25` }}
          animate={{ borderColor: [`${color}25`, `${color}55`, `${color}25`] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        >
          <p className="text-[9px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            {m.label}
          </p>
          <motion.p
            className="text-sm font-bold"
            style={{ color, fontFamily: 'var(--font-heading)' }}
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.6 }}
          >
            {parseFloat((m.base + (i % 2 === 0 ? m.delta : 0)).toFixed(1))}{m.unit}
          </motion.p>
          <motion.div
            className="h-0.5 w-6 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scaleX: [0.5, 1, 0.7, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function AlertsPreview({ color: _color }: { color: string }) {
  const alerts = [
    { icon: '⚠', text: 'Low water level', sev: 'warning', c: colors.warning },
    { icon: '🔴', text: 'High turbidity', sev: 'critical', c: colors.danger },
    { icon: 'ℹ', text: 'Sensor update', sev: 'info', c: colors.electricBlue },
  ];
  const [idx, setIdx] = useState(0);

  return (
    <div className="relative h-[64px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: `${alerts[idx].c}12`, border: `1px solid ${alerts[idx].c}35` }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          onAnimationComplete={() => {
            setTimeout(() => setIdx((i) => (i + 1) % alerts.length), 1800);
          }}
        >
          <span className="text-base">{alerts[idx].icon}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold" style={{ color: alerts[idx].c, fontFamily: 'var(--font-body)' }}>
              {alerts[idx].text}
            </p>
            <p className="text-[9px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Just now · Tank A
            </p>
          </div>
          <motion.div
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: alerts[idx].c }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AnalyticsPreview({ color }: { color: string }) {
  const bars = [55, 70, 45, 85, 60, 78, 50, 88, 65, 92];

  return (
    <div className="relative flex items-end gap-1" style={{ height: 56 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1"
          style={{ backgroundColor: `${color}60`, borderRadius: '2px 2px 0 0' }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${h}%`, opacity: 1 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.215, 0.61, 0.355, 1] }}
        />
      ))}
      {/* Moving highlight bar */}
      <motion.div
        className="absolute inset-x-0"
        style={{ bottom: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  );
}

function CardPreview({ type, color }: { type: string; color: string }) {
  return (
    <div
      className="mb-5 overflow-hidden rounded-2xl p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)` }}
    >
      {type === 'monitoring' && <MonitoringPreview color={color} />}
      {type === 'alerts' && <AlertsPreview color={color} />}
      {type === 'analytics' && <div className="relative overflow-hidden"><AnalyticsPreview color={color} /></div>}
    </div>
  );
}

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
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.14, ease: EASE }}
              >
                <TiltCard intensity={8} glowColor={f.color} style={{ borderRadius: 24, height: '100%' }}>
                  <div
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl p-6"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid rgba(255,255,255,0.09)`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Top gradient sweep on hover */}
                    <div
                      className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }}
                    />

                    {/* Bottom color glow */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `radial-gradient(ellipse 70% 40% at 50% 110%, ${f.color}14, transparent 60%)` }}
                    />

                    {/* Icon */}
                    <motion.div
                      className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${f.color}18`, border: `1px solid ${f.color}30` }}
                      animate={{ boxShadow: [`0 0 0px ${f.color}00`, `0 0 20px ${f.color}40`, `0 0 0px ${f.color}00`] }}
                      transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Icon size={22} color={f.color} />
                    </motion.div>

                    <h3 className="mb-3 text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
                      {f.title}
                    </h3>

                    <p className="mb-4 text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                      {f.description}
                    </p>

                    {/* Animated live preview */}
                    <CardPreview type={f.preview} color={f.color} />

                    <ul className="mt-auto space-y-2">
                      {f.bullets.map((b, bi) => (
                        <motion.li
                          key={b}
                          className="flex items-center gap-2.5 text-sm"
                          style={{ fontFamily: 'var(--font-body)' }}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.14 + bi * 0.06, duration: 0.4, ease: EASE }}
                        >
                          <motion.span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: f.color }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: bi * 0.3 }}
                          />
                          <span style={{ color: colors.textSecondary }}>{b}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
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
              <motion.div
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: `${s.color}0A`, borderColor: `${s.color}25`, color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
                whileHover={{
                  backgroundColor: `${s.color}18`,
                  borderColor: `${s.color}50`,
                  color: colors.textPrimary,
                  y: -2,
                }}
                transition={{ duration: 0.18 }}
              >
                <Icon size={14} color={s.color} />
                {s.label}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
