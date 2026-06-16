import { motion } from 'framer-motion';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { WaterVessel } from './WaterVessel';
import { colors, tankTypeMeta } from '@/theme/tokens';
import type { Tank } from '@/types';

type Props = {
  tank: Tank;
  onClick?: () => void;
};

const statusLabel: Record<Tank['status'], string> = {
  optimal: 'Optimal',
  warning: 'Warning',
  critical: 'Critical',
};

const statusColor: Record<Tank['status'], string> = {
  optimal: colors.success,
  warning: colors.warning,
  critical: colors.danger,
};

export function TankGridCard({ tank, onClick }: Props) {
  const meta = tankTypeMeta[tank.type];
  const isRound = meta.shape === 'round';
  const vesselW = isRound ? 68 : 48;
  const vesselH = isRound ? 68 : 92;

  const sColor = tank.connected ? statusColor[tank.status] : colors.textTertiary;
  const sLabel = tank.connected ? statusLabel[tank.status] : 'No Sensor';
  const healthPct = tank.connected ? Math.round(tank.health * 100) : 0;
  const qualityPct = tank.connected ? Math.round(tank.quality * 100) : 0;
  const levelPct = tank.connected ? Math.round(tank.currentLevel * 100) : null;

  return (
    <PressableScale onClick={onClick} className="w-full">
      <GlassSurface borderRadius={12} interactive className="flex flex-col gap-2 p-3">
        {/* Vessel */}
        <div className="flex items-end justify-center" style={{ minHeight: vesselH + 4 }}>
          <WaterVessel
            width={vesselW}
            height={vesselH}
            percentage={tank.connected ? tank.currentLevel : 0}
            color={meta.accent}
            shape={meta.shape}
            radius={9}
            showBubbles={tank.connected && tank.currentLevel > 0.1}
          />
        </div>

        {/* Name + level */}
        <div>
          <p className="truncate text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
            {tank.name}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1">
            {levelPct !== null ? (
              <span className="text-xl font-bold leading-none" style={{ fontFamily: 'var(--font-heading)', color: meta.accent }}>
                {levelPct}<span className="text-xs font-medium" style={{ color: colors.textSecondary }}>%</span>
              </span>
            ) : (
              <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>—</span>
            )}
          </div>
        </div>

        {/* Quality bar */}
        {tank.connected && (
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                Quality
              </span>
              <span className="text-[9px] font-semibold" style={{ color: meta.accent, fontFamily: 'var(--font-body)' }}>
                {qualityPct}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: colors.glassFill }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: qualityPct >= 70 ? colors.success : qualityPct >= 40 ? colors.warning : colors.danger }}
                initial={{ width: 0 }}
                animate={{ width: `${qualityPct}%` }}
                transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </div>
          </div>
        )}

        {/* Status + health row */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: sColor }} />
            <span className="text-[10px] font-semibold" style={{ color: sColor, fontFamily: 'var(--font-body)' }}>
              {sLabel}
            </span>
          </span>
          {tank.connected && (
            <span className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              ❤ {healthPct}%
            </span>
          )}
        </div>

        {/* Type label */}
        <p className="truncate text-[9px] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
          {meta.label}
        </p>
      </GlassSurface>
    </PressableScale>
  );
}
