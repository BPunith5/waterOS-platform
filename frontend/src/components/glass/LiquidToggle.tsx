import { motion } from 'framer-motion';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

type LiquidToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

/** A glass pill switch with a liquid sliding knob and gradient fill. */
export function LiquidToggle({ value, onChange }: LiquidToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative h-7 w-12 shrink-0 overflow-hidden rounded-2xl border p-0.5"
      style={{ backgroundColor: colors.glassFill, borderColor: colors.glassBorder }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundImage: linearGradient(gradients.aquaGlow, 90) }}
        initial={false}
        animate={{ opacity: value ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="relative h-[22px] w-[22px] rounded-full"
        style={{ backgroundColor: colors.white }}
        initial={false}
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
      />
    </button>
  );
}
