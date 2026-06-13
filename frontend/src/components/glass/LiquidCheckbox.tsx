import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

type LiquidCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
};

export function LiquidCheckbox({ checked, onToggle }: LiquidCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative h-[22px] w-[22px] shrink-0 overflow-hidden rounded-[7px]"
      style={{ border: `1.5px solid ${colors.glassBorderBright}`, backgroundColor: colors.glassFill }}
    >
      <motion.div
        className="flex h-full w-full items-center justify-center rounded-[7px]"
        style={{ backgroundImage: linearGradient(gradients.aquaGlow) }}
        initial={false}
        animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 220 }}
      >
        <Check size={14} color={colors.textInverse} />
      </motion.div>
    </button>
  );
}
