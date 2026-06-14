import type { CSSProperties, ReactNode } from 'react';
import { radius } from '@/theme/tokens';

type Tint = 'default' | 'bright' | 'dark';

type GlassSurfaceProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  borderRadius?: number;
  tint?: Tint;
  bordered?: boolean;
  /** Lifts and brightens the surface on hover — use for clickable cards/rows. */
  interactive?: boolean;
};

const overlays: Record<Tint, string> = {
  default: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))',
  bright: 'linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.06))',
  dark: 'linear-gradient(135deg, rgba(8,22,46,0.55), rgba(8,22,46,0.25))',
};

/**
 * Frosted glass panel — the base surface for every floating card in
 * WaterOS. Combines a backdrop blur with a subtle gradient sheen and a
 * soft luminous border.
 */
export function GlassSurface({
  children,
  className = '',
  style,
  intensity = 36,
  borderRadius = radius.lg,
  tint = 'default',
  bordered = true,
  interactive = false,
}: GlassSurfaceProps) {
  return (
    <div
      className={`relative isolate overflow-hidden ${interactive ? 'glass-interactive' : ''} ${className}`}
      style={{
        borderRadius,
        backdropFilter: `blur(${intensity}px)`,
        WebkitBackdropFilter: `blur(${intensity}px)`,
        backgroundImage: overlays[tint],
        border: bordered ? '1px solid var(--glass-border)' : undefined,
        ...style,
      }}
    >
      {/* top sheen highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      />
      {children}
    </div>
  );
}
