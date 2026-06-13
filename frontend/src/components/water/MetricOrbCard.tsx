import type { CSSProperties, ReactNode } from 'react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { LiquidGauge } from './LiquidGauge';
import { colors } from '@/theme/tokens';

type Props = {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  percentage: number;
  color: string;
  className?: string;
  style?: CSSProperties;
};

/** A floating glass droplet that pairs a liquid gauge with a metric label. */
export function MetricOrbCard({ icon, label, value, unit, percentage, color, className, style }: Props) {
  return (
    <GlassSurface className={`flex w-full items-center gap-3 p-3.5 ${className ?? ''}`} style={style}>
      <LiquidGauge size={68} percentage={percentage} color={color} icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold" style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: colors.textPrimary }}>
          {value}
          {unit ? (
            <span className="font-medium" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: colors.textSecondary }}>
              {' '}
              {unit}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 truncate text-sm" style={{ fontFamily: 'var(--font-body)', color: colors.textSecondary }}>
          {label}
        </p>
      </div>
    </GlassSurface>
  );
}
