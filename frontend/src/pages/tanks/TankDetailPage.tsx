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
  MapPin,
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
import { colors, tankTypeMeta } from '@/theme/tokens';
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

      try {
        const devices = await api.devices.list();
        const match = devices.find((d) => d.tankId === id);
        if (match) {
          matchedDevice = match;
          const logs = await api.telemetry.logs(match.deviceId, 1);
          if (logs[0]) {
            lastWaterLevelRef.current = logs[0].waterLevel;
            displayTank = mergeLiveTank(displayTank, match, logs[0]);
          }
        }
      } catch { /* fall back */ }

      if (!cancelled) {
        setDevice(matchedDevice);
        setTank(displayTank);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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
      <div className="w-full">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-96" borderRadius={12} />
          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[88px]" borderRadius={12} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!tank) return null;

  const meta = tankTypeMeta[tank.type];
  const trend = trendMeta[tank.trend];
  const TrendIcon = trend.icon;
  const levelHistory = generateHistory(tank.currentLevel, 0.18);
  const isRound = meta.shape === 'round';

  async function handleRemove() {
    if (!id) return;
    await api.tanks.remove(id);
    navigate('/tanks', { replace: true });
  }

  return (
    <div className="w-full">
      {/* ── Back nav ──────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-3">
        <IconButton icon={ChevronLeft} onClick={() => navigate('/tanks')} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {tank.name}
          </p>
          <div className="flex items-center gap-1">
            <MapPin size={11} color={colors.textTertiary} />
            <p className="truncate text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              {tank.location}
            </p>
          </div>
        </div>
        <IconButton icon={MoreHorizontal} onClick={() => setMenuOpen(true)} />
      </div>

      {/* ── Two-column main layout ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* LEFT: Hero vessel + info + actions */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 190 }}
          >
            <GlassSurface borderRadius={12} className="flex flex-col items-center gap-4 p-5">
              {/* Type badge */}
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.accent }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                    {meta.label}
                  </span>
                </span>
                {tank.connected && <TrendIcon size={16} color={trend.color} />}
              </div>

              {/* Vessel */}
              <WaterVessel
                width={isRound ? 160 : 110}
                height={isRound ? 160 : 200}
                percentage={tank.connected ? tank.currentLevel : 0}
                color={meta.accent}
                shape={meta.shape}
                radius={28}
                showBubbles={tank.connected}
              />

              {/* Level */}
              <div className="w-full text-center">
                <p className="text-5xl font-bold leading-tight" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  {tank.connected ? `${Math.round(tank.currentLevel * 100)}%` : '—'}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  {tank.connected
                    ? `${formatLiters(tank.capacityLiters * tank.currentLevel)} of ${formatLiters(tank.capacityLiters)}`
                    : `${formatLiters(tank.capacityLiters)} capacity`}
                </p>
              </div>

              <div className="h-px w-full" style={{ backgroundColor: colors.glassBorder }} />

              {/* Status row */}
              <div className="flex w-full items-center justify-between">
                {tank.connected ? (
                  <StatusPill status={tank.status} />
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                    style={{ backgroundColor: `${colors.textTertiary}1a`, borderColor: colors.glassBorder }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.textTertiary }} />
                    <span className="text-xs font-semibold" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      Not Connected
                    </span>
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  {device && (
                    <motion.span
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

          {/* Actions */}
          <Reveal index={1} className="flex flex-col gap-2">
            {!device && (
              <LiquidButton
                label="Connect a Sensor"
                variant="primary"
                icon={<Cpu size={16} color={colors.textInverse} />}
                onClick={() => navigate(`/devices/add`)}
                fullWidth
              />
            )}
            <LiquidButton
              label="View Analytics"
              variant={device ? 'primary' : 'glass'}
              icon={<BarChart3 size={16} color={device ? colors.textInverse : colors.textPrimary} />}
              onClick={() => navigate('/analytics')}
              fullWidth
            />
            <LiquidButton
              label="Schedule Maintenance"
              variant="ghost"
              icon={<Wrench size={16} color={colors.textPrimary} />}
              onClick={() => {}}
              fullWidth
            />
          </Reveal>
        </div>

        {/* RIGHT: Readings + Chart (2/3 of screen) */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {tank.connected ? (
            <>
              <Reveal index={0}>
                <SectionHeader title="Live Readings" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MetricOrbCard
                    icon={<Thermometer size={20} color={colors.warning} />}
                    label="Temperature"
                    value={tank.temperature.toFixed(1)}
                    unit="°C"
                    percentage={tank.temperature / 40}
                    color={colors.warning}
                  />
                  <MetricOrbCard
                    icon={<FlaskConical size={20} color={colors.seafoam} />}
                    label="pH Level"
                    value={tank.ph.toFixed(1)}
                    percentage={tank.ph / 14}
                    color={colors.seafoam}
                  />
                  <MetricOrbCard
                    icon={<Leaf size={20} color={colors.success} />}
                    label="Dissolved O₂"
                    value={`${Math.round(tank.dissolvedOxygen * 100)}`}
                    unit="%"
                    percentage={tank.dissolvedOxygen}
                    color={colors.success}
                  />
                  <MetricOrbCard
                    icon={<Sparkles size={20} color={colors.electricBlue} />}
                    label="Water Quality"
                    value={`${Math.round(tank.quality * 100)}`}
                    unit="%"
                    percentage={tank.quality}
                    color={colors.electricBlue}
                  />
                  <MetricOrbCard
                    icon={<Activity size={20} color={colors.aqua} />}
                    label="Tank Health"
                    value={`${Math.round(tank.health * 100)}`}
                    unit="%"
                    percentage={tank.health}
                    color={colors.aqua}
                  />
                  {/* Device health */}
                  {device && (
                    <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-4 text-center">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${colors.cyan}22`, border: `1px solid ${colors.cyan}44` }}
                      >
                        <Cpu size={16} color={colors.cyan} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                          Sensor
                        </p>
                        <p className="text-sm font-bold" style={{ color: colors.cyan, fontFamily: 'var(--font-heading)' }}>
                          {device.healthScore ?? 0}%
                        </p>
                        <p className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                          health
                        </p>
                      </div>
                    </GlassSurface>
                  )}
                </div>
              </Reveal>

              <Reveal index={1}>
                <SectionHeader title="7-Day Level Trend" />
                <HistoryBarChart data={levelHistory} color={meta.accent} />
              </Reveal>
            </>
          ) : (
            <Reveal index={0}>
              <GlassSurface borderRadius={12} className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-10 text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
                >
                  <Cpu size={24} color={colors.textTertiary} />
                </span>
                <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  No sensor connected
                </p>
                <p className="max-w-xs text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Connect an IoT sensor to start seeing live water level, temperature, pH and quality readings.
                </p>
                <LiquidButton
                  label="Connect a Sensor"
                  variant="primary"
                  icon={<Cpu size={16} color={colors.textInverse} />}
                  onClick={() => navigate('/devices/add')}
                />
              </GlassSurface>
            </Reveal>
          )}
        </div>
      </div>

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
