import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, BarChart3, ChevronLeft, Cpu, Droplet, FlaskConical, Leaf, MapPin,
  MoreHorizontal, Pencil, Trash2, Thermometer, TrendingDown, TrendingUp, Minus, Sparkles, Wrench,
} from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { IconButton } from '@/components/glass/IconButton';
import { Reveal } from '@/components/glass/Reveal';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { StatusPill } from '@/components/glass/StatusPill';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { ActionSheet } from '@/components/glass/ActionSheet';
import { TankDetail3D } from '@/components/3d/TankDetail3D';
import { LiquidGauge } from '@/components/water/LiquidGauge';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { HistoryBarChart } from '@/components/water/HistoryBarChart';
import { api, type AlertRecord, type DeviceRecord, type DeviceUpdatePayload, type TelemetryRecord } from '@/lib/api';
import { toDisplayTank, generateHistory } from '@/lib/placeholder';
import { mergeLiveTank } from '@/lib/live';
import { formatLiters } from '@/lib/format';
import { useDeviceUpdates, useTankSubscription } from '@/context/SocketContext';
import { useOceanAccent } from '@/context/OceanThemeContext';
import { colors, tankTypeMeta } from '@/theme/tokens';
import type { HistoryPoint, Tank } from '@/types';

const trendMeta: Record<Tank['trend'], { icon: typeof TrendingUp; color: string }> = {
  rising: { icon: TrendingUp, color: colors.success },
  falling: { icon: TrendingDown, color: colors.danger },
  stable: { icon: Minus, color: colors.textTertiary },
};

function buildHistory(logs: TelemetryRecord[], field: keyof TelemetryRecord, normalize: (v: number) => number): HistoryPoint[] {
  if (!logs.length) return [];
  return [...logs].reverse().map((log) => ({
    label: new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
    value: Math.max(0, Math.min(1, normalize(Number(log[field])))),
  }));
}

export function TankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tank, setTank] = useState<Tank | null>(null);
  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [rawTelemetry, setRawTelemetry] = useState<TelemetryRecord | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryRecord[]>([]);
  const [tankAlerts, setTankAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastWaterLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      let record;
      try { record = await api.tanks.get(id); }
      catch { if (!cancelled) navigate('/tanks', { replace: true }); return; }
      if (cancelled) return;

      let displayTank = toDisplayTank(record);
      let matchedDevice: DeviceRecord | null = null;
      let latestLog: TelemetryRecord | null = null;

      try {
        const devices = await api.devices.list();
        const match = devices.find((d) => d.tankId === id);
        if (match) {
          matchedDevice = match;
          const logs = await api.telemetry.logs(match.deviceId, 20);
          if (logs[0]) {
            latestLog = logs[0];
            lastWaterLevelRef.current = logs[0].waterLevel;
            displayTank = mergeLiveTank(displayTank, match, logs[0]);
          }
          if (!cancelled) {
            setTelemetryHistory(logs);
            setRawTelemetry(latestLog);
          }
        }
      } catch { /* fall back */ }

      // Load tank-specific alerts
      try {
        const allAlerts = await api.alerts.list();
        const filtered = allAlerts.filter((a) => {
          const tid = a.tankId;
          if (!tid) return false;
          return typeof tid === 'object' ? tid._id === id : tid === id;
        });
        if (!cancelled) setTankAlerts(filtered.slice(0, 5));
      } catch { /* non-critical */ }

      if (!cancelled) {
        setDevice(matchedDevice);
        setTank(displayTank);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  useTankSubscription(id);

  const handleDeviceUpdate = useCallback((payload: DeviceUpdatePayload) => {
    if (!id || payload.device.tankId !== id) return;
    setTank((prev) => (prev ? mergeLiveTank(prev, payload.device, payload.telemetry, lastWaterLevelRef.current) : prev));
    lastWaterLevelRef.current = payload.telemetry.waterLevel;
    setDevice(payload.device);
    setRawTelemetry(payload.telemetry);
  }, [id]);
  useDeviceUpdates(handleDeviceUpdate);
  useOceanAccent(tank?.type ?? null, tank?.connected ? tank.currentLevel : null);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-96" borderRadius={12} />
          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[88px]" borderRadius={12} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!tank) return null;

  const meta = tankTypeMeta[tank.type];
  const trend = trendMeta[tank.trend];
  const TrendIcon = trend.icon;

  // History arrays from real telemetry (or generated fallback)
  const levelHistory = telemetryHistory.length >= 3
    ? buildHistory(telemetryHistory, 'waterLevel', (v) => v)
    : generateHistory(tank.currentLevel, 0.18);

  const tempHistory = telemetryHistory.length >= 3
    ? buildHistory(telemetryHistory, 'temperature', (v) => v / 40)
    : generateHistory(tank.temperature / 40, 0.08);

  const phHistory = telemetryHistory.length >= 3
    ? buildHistory(telemetryHistory, 'ph', (v) => v / 14)
    : generateHistory(tank.ph / 14, 0.06);

  const doHistory = telemetryHistory.length >= 3
    ? buildHistory(telemetryHistory, 'dissolvedOxygen', (v) => v)
    : generateHistory(tank.dissolvedOxygen, 0.1);

  async function handleRemove() {
    if (!id) return;
    await api.tanks.remove(id);
    navigate('/tanks', { replace: true });
  }

  async function markAlertRead(alertId: string) {
    setTankAlerts((prev) => prev.map((a) => (a._id === alertId ? { ...a, read: true } : a)));
    try { await api.alerts.markRead(alertId, true); } catch { /* ignore */ }
  }

  return (
    <div className="w-full">
      {/* Back nav */}
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

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LEFT: 3D tank + health scores + actions */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 190 }}
            className="relative overflow-hidden rounded-2xl"
            style={{
              height: 380,
              border: `1px solid ${meta.accent}40`,
              boxShadow: `0 0 40px ${meta.accent}15, inset 0 1px 0 rgba(255,255,255,0.08)`,
            }}
          >
            {/* 3D canvas */}
            <TankDetail3D tank={tank} color={meta.accent} />

            {/* Top overlay: type badge + trend */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{
                  background: 'rgba(1,6,21,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${meta.accent}40`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.accent }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.accent, fontFamily: 'var(--font-body)' }}>
                  {meta.label}
                </span>
              </span>
              {tank.connected && (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: 'rgba(1,6,21,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${trend.color}40` }}
                >
                  <TrendIcon size={14} color={trend.color} />
                </span>
              )}
            </div>

            {/* Bottom overlay: level + status */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(1,6,21,0.82)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold leading-none" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                      {tank.connected ? `${Math.round(tank.currentLevel * 100)}%` : '—'}
                    </p>
                    <p className="mt-1 text-[11px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      {tank.connected
                        ? `${formatLiters(tank.capacityLiters * tank.currentLevel)} / ${formatLiters(tank.capacityLiters)}`
                        : `${formatLiters(tank.capacityLiters)} capacity`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {tank.connected ? (
                      <StatusPill status={tank.status} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5" style={{ backgroundColor: `${colors.textTertiary}1a`, borderColor: colors.glassBorder }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.textTertiary }} />
                        <span className="text-[10px] font-semibold" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>No Sensor</span>
                      </span>
                    )}
                    {device && (
                      <div className="flex items-center gap-1">
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: colors.success, display: 'inline-block' }}
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        />
                        <span className="text-[10px]" style={{ color: colors.success, fontFamily: 'var(--font-body)' }}>Live</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* fill bar */}
                {tank.connected && (
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(tank.currentLevel * 100)}%` }}
                      transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Health score trio */}
          {tank.connected && (
            <Reveal index={0}>
              <GlassSurface borderRadius={12} className="p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Health Scores
                </p>
                <div className="flex justify-around gap-2">
                  <ScoreGauge label="Tank" value={Math.round(tank.health * 100)} color={tank.health >= 0.7 ? colors.success : tank.health >= 0.4 ? colors.warning : colors.danger} />
                  <ScoreGauge label="Quality" value={Math.round(tank.quality * 100)} color={tank.quality >= 0.7 ? colors.success : tank.quality >= 0.4 ? colors.warning : colors.danger} />
                  {device && <ScoreGauge label="Sensor" value={device.healthScore} color={device.healthScore >= 70 ? colors.success : device.healthScore >= 40 ? colors.warning : colors.danger} />}
                </div>
              </GlassSurface>
            </Reveal>
          )}

          {/* Actions */}
          <Reveal index={1} className="flex flex-col gap-2">
            {!device && (
              <LiquidButton label="Connect a Sensor" variant="primary" icon={<Cpu size={16} color={colors.textInverse} />} onClick={() => navigate('/devices/add')} fullWidth />
            )}
            <LiquidButton
              label="View Analytics"
              variant={device ? 'primary' : 'glass'}
              icon={<BarChart3 size={16} color={device ? colors.textInverse : colors.textPrimary} />}
              onClick={() => navigate('/analytics')}
              fullWidth
            />
            <LiquidButton label="Schedule Maintenance" variant="ghost" icon={<Wrench size={16} color={colors.textPrimary} />} onClick={() => {}} fullWidth />
          </Reveal>
        </div>

        {/* RIGHT: Metrics + history + alerts */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {tank.connected ? (
            <>
              {/* Live metrics grid */}
              <Reveal index={0}>
                <SectionHeader title="Live Readings" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MetricOrbCard icon={<Thermometer size={20} color={colors.warning} />} label="Temperature" value={tank.temperature.toFixed(1)} unit="°C" percentage={tank.temperature / 40} color={colors.warning} />
                  <MetricOrbCard icon={<FlaskConical size={20} color={colors.seafoam} />} label="pH Level" value={tank.ph.toFixed(1)} percentage={tank.ph / 14} color={colors.seafoam} />
                  <MetricOrbCard icon={<Leaf size={20} color={colors.success} />} label="Dissolved O₂" value={`${Math.round(tank.dissolvedOxygen * 100)}`} unit="%" percentage={tank.dissolvedOxygen} color={colors.success} />
                  <MetricOrbCard icon={<Sparkles size={20} color={colors.electricBlue} />} label="Water Quality" value={`${Math.round(tank.quality * 100)}`} unit="%" percentage={tank.quality} color={colors.electricBlue} />
                  <MetricOrbCard icon={<Activity size={20} color={colors.aqua} />} label="Tank Health" value={`${Math.round(tank.health * 100)}`} unit="%" percentage={tank.health} color={colors.aqua} />
                  {/* Turbidity from raw telemetry */}
                  {rawTelemetry && (
                    <MetricOrbCard
                      icon={<Droplet size={20} color={colors.cyan} />}
                      label="Turbidity"
                      value={rawTelemetry.turbidity.toFixed(1)}
                      unit=" NTU"
                      percentage={Math.max(0, 1 - rawTelemetry.turbidity / 10)}
                      color={rawTelemetry.turbidity < 2 ? colors.success : rawTelemetry.turbidity < 5 ? colors.warning : colors.danger}
                    />
                  )}
                  {rawTelemetry && (
                    <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.cyan}22`, border: `1px solid ${colors.cyan}44` }}>
                        <Droplet size={16} color={colors.cyan} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>TDS</p>
                        <p className="text-lg font-bold" style={{ color: colors.cyan, fontFamily: 'var(--font-heading)' }}>
                          {Math.round(rawTelemetry.tds)}
                        </p>
                        <p className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>ppm</p>
                      </div>
                    </GlassSurface>
                  )}
                  {rawTelemetry && rawTelemetry.waterQuantity > 0 && (
                    <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${meta.accent}22`, border: `1px solid ${meta.accent}44` }}>
                        <Activity size={16} color={meta.accent} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>Quantity</p>
                        <p className="text-base font-bold" style={{ color: meta.accent, fontFamily: 'var(--font-heading)' }}>
                          {formatLiters(rawTelemetry.waterQuantity)}
                        </p>
                        <p className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>current</p>
                      </div>
                    </GlassSurface>
                  )}
                  {device && (
                    <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.cyan}22`, border: `1px solid ${colors.cyan}44` }}>
                        <Cpu size={16} color={colors.cyan} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>Sensor</p>
                        <p className="text-lg font-bold" style={{ color: colors.cyan, fontFamily: 'var(--font-heading)' }}>{device.healthScore}%</p>
                        <p className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>health</p>
                      </div>
                    </GlassSurface>
                  )}
                </div>
              </Reveal>

              {/* Historical analytics — 4 charts in 2x2 */}
              <Reveal index={1}>
                <SectionHeader title="Historical Trends" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      Water Level
                    </p>
                    <HistoryBarChart data={levelHistory} color={meta.accent} height={120} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      Temperature
                    </p>
                    <HistoryBarChart data={tempHistory} color={colors.warning} height={120} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      pH Level
                    </p>
                    <HistoryBarChart data={phHistory} color={colors.seafoam} height={120} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      Dissolved O₂
                    </p>
                    <HistoryBarChart data={doHistory} color={colors.success} height={120} />
                  </div>
                </div>
              </Reveal>

              {/* Tank-specific alerts */}
              {tankAlerts.length > 0 && (
                <Reveal index={2}>
                  <SectionHeader title={`Tank Alerts · ${tankAlerts.length}`} actionLabel="All alerts →" onAction={() => navigate('/alerts')} />
                  <div className="flex flex-col gap-2">
                    {tankAlerts.map((alert, i) => (
                      <Reveal key={alert._id} index={i}>
                        <AlertCard alert={alert} onMarkRead={!alert.read ? () => markAlertRead(alert._id) : undefined} />
                      </Reveal>
                    ))}
                  </div>
                </Reveal>
              )}
            </>
          ) : (
            <Reveal index={0}>
              <GlassSurface borderRadius={12} className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}>
                  <Cpu size={24} color={colors.textTertiary} />
                </span>
                <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  No sensor connected
                </p>
                <p className="max-w-xs text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Connect an IoT sensor to start seeing live water level, temperature, pH and quality readings.
                </p>
                <LiquidButton label="Connect a Sensor" variant="primary" icon={<Cpu size={16} color={colors.textInverse} />} onClick={() => navigate('/devices/add')} />
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

function ScoreGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <LiquidGauge size={60} percentage={value / 100} color={color} value={`${value}`} />
      <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
        {label}
      </p>
    </div>
  );
}
