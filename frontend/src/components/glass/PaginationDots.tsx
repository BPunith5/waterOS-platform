import { motion } from 'framer-motion';
import { colors, gradients, radius } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

function Dot({ active }: { active: boolean }) {
  return (
    <motion.div
      className="h-2 overflow-hidden rounded-pill"
      style={{ backgroundColor: colors.glassFillStrong, borderRadius: radius.pill }}
      animate={{ width: active ? 28 : 8 }}
      transition={{ type: 'spring', damping: 14, stiffness: 180 }}
    >
      {active && (
        <div className="h-full w-full" style={{ backgroundImage: linearGradient(gradients.aquaGlow, 90) }} />
      )}
    </motion.div>
  );
}

export function PaginationDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </div>
  );
}
