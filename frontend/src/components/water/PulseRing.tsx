import { motion } from 'framer-motion';

type Props = {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
};

/** A continuously expanding, fading ring — for "alive" pulse effects. */
export function PulseRing({ size = 80, color = '#FB7185', delay = 0, duration = 1800 }: Props) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{ width: size, height: size, border: `1.5px solid ${color}` }}
      initial={{ scale: 0.6, opacity: 0.6 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: duration / 1000, delay: delay / 1000, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}
