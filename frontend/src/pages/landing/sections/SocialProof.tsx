import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { colors } from '@/theme/tokens';

const STATS = [
  { value: '12,000+', label: 'Tanks Monitored', color: colors.cyan },
  { value: '2.4B+',   label: 'Data Points Logged', color: colors.teal },
  { value: '99.9%',   label: 'Platform Uptime', color: colors.success },
  { value: '< 5s',    label: 'Live Update Speed', color: colors.warning },
];

const TESTIMONIALS = [
  {
    quote: "WaterOS transformed how we manage our aquaculture farm. Real-time DO and pH alerts saved an entire batch last season.",
    name: 'Ravi Menon',
    role: 'Aquaculture Farm Manager',
    avatar: 'RM',
    color: colors.teal,
  },
  {
    quote: "Deployed across 6 industrial tanks in under an hour. The sensor-first setup is incredibly intuitive.",
    name: 'Priya Sharma',
    role: 'Plant Operations Lead',
    avatar: 'PS',
    color: colors.cyan,
  },
  {
    quote: "Dashboard is beautiful and the alerts are smart — no spam, just the alerts that actually matter.",
    name: 'Arjun Nair',
    role: 'Water Utilities Engineer',
    avatar: 'AN',
    color: colors.electricBlue,
  },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function SocialProof() {
  return (
    <section className="relative py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-2xl p-6 text-center"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            >
              <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</p>
              <p className="text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="mb-3 flex justify-center gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={colors.warning} color={colors.warning} />)}
          </div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
            Trusted by water professionals
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="relative rounded-3xl p-6"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: EASE }}
              whileHover={{ y: -3 }}
            >
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={colors.warning} color={colors.warning} />)}
              </div>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${t.color}44, ${t.color}22)`, color: t.color, border: `1px solid ${t.color}40` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
