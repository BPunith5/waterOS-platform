import { useEffect, useId, useRef, type ReactNode } from 'react';
import { animate, useAnimationFrame, useMotionValue } from 'framer-motion';
import { colors } from '@/theme/tokens';

type Props = {
  size?: number;
  percentage: number; // 0-1
  color?: string;
  label?: string;
  value?: string;
  unit?: string;
  icon?: ReactNode;
};

/**
 * Circular "glass orb" gauge with an animated sine wave that fills
 * to the given percentage — the WaterOS replacement for a progress
 * ring or bar chart.
 */
export function LiquidGauge({ size = 120, percentage, color = colors.cyan, label, value, unit, icon }: Props) {
  const id = useId().replace(/:/g, '');
  const fill = useMotionValue(0);
  const phase = useMotionValue(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const controls = animate(fill, Math.max(0, Math.min(1, percentage)), {
      duration: 1.4,
      ease: [0.215, 0.61, 0.355, 1],
    });
    return () => controls.stop();
  }, [percentage, fill]);

  useAnimationFrame((t) => {
    phase.set(((t / 3400) * Math.PI * 2) % (Math.PI * 2));

    const amplitude = size * 0.045;
    const baseY = size * (1 - fill.get());
    const steps = 10;
    let d = `M0 ${baseY.toFixed(2)}`;
    for (let i = 1; i <= steps; i++) {
      const x = (size / steps) * i;
      const y = baseY + Math.sin((x / size) * Math.PI * 4 + phase.get()) * amplitude;
      d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L${size} ${size} L0 ${size} Z`;
    pathRef.current?.setAttribute('d', d);
  });

  const r = size / 2;

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size}>
        <defs>
          <clipPath id={`gclip-${id}`}>
            <circle cx={r} cy={r} r={r - 3} />
          </clipPath>
          <linearGradient id={`ggrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.85} />
            <stop offset="1" stopColor={color} stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <circle cx={r} cy={r} r={r - 1.5} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
        <path ref={pathRef} fill={`url(#ggrad-${id})`} clipPath={`url(#gclip-${id})`} />
        <circle cx={r} cy={r} r={r - 1.5} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {icon}
        {value !== undefined && (
          <span
            className="font-bold leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontSize: size * 0.18, color: colors.textPrimary }}
          >
            {value}
            {unit ? (
              <span className="font-medium" style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: colors.textSecondary }}>
                {unit}
              </span>
            ) : null}
          </span>
        )}
        {label && (
          <span
            className="mt-0.5 max-w-[90%] truncate"
            style={{ fontFamily: 'var(--font-body)', fontSize: size * 0.085, color: colors.textSecondary }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
