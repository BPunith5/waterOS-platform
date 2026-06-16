import { AlertOctagon, AlertTriangle, Check, Info, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PressableScale } from '@/components/glass/PressableScale';
import { formatRelativeTime } from '@/lib/format';
import { colors } from '@/theme/tokens';
import type { AlertRecord } from '@/lib/api';

const severityMeta = {
  info: { icon: Info, color: colors.info, label: 'Info' },
  warning: { icon: AlertTriangle, color: colors.warning, label: 'Warning' },
  critical: { icon: AlertOctagon, color: colors.danger, label: 'Critical' },
} as const;

type Props = {
  alert: AlertRecord;
  onMarkRead?: () => void;
};

export function AlertCard({ alert, onMarkRead }: Props) {
  const meta = severityMeta[alert.severity];
  const Icon = meta.icon;
  const tankName = typeof alert.tankId === 'object' && alert.tankId ? alert.tankId.tankName : null;
  const isCritical = alert.severity === 'critical';
  const isRead = alert.read;

  return (
    <PressableScale scaleTo={0.99} className="w-full">
      <div
        className="relative overflow-hidden rounded-xl transition-all duration-200"
        style={{
          background: isRead
            ? 'rgba(255,255,255,0.04)'
            : isCritical
              ? 'rgba(251,113,133,0.08)'
              : alert.severity === 'warning'
                ? 'rgba(251,191,36,0.06)'
                : 'rgba(96,165,250,0.06)',
          border: `1px solid ${isRead ? colors.glassBorder : `${meta.color}44`}`,
          boxShadow: !isRead && isCritical ? `0 0 20px ${colors.danger}22` : 'none',
        }}
      >
        {/* Critical pulse glow */}
        {isCritical && !isRead && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: `radial-gradient(ellipse at 0% 50%, ${colors.danger}66, transparent 60%)` }}
          />
        )}

        {/* Left severity bar */}
        <div
          className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl"
          style={{ backgroundColor: isRead ? `${meta.color}44` : meta.color }}
        />

        <div className="flex gap-3 p-4 pl-5">
          {/* Icon */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${meta.color}${isRead ? '15' : '22'}`,
              border: `1px solid ${meta.color}${isRead ? '22' : '44'}`,
            }}
          >
            <Icon size={17} color={isRead ? `${meta.color}99` : meta.color} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="mr-2 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${meta.color}22`,
                    color: isRead ? `${meta.color}88` : meta.color,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {meta.label}
                </span>
                <p
                  className="inline text-sm font-semibold"
                  style={{
                    color: isRead ? colors.textSecondary : colors.textPrimary,
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {alert.title}
                </p>
              </div>
              {!isRead && onMarkRead && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
                  className="shrink-0 flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-all hover:opacity-80"
                  style={{ borderColor: colors.glassBorder, color: colors.textSecondary, fontFamily: 'var(--font-body)', backgroundColor: colors.glassFill }}
                >
                  <Check size={10} />
                  Mark read
                </button>
              )}
            </div>

            <p className="mt-1 text-xs leading-relaxed" style={{ color: isRead ? colors.textTertiary : colors.textSecondary, fontFamily: 'var(--font-body)' }}>
              {alert.description}
            </p>

            <div className="mt-2 flex items-center gap-3">
              {tankName && (
                <span className="inline-flex items-center gap-1">
                  <Link2 size={10} color={colors.textTertiary} />
                  <span className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                    {tankName}
                  </span>
                </span>
              )}
              <span className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                {formatRelativeTime(alert.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PressableScale>
  );
}
