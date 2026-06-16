import { Cpu, FlaskConical, Leaf, MapPin, Minus, Thermometer, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { StatusPill } from '@/components/glass/StatusPill';
import { WaterVessel } from './WaterVessel';
import { colors, tankTypeMeta } from '@/theme/tokens';
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
  const isRound = meta.shape === 'round';

  return (
    <PressableScale onClick={onClick} scaleTo={0.985} className="w-full">
      <GlassSurface interactive borderRadius={12} className="p-3">
        <div className="flex gap-3">
          <WaterVessel
            width={isRound ? 60 : 50}
            height={isRound ? 60 : 96}
            percentage={tank.connected ? tank.currentLevel : 0}
            color={meta.accent}
            shape={meta.shape}
            radius={10}
            showBubbles={false}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.accent }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}
                >
                  {meta.label}
                </span>
              </span>
              <TrendIcon size={14} color={trend.color} />
            </div>

            <p
              className="truncate text-sm font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}
            >
              {tank.name}
            </p>
            <div className="flex items-center gap-1">
              <MapPin size={11} color={colors.textTertiary} />
              <span
                className="truncate text-[11px]"
                style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}
              >
                {tank.location}
              </span>
            </div>

            {tank.connected ? (
              <>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span
                    className="text-base font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: meta.accent }}
                  >
                    {Math.round(tank.currentLevel * 100)}%
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}
                  >
                    of {formatLiters(tank.capacityLiters)}
                  </span>
                </div>

                <div className="mt-1 flex gap-1.5">
                  <StatChip icon={Thermometer} value={`${tank.temperature.toFixed(1)}°`} />
                  <StatChip icon={FlaskConical} value={tank.ph.toFixed(1)} />
                  <StatChip icon={Leaf} value={`${Math.round(tank.dissolvedOxygen * 100)}%`} />
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <StatusPill status={tank.status} />
                  <span
                    className="text-[11px]"
                    style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}
                  >
                    {tank.lastUpdated}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-1 flex items-center gap-1.5">
                <Cpu size={12} color={colors.textTertiary} />
                <span
                  className="text-[11px]"
                  style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}
                >
                  No sensor · {formatLiters(tank.capacityLiters)}
                </span>
              </div>
            )}
          </div>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}

function StatChip({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill border px-1.5 py-[2px]"
      style={{ backgroundColor: colors.glassFill, borderColor: colors.glassBorder }}
    >
      <Icon size={11} color={colors.textSecondary} />
      <span
        className="text-[10px] font-medium"
        style={{ fontFamily: 'var(--font-body)', color: colors.textSecondary }}
      >
        {value}
      </span>
    </span>
  );
}
