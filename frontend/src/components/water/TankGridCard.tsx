import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { WaterVessel } from './WaterVessel';
import { colors, tankTypeMeta } from '@/theme/tokens';
import type { Tank } from '@/types';

type Props = {
  tank: Tank;
  onClick?: () => void;
};

export function TankGridCard({ tank, onClick }: Props) {
  const meta = tankTypeMeta[tank.type];
  const isRound = meta.shape === 'round';
  const vesselW = isRound ? 72 : 52;
  const vesselH = isRound ? 72 : 96;

  const dotColor = !tank.connected
    ? colors.textTertiary
    : tank.status === 'critical'
      ? colors.danger
      : tank.status === 'warning'
        ? colors.warning
        : meta.accent;

  return (
    <PressableScale onClick={onClick} className="w-full">
      <GlassSurface borderRadius={12} interactive className="flex flex-col gap-2 p-3">
        <div
          className="flex items-end justify-center"
          style={{ minHeight: vesselH + 4 }}
        >
          <WaterVessel
            width={vesselW}
            height={vesselH}
            percentage={tank.connected ? tank.currentLevel : 0}
            color={meta.accent}
            shape={meta.shape}
            radius={10}
            showBubbles={tank.connected && tank.currentLevel > 0.1}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <p
            className="truncate text-sm font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}
          >
            {tank.name}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span
              className="text-xs font-medium"
              style={{
                fontFamily: 'var(--font-body)',
                color: tank.connected ? meta.accent : colors.textTertiary,
              }}
            >
              {tank.connected ? `${Math.round(tank.currentLevel * 100)}%` : 'No sensor'}
            </span>
          </div>
          <p
            className="truncate text-[10px] uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}
          >
            {meta.label}
          </p>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}
