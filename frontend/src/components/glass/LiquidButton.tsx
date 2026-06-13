import { useState, type CSSProperties, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface } from './GlassSurface';
import { colors, gradients, radius, shadows } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

type Variant = 'primary' | 'glass' | 'ghost';

type LiquidButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

type Ripple = { id: number; x: number; y: number };

let rippleId = 0;

/**
 * Liquid press button — scales down on press and emits a translucent
 * ripple from the pointer location, like a finger dipping into water.
 */
export function LiquidButton({
  label,
  onClick,
  variant = 'primary',
  icon,
  className = '',
  style,
  fullWidth,
  disabled,
  type = 'button',
}: LiquidButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = rippleId++;
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
  };

  const textColor = variant === 'primary' ? colors.textInverse : colors.textPrimary;

  const content = (
    <>
      {icon}
      <span
        className="relative text-base font-semibold tracking-wide"
        style={{ color: textColor, fontFamily: 'var(--font-body)', marginLeft: icon ? 10 : 0 }}
      >
        {label}
      </span>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: r.x - 90,
              top: r.y - 90,
              width: 180,
              height: 180,
              backgroundColor: colors.white,
            }}
            initial={{ scale: 0.2, opacity: 0.35 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.65 }}
          />
        ))}
      </AnimatePresence>
    </>
  );

  const baseClass = 'relative isolate flex items-center justify-center overflow-hidden rounded-pill px-7 py-[18px]';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      className={`${baseClass} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={style}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', damping: 16, stiffness: 320 }}
    >
      {variant === 'primary' && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: linearGradient(gradients.aquaGlow), boxShadow: shadows.glow(colors.cyan, 0.4) }}
        />
      )}
      {variant === 'ghost' && (
        <div aria-hidden className="absolute inset-0 -z-10" style={{ border: `1px solid ${colors.glassBorder}` }} />
      )}
      {variant === 'glass' ? (
        <GlassSurface borderRadius={radius.pill} style={{ position: 'absolute', inset: 0, zIndex: -1 }} />
      ) : null}
      {content}
    </motion.button>
  );
}
