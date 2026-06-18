import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { colors } from '@/theme/tokens';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FAQS = [
  {
    q: 'Do I need real hardware to use WaterOS?',
    a: 'No. Every sensor comes with a built-in telemetry simulator that generates realistic water-level, quality, pH, and temperature data every 5 seconds — so your dashboard is live from the moment you connect a sensor, even without physical hardware.',
  },
  {
    q: 'How does the sensor connect to a tank?',
    a: 'Register a sensor to get a unique Device ID and 6-digit activation PIN. Then go to Connect and either scan the QR code or type the ID + PIN manually. Select the tank to link, hit Connect — done. The sensor goes active immediately.',
  },
  {
    q: 'What alert types does WaterOS support?',
    a: 'WaterOS monitors 12 conditions: low water level, tank empty, low dissolved oxygen, high turbidity, abnormal pH, poor water quality composite, low battery, weak signal, device offline, GPS lost, high temperature, and rapid water-level change. Alerts deduplicate within a 30-minute window.',
  },
  {
    q: 'Can I monitor multiple tanks and sensor types?',
    a: 'Yes. WaterOS supports Drinking, Aquaculture, Industrial, and Irrigation tank types — each with its own thresholds and colour coding. You can manage unlimited tanks and sensors on the Pro and Enterprise plans.',
  },
  {
    q: 'Is my data secure?',
    a: 'All API endpoints are protected with JWT authentication. Telemetry ingestion uses a per-sensor secret key. Passwords are bcrypt-hashed (cost 12). The backend runs on Railway with TLS, and MongoDB Atlas handles encrypted storage.',
  },
  {
    q: 'What is the live update interval?',
    a: 'The simulator pushes telemetry every 5 seconds via Socket.IO WebSocket. The dashboard updates in real time without any page refresh — water vessel fills, gauges, and sparklines all animate live.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span
            className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${colors.electricBlue}12`, borderColor: `${colors.electricBlue}30`, color: colors.electricBlue }}
          >
            FAQ
          </span>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            >
              <div
                className="overflow-hidden rounded-2xl transition-colors duration-200"
                style={{
                  background: open === i ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.04)',
                  border: open === i ? `1px solid ${colors.cyan}30` : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold sm:text-base" style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}>
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="shrink-0"
                  >
                    <ChevronDown size={18} color={open === i ? colors.cyan : colors.textTertiary} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
