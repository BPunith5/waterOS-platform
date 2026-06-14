import { FlaskConical, Leaf, MapPin, Minus, Thermometer, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { StatusPill } from '@/components/glass/StatusPill';
import { WaterVessel } from './WaterVessel';
import { colors, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import { formatLiters } from '@/lib/format';
import type { Tank } from '@/types';

const trendMeta: Record<Tank['trend'], { icon: LucideIcon; color: string }> = {
  rising: { icon: TrendingUp, color: colors.success },
  falling: { icon: TrendingDown, color: colors.danger },
  stable: { icon: Minus, color: colors.textTertiary },
};

type Props = {
  tank: Tank;
  onClick?: () => void;
};

export function TankListCard({ tank, onClick }: Props) {
  const meta = tankTypeMeta[tank.type];
  const trend = trendMeta[tank.trend];
  const TrendIcon = trend.icon;
  const TypeIcon = meta.icon;

  return (
    <PressableScale onClick={onClick} scaleTo={0.985} className="w-full">
      <GlassSurface interactive className="p-4">
        <div className="flex gap-4">
          <WaterVessel width={64} height={132} percentage={tank.currentLevel} color={meta.accent} radius={20} showBubbles={false} />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="mb-0.5 flex items-center justify-between">
              <span
                className="relative inline-flex items-center gap-1 self-start overflow-hidden rounded-pill px-2.5 py-1"
                style={{ backgroundImage: linearGradient(meta.gradient) }}
              >
                <TypeIcon size={11} color={colors.textInverse} />
                <span className="text-[10px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-body)', color: colors.textInverse }}>
                  {meta.label}
                </span>
              </span>
              <TrendIcon size={16} color={trend.color} />
            </div>

            <p className="truncate text-base font-medium" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
              {tank.name}
            </p>
            <div className="flex items-center gap-1">
              <MapPin size={12} color={colors.textTertiary} />
              <span className="truncate text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                {tank.location}
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: meta.accent }}>
                {Math.round(tank.currentLevel * 100)}%
              </span>
              <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                of {formatLiters(tank.capacityLiters)}
              </span>
            </div>

            <div className="mt-1.5 flex gap-2">
              <StatChip icon={Thermometer} value={`${tank.temperature.toFixed(1)}°`} />
              <StatChip icon={FlaskConical} value={tank.ph.toFixed(1)} />
              <StatChip icon={Leaf} value={`${Math.round(tank.dissolvedOxygen * 100)}%`} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <StatusPill status={tank.status} />
              <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                {tank.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}

function StatChip({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill border px-2 py-[3px]"
      style={{ backgroundColor: colors.glassFill, borderColor: colors.glassBorder }}
    >
      <Icon size={12} color={colors.textSecondary} />
      <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)', color: colors.textSecondary }}>
        {value}
      </span>
    </span>
  );
}
