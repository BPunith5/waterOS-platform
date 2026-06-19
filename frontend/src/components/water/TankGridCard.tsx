import { useState } from 'react';
import { motion } from 'framer-motion';
import { TankMini3D } from '@/components/3d/TankMini3D';
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
  const [hovered, setHovered] = useState(false);

  const sColor = tank.connected ? statusColor[tank.status] : colors.textTertiary;
  const levelPct = tank.connected ? Math.round(tank.currentLevel * 100) : null;
  const qualityPct = tank.connected ? Math.round(tank.quality * 100) : 0;
  const qualityColor =
    qualityPct >= 70 ? colors.success : qualityPct >= 40 ? colors.warning : colors.danger;


  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      animate={{
        boxShadow: hovered
          ? `0 0 48px ${meta.accent}44, 0 16px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.14)`
          : `0 0 0px transparent, 0 2px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
        borderColor: hovered ? `${meta.accent}55` : `${meta.accent}1a`,
        y: hovered ? -5 : 0,
      }}
      transition={{ duration: 0.24 }}
      className="relative flex flex-col overflow-hidden rounded-2xl cursor-pointer select-none"
      style={{
        background: `linear-gradient(160deg, rgba(4,16,36,0.97) 0%, rgba(1,6,18,0.99) 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${meta.accent}1a`,
        minHeight: 270,
      }}
    >
      {/* Top gradient accent line */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-[1.5px] rounded-t-2xl"
        style={{ backgroundImage: linearGradient(meta.gradient, 90) }}
      />

      {/* Type badge + live dot */}
      <div className="relative z-10 flex items-center justify-between p-3 pb-0">
        <span
          className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
          style={{
            backgroundColor: `${meta.accent}18`,
            color: meta.accent,
            border: `1px solid ${meta.accent}30`,
            fontFamily: 'var(--font-body)',
          }}
        >
          {meta.label}
        </span>
        <motion.span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: sColor }}
          animate={{
            boxShadow: tank.connected
              ? [`0 0 4px ${sColor}80`, `0 0 14px ${sColor}`, `0 0 4px ${sColor}80`]
              : `0 0 4px ${sColor}50`,
          }}
          transition={{ duration: 2.2, repeat: tank.connected ? Infinity : 0, ease: 'easeInOut' }}
        />
      </div>

      {/* 3D canvas — always rendered; empty tank when no sensor */}
      <div className="relative flex-1" style={{ minHeight: 162 }}>
        <TankMini3D
          fillLevel={tank.connected ? tank.currentLevel : 0}
          color={meta.accent}
          status={tank.connected ? tank.status : 'optimal'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        {/* radial glow intensifies on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(ellipse at 50% 70%, ${meta.accent}20, transparent 60%)`,
          }}
        />

        {/* "No sensor" badge overlay */}
        {!tank.connected && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium"
              style={{
                background: 'rgba(1,6,18,0.75)',
                border: `1px solid rgba(255,255,255,0.1)`,
                color: colors.textTertiary,
                fontFamily: 'var(--font-body)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            >
              No sensor
            </span>
          </div>
        )}
      </div>

      {/* Bottom stats bar */}
      <div
        className="relative z-10 p-3 pt-2"
        style={{ borderTop: `1px solid ${meta.accent}14` }}
      >
        <div className="flex items-end justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-bold leading-tight"
              style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
            >
              {tank.name}
            </p>
            {tank.connected && (
              <p
                className="mt-0.5 text-[9px] font-medium uppercase tracking-wide"
                style={{ color: sColor, fontFamily: 'var(--font-body)' }}
              >
                {tank.status}
              </p>
            )}
          </div>

          {levelPct !== null ? (
            <motion.div
              key={levelPct}
              className="shrink-0 text-right"
              initial={{ opacity: 0.5, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span
                className="text-[22px] font-bold tabular-nums leading-none"
                style={{ color: meta.accent, fontFamily: 'var(--font-heading)' }}
              >
                {levelPct}
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
              >
                %
              </span>
            </motion.div>
          ) : null}
        </div>

        {/* quality bar */}
        {tank.connected && (
          <div className="mt-2">
            <div
              className="h-[3px] w-full overflow-hidden rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${qualityColor}70, ${qualityColor})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${qualityPct}%` }}
                transition={{ duration: 1.0, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </div>
            <div className="mt-1 flex justify-between">
              <span
                className="text-[9px] uppercase tracking-wide"
                style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
              >
                Quality
              </span>
              <span
                className="text-[9px] font-bold"
                style={{ color: qualityColor, fontFamily: 'var(--font-body)' }}
              >
                {qualityPct}%
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
