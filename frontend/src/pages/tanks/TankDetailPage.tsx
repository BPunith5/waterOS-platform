import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Thermometer,
  FlaskConical,
  Leaf,
  Sparkles,
  Activity,
  BarChart3,
  Wrench,
  Pencil,
  Trash2,
  Cpu,
} from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { Reveal } from '@/components/glass/Reveal';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { StatusPill } from '@/components/glass/StatusPill';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { ActionSheet } from '@/components/glass/ActionSheet';
import { WaterVessel } from '@/components/water/WaterVessel';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { HistoryBarChart } from '@/components/water/HistoryBarChart';
import { api, type DeviceRecord, type DeviceUpdatePayload } from '@/lib/api';
import { toDisplayTank, generateHistory } from '@/lib/placeholder';
import { mergeLiveTank } from '@/lib/live';
import { formatLiters } from '@/lib/format';
import { useDeviceUpdates, useTankSubscription } from '@/context/SocketContext';
import { useOceanAccent } from '@/context/OceanThemeContext';
import { colors, radius, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import type { Tank } from '@/types';

const trendMeta: Record<Tank['trend'], { icon: typeof TrendingUp; color: string; label: string }> = {
  rising: { icon: TrendingUp, color: colors.success, label: 'Rising' },
  falling: { icon: TrendingDown, color: colors.danger, label: 'Falling' },
  stable: { icon: Minus, color: colors.textTertiary, label: 'Stable' },
};

export function TankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tank, setTank] = useState<Tank | null>(null);
  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastWaterLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      let record;
      try {
        record = await api.tanks.get(id);
      } catch {
        if (!cancelled) navigate('/tanks', { replace: true });
        return;
      }
      if (cancelled) return;

      let displayTank = toDisplayTank(record);
      let matchedDevice: DeviceRecord | null = null;
      let initialWaterLevel: number | null = null;

      try {
        const devices = await api.devices.list();
        const match = devices.find((d) => d.tankId === id);
        if (match) {
          matchedDevice = match;
          const logs = await api.telemetry.logs(match.deviceId, 1);
          if (logs[0]) {
            initialWaterLevel = logs[0].waterLevel;
            displayTank = mergeLiveTank(displayTank, match, logs[0]);
          }
        }
      } catch {
        // live data unavailable; fall back to placeholder readings
      }

      if (!cancelled) {
        lastWaterLevelRef.current = initialWaterLevel;
        setDevice(matchedDevice);
        setTank(displayTank);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useTankSubscription(id);

  const handleDeviceUpdate = useCallback(
    (payload: DeviceUpdatePayload) => {
      if (!id || payload.device.tankId !== id) return;
      setTank((prev) => (prev ? mergeLiveTank(prev, payload.device, payload.telemetry, lastWaterLevelRef.current) : prev));
      lastWaterLevelRef.current = payload.telemetry.waterLevel;
      setDevice(payload.device);
    },
    [id],
  );

  useDeviceUpdates(handleDeviceUpdate);

  useOceanAccent(tank?.type ?? null, tank?.connected ? tank.currentLevel : null);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Skeleton className="h-56" borderRadius={radius.xl} />
      </div>
    );
  }

  if (!tank) return null;

  const meta = tankTypeMeta[tank.type];
  const TypeIcon = meta.icon;
  const trend = trendMeta[tank.trend];
  const TrendIcon = trend.icon;
  const levelHistory = generateHistory(tank.currentLevel, 0.18);

  async function handleRemove() {
    if (!id) return;
    await api.tanks.remove(id);
    navigate('/tanks', { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <IconButton icon={ChevronLeft} onClick={() => navigate('/tanks')} />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-base font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {tank.name}
          </p>
          <p className="truncate text-xs" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tank.location}
          </p>
        </div>
        <IconButton icon={MoreHorizontal} onClick={() => setMenuOpen(true)} />
      </div>

      {/* Hero — pops up and expands horizontally into view */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 18, width: '72%' }}
        animate={{ opacity: 1, y: 0, width: '100%' }}
        transition={{ type: 'spring', damping: 22, stiffness: 190 }}
      >
        <GlassSurface borderRadius={radius.xl} className="flex items-center gap-6 p-5">
          <WaterVessel width={120} height={232} percentage={tank.currentLevel} color={meta.accent} radius={32} />
          <div className="min-w-0 flex-1">
            <span
              className="relative mb-2 inline-flex items-center gap-1 overflow-hidden rounded-pill px-2.5 py-[5px]"
              style={{ backgroundImage: linearGradient(meta.gradient) }}
            >
              <TypeIcon size={12} color={colors.textInverse} />
              <span className="text-[10px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-body)', color: colors.textInverse }}>
                {meta.label}
              </span>
            </span>

            <p className="text-4xl font-bold leading-tight" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              {tank.connected ? `${Math.round(tank.currentLevel * 100)}%` : '—'}
            </p>
            <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              {tank.connected ? 'Current Level' : 'No sensor connected'}
            </p>

            <div className="my-3 h-px" style={{ backgroundColor: colors.glassBorder }} />

            {tank.connected ? (
              <>
                <p className="text-base font-medium" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  {formatLiters(tank.capacityLiters * tank.currentLevel)}
                </p>
                <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  of {formatLiters(tank.capacityLiters)} capacity
                </p>
              </>
            ) : (
              <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                {formatLiters(tank.capacityLiters)} capacity
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              {tank.connected ? (
                <StatusPill status={tank.status} />
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 self-start rounded-pill border px-2.5 py-1.5"
                  style={{ backgroundColor: `${colors.textTertiary}1a`, borderColor: colors.glassBorder }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.textTertiary }} />
                  <span className="text-xs font-semibold" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                    Not Connected
                  </span>
                </span>
              )}
              {tank.connected && (
                <div className="flex items-center gap-1">
                  <TrendIcon size={14} color={trend.color} />
                  <span className="text-xs font-semibold" style={{ color: trend.color, fontFamily: 'var(--font-body)' }}>
                    {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {device && (
                <motion.span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: colors.success }}
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                {device ? `Live · ${tank.lastUpdated}` : tank.lastUpdated}
              </p>
            </div>
          </div>
        </GlassSurface>
      </motion.div>

      {tank.connected ? (
        <>
          {/* Live readings */}
          <Reveal index={1} className="mb-8">
            <SectionHeader title="Live Readings" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MetricOrbCard
                icon={<Thermometer size={22} color={colors.warning} />}
                label="Temperature"
                value={tank.temperature.toFixed(1)}
                unit="°C"
                percentage={tank.temperature / 40}
                color={colors.warning}
              />
              <MetricOrbCard
                icon={<FlaskConical size={22} color={colors.seafoam} />}
                label="pH Level"
                value={tank.ph.toFixed(1)}
                percentage={tank.ph / 14}
                color={colors.seafoam}
              />
              <MetricOrbCard
                icon={<Leaf size={22} color={colors.success} />}
                label="Dissolved O₂"
                value={`${Math.round(tank.dissolvedOxygen * 100)}`}
                unit="%"
                percentage={tank.dissolvedOxygen}
                color={colors.success}
              />
              <MetricOrbCard
                icon={<Sparkles size={22} color={colors.electricBlue} />}
                label="Water Quality"
                value={`${Math.round(tank.quality * 100)}`}
                unit="%"
                percentage={tank.quality}
                color={colors.electricBlue}
              />
              <MetricOrbCard
                icon={<Activity size={22} color={colors.aqua} />}
                label="Tank Health"
                value={`${Math.round(tank.health * 100)}`}
                unit="%"
                percentage={tank.health}
                color={colors.aqua}
              />
            </div>
          </Reveal>

          {/* History */}
          <Reveal index={2} className="mb-8">
            <SectionHeader title="7-Day Level Trend" />
            <HistoryBarChart data={levelHistory} color={meta.accent} />
          </Reveal>
        </>
      ) : (
        <Reveal index={1} className="mb-8">
          <SectionHeader title="Live Readings" />
          <GlassSurface borderRadius={radius.xl} className="flex flex-col items-center gap-2 p-8 text-center">
            <span
              className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
            >
              <Cpu size={20} color={colors.textTertiary} />
            </span>
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              No sensor connected
            </p>
            <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Connect an IoT sensor to this tank to see live water level, temperature, pH and other readings.
            </p>
          </GlassSurface>
        </Reveal>
      )}

      {/* Actions */}
      <Reveal index={3} className="mb-10 flex flex-col gap-3">
        {!device && (
          <LiquidButton
            label="Connect a Device"
            variant="primary"
            icon={<Cpu size={18} color={colors.textInverse} />}
            onClick={() => navigate(`/devices/add?tankId=${id}`)}
            fullWidth
          />
        )}
        <LiquidButton
          label="View Analytics"
          variant={device ? 'primary' : 'ghost'}
          icon={<BarChart3 size={18} color={device ? colors.textInverse : colors.textPrimary} />}
          onClick={() => navigate('/analytics')}
          fullWidth
        />
        <LiquidButton
          label="Schedule Maintenance"
          variant="ghost"
          icon={<Wrench size={18} color={colors.textPrimary} />}
          onClick={() => {}}
          fullWidth
        />
      </Reveal>

      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={tank.name}
        items={[
          { key: 'edit', label: 'Edit Tank', icon: Pencil, onClick: () => navigate(`/tanks/${tank.id}/edit`) },
          { key: 'remove', label: 'Remove Tank', icon: Trash2, destructive: true, onClick: handleRemove },
        ]}
      />
    </div>
  );
}
