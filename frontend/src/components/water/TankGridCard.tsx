import { motion } from 'framer-motion';
import { PressableScale } from '@/components/glass/PressableScale';
import { WaterVessel } from './WaterVessel';
import { colors, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import type { Tank } from '@/types';

type Props = {
  tank: Tank;
  onClick?: () => void;
};

const statusColor: Record<Tank['status'], string> = {
  optimal: colors.success,
  warning: colors.warning,
  critical: colors.danger,
};

export function TankGridCard({ tank, onClick }: Props) {
  const meta = tankTypeMeta[tank.type];
  const isRound = meta.shape === 'round';
  const vesselW = isRound ? 80 : 56;
  const vesselH = isRound ? 80 : 108;

  const sColor = tank.connected ? statusColor[tank.status] : colors.textTertiary;
  const levelPct = tank.connected ? Math.round(tank.currentLevel * 100) : null;
  const qualityPct = tank.connected ? Math.round(tank.quality * 100) : 0;
  const qualityColor = qualityPct >= 70 ? colors.success : qualityPct >= 40 ? colors.warning : colors.danger;

  return (
    <PressableScale onClick={onClick} className="w-full">
      <div
        className="relative flex flex-col gap-2.5 overflow-hidden rounded-2xl p-3 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${colors.glassBorder}`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        {/* Top accent gradient bar */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
          style={{ backgroundImage: linearGradient(meta.gradient, 90) }}
        />

        {/* Type badge */}
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${meta.accent}18`, color: meta.accent, fontFamily: 'var(--font-body)' }}
          >
            {meta.label}
          </span>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sColor, boxShadow: `0 0 6px ${sColor}` }} />
        </div>

        {/* Vessel */}
        <div className="flex items-end justify-center" style={{ minHeight: vesselH + 8 }}>
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

        {/* Name */}
        <p className="truncate text-sm font-semibold leading-tight" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
          {tank.name}
        </p>

        {/* Level */}
        {levelPct !== null ? (
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold leading-none" style={{ fontFamily: 'var(--font-heading)', color: meta.accent }}>
              {levelPct}
            </span>
            <span className="text-xs font-medium" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>%</span>
          </div>
        ) : (
          <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>No sensor</span>
        )}

        {/* Quality bar */}
        {tank.connected && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>Quality</span>
              <span className="text-[9px] font-bold" style={{ color: qualityColor, fontFamily: 'var(--font-body)' }}>{qualityPct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: qualityColor }}
                initial={{ width: 0 }}
                animate={{ width: `${qualityPct}%` }}
                transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </div>
          </div>
        )}
      </div>
    </PressableScale>
  );
}
