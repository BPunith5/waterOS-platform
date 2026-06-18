import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { colors } from '@/theme/tokens';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for individuals monitoring a single tank at home.',
    color: colors.electricBlue,
    cta: 'Get Started Free',
    variant: 'outline' as const,
    features: ['1 tank', 'Up to 2 sensors', 'Real-time monitoring', 'Basic alerts', '7-day history', 'Mobile & desktop'],
  },
  {
    name: 'Pro',
    price: '₹999',
    period: 'per month',
    description: 'For small farms and businesses managing multiple systems.',
    color: colors.cyan,
    cta: 'Start Free Trial',
    variant: 'primary' as const,
    badge: 'Most Popular',
    features: ['Up to 10 tanks', 'Unlimited sensors', 'All alert types', '90-day history', 'GPS map view', 'Analytics export', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'Large-scale deployments with dedicated support and SLAs.',
    color: colors.teal,
    cta: 'Contact Sales',
    variant: 'outline' as const,
    features: ['Unlimited tanks', 'Unlimited sensors', 'Custom alert rules', 'Unlimited history', 'API access', 'Dedicated support', 'Custom SLA', 'On-premise option'],
  },
];

export function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${colors.cyan}08, transparent 70%)`, filter: 'blur(60px)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span
            className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${colors.cyan}12`, borderColor: `${colors.cyan}30`, color: colors.cyan }}
          >
            Pricing
          </span>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            Start free. Scale when you need to. No surprises.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const isPro = plan.variant === 'primary';
            return (
              <motion.div
                key={plan.name}
                className="relative flex flex-col rounded-3xl p-7"
                style={{
                  background: isPro ? `linear-gradient(160deg, ${colors.cyan}14, ${colors.teal}08)` : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: isPro ? `1px solid ${colors.cyan}40` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isPro ? `0 0 48px ${colors.cyan}18, inset 0 1px 0 rgba(255,255,255,0.1)` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE }}
                whileHover={{ y: -4 }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})`, color: '#01040F' }}
                  >
                    {plan.badge}
                  </div>
                )}

                <p className="mb-1 text-sm font-semibold uppercase tracking-widest" style={{ color: plan.color, fontFamily: 'var(--font-body)' }}>
                  {plan.name}
                </p>
                <div className="mb-2 flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{plan.period}</span>
                </div>
                <p className="mb-7 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>{plan.description}</p>

                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="mb-8 w-full rounded-2xl py-3 text-sm font-bold transition-all hover:scale-[1.02]"
                  style={
                    plan.variant === 'primary'
                      ? { background: `linear-gradient(135deg, ${colors.cyan}, ${colors.teal})`, color: '#01040F' }
                      : { border: `1px solid ${plan.color}40`, color: colors.textPrimary, backgroundColor: `${plan.color}08` }
                  }
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${plan.color}22` }}>
                        <Check size={10} color={plan.color} strokeWidth={3} />
                      </div>
                      <span style={{ color: colors.textSecondary }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
