import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { GlassSurface } from './GlassSurface';
import { colors, radius } from '@/theme/tokens';

type FloatingBadgeProps = {
  icon: LucideIcon;
  label: string;
  color?: string;
  style?: CSSProperties;
  delay?: number;
};

/** A small glass pill that gently bobs up and down — adds floating life
 * to onboarding/illustration compositions. */
export function FloatingBadge({ icon: Icon, label, color = colors.cyan, style, delay = 0 }: FloatingBadgeProps) {
  return (
    <motion.div
      className="absolute"
      style={style}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <GlassSurface borderRadius={radius.pill} className="flex items-center gap-1.5 px-3.5 py-2">
        <Icon size={14} color={color} />
        <span className="text-xs font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}>
          {label}
        </span>
      </GlassSurface>
    </motion.div>
  );
}
