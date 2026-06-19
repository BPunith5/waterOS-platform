import { Battery, Cpu, Link2, MapPin, Navigation, QrCode, Wifi } from 'lucide-react';
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
  unclaimed: { label: 'Unclaimed', color: colors.warning },
  decommissioned: { label: 'Decommissioned', color: colors.textTertiary },
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
  gpsAvailable?: boolean;
  onClick?: () => void;
  onConnect?: () => void;
  onShowDetails?: () => void;
  onViewMap?: () => void;
};

export function DeviceCard({ device, tankName, gpsAvailable = false, onClick, onConnect, onShowDetails, onViewMap }: Props) {
  const status = statusMeta[device.status];
  const batteryColor = device.battery > 50 ? colors.success : device.battery > 20 ? colors.warning : colors.danger;
  const signalColor = device.signal > 60 ? colors.success : device.signal > 30 ? colors.warning : colors.danger;

  return (
    <PressableScale onClick={onClick} scaleTo={0.985} className="w-full">
      <GlassSurface interactive className="p-4 transition-shadow duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <LiquidGauge
              size={64}
              percentage={device.healthScore / 100}
              color={healthColor[device.healthLevel]}
              icon={<Cpu size={18} color={colors.textPrimary} />}
            />
            {/* GPS availability badge */}
            <div
              className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border"
              style={{
                backgroundColor: gpsAvailable ? `${colors.success}22` : colors.glassFill,
                borderColor: gpsAvailable ? `${colors.success}66` : colors.glassBorder,
              }}
            >
              <Navigation size={9} color={gpsAvailable ? colors.success : colors.textTertiary} />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold" style={{ fontFamily: 'var(--font-heading)', color: colors.textPrimary }}>
                  {device.deviceName}
                </p>
                <p className="truncate text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                  {device.deviceId}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1"
                  style={{ backgroundColor: `${status.color}22`, borderColor: `${status.color}55` }}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full${device.status === 'active' ? ' status-dot-live' : ''}`}
                    style={{ backgroundColor: status.color, color: status.color }}
                  />
                  <span className="text-xs font-semibold" style={{ color: status.color, fontFamily: 'var(--font-body)' }}>
                    {status.label}
                  </span>
                </span>
                {onShowDetails && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onShowDetails(); }} aria-label="QR code">
                    <QrCode size={16} color={colors.textTertiary} />
                  </button>
                )}
              </div>
            </div>

            {/* Metric chips */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              <MetricChip icon={Battery} value={`${Math.round(device.battery)}%`} color={batteryColor} />
              <MetricChip icon={Wifi} value={`${Math.round(device.signal)}%`} color={signalColor} />
              <MetricChip icon={Cpu} value={`${device.healthScore}%`} color={healthColor[device.healthLevel]} label="Health" />
              {gpsAvailable && (
                <span
                  className="inline-flex items-center gap-1 rounded-pill border px-2 py-[3px]"
                  style={{ backgroundColor: `${colors.success}18`, borderColor: `${colors.success}44` }}
                >
                  <MapPin size={10} color={colors.success} />
                  <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)', color: colors.success }}>
                    GPS
                  </span>
                </span>
              )}
            </div>

            {/* Tank link + last seen */}
            <div className="mt-1.5 flex items-center justify-between gap-2">
              {tankName ? (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Link2 size={12} color={colors.textTertiary} />
                  <span className="truncate text-xs font-medium" style={{ fontFamily: 'var(--font-body)', color: colors.textSecondary }}>
                    {tankName}
                  </span>
                </span>
              ) : (
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                  Not connected to a tank
                </span>
              )}
              <span className="shrink-0 text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
                {device.lastSeen ? formatRelativeTime(device.lastSeen) : '—'}
              </span>
            </div>

            {/* Quick actions */}
            <div className="mt-2 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              {device.status === 'pending' && !device.tankId && onConnect && (
                <LiquidButton label="Connect" variant="primary" onClick={onConnect} />
              )}
              {device.status === 'active' && device.tankId && (
                <LiquidButton label="View Tank" variant="glass" onClick={onClick} />
              )}
              {gpsAvailable && onViewMap && (
                <LiquidButton label="Open Map" variant="ghost" icon={<MapPin size={14} color={colors.textPrimary} />} onClick={onViewMap} />
              )}
            </div>
          </div>
        </div>
      </GlassSurface>
    </PressableScale>
  );
}

function MetricChip({ icon: Icon, value, color, label }: { icon: typeof Battery; value: string; color?: string; label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill border px-2 py-[3px]"
      style={{ backgroundColor: colors.glassFill, borderColor: colors.glassBorder }}
    >
      <Icon size={11} color={color ?? colors.textSecondary} />
      {label && <span className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{label}:</span>}
      <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-body)', color: colors.textSecondary }}>
        {value}
      </span>
    </span>
  );
}
