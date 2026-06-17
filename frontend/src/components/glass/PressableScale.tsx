import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

type PressableScaleProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  scaleTo?: number;
};

/** Generic wrapper that gives any element a gentle liquid press-down feel. */
export function PressableScale({
  children,
  onClick,
  className,
  style,
  scaleTo = 0.97,
}: PressableScaleProps) {
  return (
    <motion.div
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      whileTap={{ scale: scaleTo }}
      transition={{ type: 'spring', damping: 20, stiffness: 90 }}
    >
      {children}
    </motion.div>
  );
}
