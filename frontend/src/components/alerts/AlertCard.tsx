import { AlertOctagon, AlertTriangle, Check, Info, Link2 } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { formatRelativeTime } from '@/lib/format';
import { colors } from '@/theme/tokens';
import type { AlertRecord } from '@/lib/api';

const severityMeta = {
  info: { icon: Info, color: colors.info },
  warning: { icon: AlertTriangle, color: colors.warning },
  critical: { icon: AlertOctagon, color: colors.danger },
} as const;

type Props = {
  alert: AlertRecord;
  onMarkRead?: () => void;
};

export function AlertCard({ alert, onMarkRead }: Props) {
  const meta = severityMeta[alert.severity];
  const Icon = meta.icon;
  const tankName = typeof alert.tankId === 'object' && alert.tankId ? alert.tankId.tankName : null;

  return (
    <PressableScale scaleTo={0.99} className="w-full">
      <GlassSurface interactive className="p-4" style={{ borderLeft: `3px solid ${meta.color}` }}>
        <div className="flex gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${meta.color}22` }}
          >
            <Icon size={18} color={meta.color} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                {alert.title}
              </p>
              {!alert.read && onMarkRead && (
                <button
                  type="button"
                  onClick={onMarkRead}
                  className="shrink-0 rounded-pill border px-2 py-1 text-[10px] font-semibold"
                  style={{ borderColor: colors.glassBorder, color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
                >
                  <Check size={11} className="mr-1 inline" />
                  Mark read
                </button>
              )}
            </div>
            <p className="mt-0.5 text-xs" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
              {alert.description}
            </p>
            <div className="mt-2 flex items-center gap-3">
              {tankName && (
                <span className="inline-flex items-center gap-1">
                  <Link2 size={11} color={colors.textTertiary} />
                  <span className="text-[11px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                    {tankName}
                  </span>
                </span>
              )}
              <span className="text-[11px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                {formatRelativeTime(alert.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}
