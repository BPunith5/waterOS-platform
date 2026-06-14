import { Cpu, Link2, Wifi, Battery } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { LiquidGauge } from '@/components/water/LiquidGauge';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { formatRelativeTime } from '@/lib/format';
import { colors } from '@/theme/tokens';
import type { DeviceRecord, DeviceStatus } from '@/lib/api';

const statusMeta: Record<DeviceStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: colors.success },
  pending: { label: 'Pending', color: colors.warning },
  offline: { label: 'Offline', color: colors.danger },
};

const healthColor: Record<DeviceRecord['healthLevel'], string> = {
  healthy: colors.success,
  good: colors.aqua,
  warning: colors.warning,
  critical: colors.danger,
};

type Props = {
  device: DeviceRecord;
  tankName?: string | null;
  onClick?: () => void;
  onConnect?: () => void;
};

export function DeviceCard({ device, tankName, onClick, onConnect }: Props) {
  const status = statusMeta[device.status];

  return (
    <PressableScale onClick={onClick} scaleTo={0.985} className="w-full">
      <GlassSurface className="p-4">
        <div className="flex gap-4">
          <LiquidGauge size={64} percentage={device.healthScore / 100} color={healthColor[device.healthLevel]} icon={<Cpu size={18} color={colors.textPrimary} />} />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="mb-0.5 flex items-center justify-between gap-2">
              <p className="truncate text-base font-medium" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
                {device.deviceName}
              </p>
              <span
                className="inline-flex items-center gap-1.5 self-start rounded-pill border px-2.5 py-1"
                style={{ backgroundColor: `${status.color}22`, borderColor: `${status.color}55` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="text-xs font-semibold" style={{ color: status.color, fontFamily: 'var(--font-body)' }}>
                  {status.label}
                </span>
              </span>
            </div>

            <p className="truncate text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
              {device.deviceId}
            </p>

            <div className="mt-1 flex gap-2">
              <StatChip icon={Battery} value={`${Math.round(device.battery)}%`} />
              <StatChip icon={Wifi} value={`${Math.round(device.signal)}%`} />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              {tankName ? (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Link2 size={12} color={colors.textTertiary} />
                  <span className="truncate text-xs font-medium" style={{ fontFamily: 'var(--font-body)', color: colors.textSecondary }}>
                    {tankName}
                  </span>
                </span>
              ) : (
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                  Not connected
                </span>
              )}
              {device.status === 'pending' && !device.tankId ? (
                <span onClick={(e) => e.stopPropagation()}>
                  <LiquidButton label="Connect" variant="glass" onClick={onConnect} />
                </span>
              ) : (
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                  {device.lastSeen ? formatRelativeTime(device.lastSeen) : '—'}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}

function StatChip({ icon: Icon, value }: { icon: typeof Battery; value: string }) {
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
