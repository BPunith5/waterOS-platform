import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  index?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

const STAGGER = 0.07;
const BASE_DELAY = 0.06;

/**
 * Wraps content so it gently rises and fades in on mount, staggered by
 * `index` — used to give lists and grids a fluid, cascading entrance.
 * Also applies a spring-based layout transition so items resettle
 * smoothly when the surrounding list reflows (e.g. filtering).
 */
export function Reveal({ children, index = 0, delay, className, style }: RevealProps) {
  const computedDelay = delay ?? BASE_DELAY + index * STAGGER;

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: computedDelay,
        type: 'spring',
        damping: 26,
        stiffness: 220,
      }}
      layout
    >
      {children}
    </motion.div>
  );
}
