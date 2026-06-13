import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { StatusPill } from '@/components/glass/StatusPill';
import { WaterVessel } from './WaterVessel';
import { colors, tankTypeMeta } from '@/theme/tokens';
import type { Tank } from '@/types';

type Props = {
  tank: Tank;
  onClick?: () => void;
  width?: number;
};

export function TankPreviewCard({ tank, onClick, width = 168 }: Props) {
  const meta = tankTypeMeta[tank.type];
  const TypeIcon = meta.icon;

  return (
    <PressableScale onClick={onClick}>
      <GlassSurface className="p-4" style={{ width }}>
        <div className="flex gap-4">
          <WaterVessel width={52} height={104} percentage={tank.currentLevel} color={meta.accent} radius={18} showBubbles={false} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div
              className="mb-0.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border"
              style={{ backgroundColor: `${meta.accent}26`, borderColor: `${meta.accent}55` }}
            >
              <TypeIcon size={14} color={meta.accent} />
            </div>
            <p className="truncate text-sm font-medium" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
              {tank.name}
            </p>
            <p className="mb-0.5 truncate text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
              {tank.location}
            </p>
            <p className="mb-1 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: meta.accent }}>
              {Math.round(tank.currentLevel * 100)}%
            </p>
            <StatusPill status={tank.status} />
          </div>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}
