import { colors } from '@/theme/tokens';
import type { TankStatus } from '@/types';

const statusMeta: Record<TankStatus, { label: string; color: string }> = {
  optimal: { label: 'Optimal', color: colors.success },
  warning: { label: 'Attention', color: colors.warning },
  critical: { label: 'Critical', color: colors.danger },
};

export function StatusPill({ status }: { status: TankStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 self-start rounded-pill border px-2.5 py-1.5"
      style={{ backgroundColor: `${meta.color}22`, borderColor: `${meta.color}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      <span className="text-xs font-semibold" style={{ color: meta.color, fontFamily: 'var(--font-body)' }}>
        {meta.label}
      </span>
    </span>
  );
}
