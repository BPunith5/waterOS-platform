import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import {
  Activity, AlertOctagon, ArrowRight, Bell, CheckCircle2,
  Cpu, Droplet, Plus, Sparkles, TrendingDown, TrendingUp, Wifi,
} from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { Skeleton } from '@/components/glass/Skeleton';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { Reveal } from '@/components/glass/Reveal';
import { Sparkline } from '@/components/water/Sparkline';
import { TankGridCard } from '@/components/water/TankGridCard';
import { useAuth } from '@/context/AuthContext';
import { useAlertUpdates, useDeviceUpdates, useTanksSubscription } from '@/context/SocketContext';
import { api, type AlertRecord, type AnalyticsResponse, type DeviceRecord, type DeviceUpdatePayload } from '@/lib/api';
import { mergeLiveTank } from '@/lib/live';
import { toDisplayTank } from '@/lib/placeholder';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import type { Tank } from '@/types';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tanks, setTanks] = useState<Tank[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLevelsRef = useRef<Map<string, number | null>>(new Map());

  useEffect(() => {
    (async () => {
      const [tankRecords, deviceRecords, alertRecords] = await Promise.all([
        api.tanks.list(),
        api.devices.list(),
        api.alerts.list(),
      ]);
      const displayTanks = await Promise.all(
        tankRecords.map(async (record) => {
          let dt = toDisplayTank(record);
          const match = deviceRecords.find((d) => d.tankId === record._id);
          if (match) {
            try {
              const logs = await api.telemetry.logs(match.deviceId, 1);
              if (logs[0]) {
                lastLevelsRef.current.set(record._id, logs[0].waterLevel);
                dt = mergeLiveTank(dt, match, logs[0]);
              }
            } catch { /* live unavailable */ }
          }
          return dt;
        }),
      );
      setDevices(deviceRecords);
      setAlerts(alertRecords);
      setTanks(displayTanks);
      setLoading(false);
      try { setAnalytics(await api.analytics.get('7D')); } catch { /* non-critical */ }
    })();
  }, []);

  useTanksSubscription(tanks.map((t) => t.id));

  const handleDeviceUpdate = useCallback((payload: DeviceUpdatePayload) => {
    const tankId = payload.device.tankId;
    if (!tankId) return;
    setTanks((prev) =>
      prev.map((t) => {
        if (t.id !== tankId) return t;
        const merged = mergeLiveTank(t, payload.device, payload.telemetry, lastLevelsRef.current.get(tankId) ?? null);
        lastLevelsRef.current.set(tankId, payload.telemetry.waterLevel);
        return merged;
      }),
    );
    setDevices((prev) => prev.map((d) => (d._id === payload.device._id ? payload.device : d)));
  }, []);
  useDeviceUpdates(handleDeviceUpdate);

  const handleNewAlert = useCallback((alert: AlertRecord) => {
    setAlerts((prev) => [alert, ...prev.filter((a) => a._id !== alert._id)]);
  }, []);
  useAlertUpdates(handleNewAlert);

  async function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
    try { await api.alerts.markRead(id, true); }
    catch { setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: false } : a))); }
  }

  const connectedTanks = tanks.filter((t) => t.connected);
  const activeDevices = devices.filter((d) => d.status === 'active');
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.read);
  const unreadAlerts = alerts.filter((a) => !a.read);

  const waterHealth = connectedTanks.length > 0
    ? Math.round((connectedTanks.reduce((s, t) => s + t.quality, 0) / connectedTanks.length) * 100)
    : 0;

  const systemHealth = activeDevices.length > 0
    ? Math.round(activeDevices.reduce((s, d) => s + d.healthScore, 0) / activeDevices.length)
    : 0;

  const allNominal = criticalAlerts.length === 0 && !devices.some((d) => d.status === 'offline') && devices.length > 0;

  const sparkWaterLevel = analytics?.series.map((p) => p.waterLevel) ?? [];
  const sparkQuality    = analytics?.series.map((p) => p.quality)    ?? [];
  const sparkHealth     = analytics?.series.map((p) => (p.battery + p.signal) / 200) ?? [];
  const sparkTemp       = analytics?.series.map((p) => p.temperature / 40) ?? [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="w-full">

      {/* ── Page Header ────────────────────────────── */}
      <motion.div
        className="mb-7 flex flex-wrap items-start justify-between gap-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
          >
            {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {loading
              ? 'Loading fleet…'
              : `${tanks.length} tank${tanks.length !== 1 ? 's' : ''} · ${activeDevices.length} sensor${activeDevices.length !== 1 ? 's' : ''} active`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadAlerts.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: `${colors.warning}18`, border: `1px solid ${colors.warning}40` }}
            >
              <Bell size={17} color={colors.warning} />
              <span
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ backgroundColor: colors.warning, color: colors.textInverse }}
              >
                {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
              </span>
            </button>
          )}
          <LiquidButton
            label="Add Sensor"
            variant="primary"
            icon={<Plus size={14} color={colors.textInverse} />}
            onClick={() => navigate('/devices/add')}
          />
        </div>
      </motion.div>

      {/* ── Metrics Strip ────────────────────────── */}
      {loading ? (
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[100px] rounded-2xl" />)}
        </div>
      ) : (
        <motion.div
          className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
        >
          <DashStat
            label="Water Quality"
            value={connectedTanks.length > 0 ? `${waterHealth}%` : '—'}
            color={connectedTanks.length > 0 ? (waterHealth >= 70 ? colors.success : waterHealth >= 40 ? colors.warning : colors.danger) : colors.textTertiary}
            icon={Sparkles}
          />
          <DashStat
            label="Active Sensors"
            value={`${activeDevices.length}`}
            color={activeDevices.length > 0 ? colors.cyan : colors.textTertiary}
            icon={Wifi}
          />
          <DashStat
            label="Critical Alerts"
            value={`${criticalAlerts.length}`}
            color={criticalAlerts.length > 0 ? colors.danger : colors.success}
            icon={criticalAlerts.length > 0 ? AlertOctagon : CheckCircle2}
          />
          <DashStat
            label="System Health"
            value={activeDevices.length > 0 ? `${systemHealth}%` : '—'}
            color={activeDevices.length > 0 ? (allNominal ? colors.success : systemHealth >= 40 ? colors.warning : colors.danger) : colors.textTertiary}
            icon={allNominal ? CheckCircle2 : Activity}
          />
        </motion.div>
      )}

      {/* ── Main Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* LEFT: Fleet */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
              >
                Fleet Overview
              </h2>
              {!loading && tanks.length > 0 && (
                <p className="mt-0.5 text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  {connectedTanks.length} of {tanks.length} live
                </p>
              )}
            </div>
            {tanks.length > 6 && (
              <button
                type="button"
                onClick={() => navigate('/tanks')}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                View all <ArrowRight size={11} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[250px] rounded-2xl" />)}
            </div>
          ) : tanks.length === 0 ? (
            <EmptyFleet onAddSensor={() => navigate('/devices/add')} onAddTank={() => navigate('/tanks/new')} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tanks.slice(0, 6).map((tank, i) => (
                <Reveal key={tank.id} index={i}>
                  <TankGridCard tank={tank} onClick={() => navigate(`/tanks/${tank.id}`)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Alerts + Sparklines + Actions */}
        <div className="flex flex-col gap-5">

          {/* Alerts */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
              >
                {criticalAlerts.length > 0
                  ? <span style={{ color: colors.danger }}>Critical · {criticalAlerts.length}</span>
                  : 'Recent Alerts'}
              </h2>
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                All <ArrowRight size={11} />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : (() => {
              const shown = criticalAlerts.length > 0 ? criticalAlerts.slice(0, 3) : alerts.slice(0, 3);
              if (!shown.length) {
                return (
                  <div
                    className="flex flex-col items-center gap-1 rounded-xl p-5 text-center"
                    style={{ background: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
                  >
                    <CheckCircle2 size={18} color={colors.success} />
                    <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>All clear</p>
                    <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>No active alerts</p>
                  </div>
                );
              }
              return (
                <div className="flex flex-col gap-2">
                  {shown.map((alert, i) => (
                    <Reveal key={alert._id} index={i}>
                      <AlertCard alert={alert} onMarkRead={!alert.read ? () => markRead(alert._id) : undefined} />
                    </Reveal>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* 7-day sparklines */}
          {!loading && analytics && analytics.series.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
                >
                  7-Day Trends
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
                >
                  Analytics <ArrowRight size={11} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SparkCard label="Water Level"   data={sparkWaterLevel} color={colors.cyan}         format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Water Quality" data={sparkQuality}    color={colors.success}      format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Sensor Health" data={sparkHealth}     color={colors.electricBlue} format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Temperature"   data={sparkTemp}       color={colors.warning}      format={(v) => `${(v * 40).toFixed(1)}°C`} />
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <h2
              className="mb-3 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
            >
              Quick Actions
            </h2>
            <div
              className="flex flex-col gap-2 rounded-2xl p-3"
              style={{ background: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
            >
              <LiquidButton label="Add Sensor" variant="primary" icon={<Plus size={14} color={colors.textInverse} />} fullWidth onClick={() => navigate('/devices/add')} />
              <LiquidButton label="Add Tank Manually" variant="glass" icon={<Cpu size={14} color={colors.textPrimary} />} fullWidth onClick={() => navigate('/tanks/new')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DashStat ─────────────────────────────────────── */
function DashStat({
  label, value, color, icon: Icon,
}: { label: string; value: string; color: string; icon: typeof Cpu }) {
  const numericMatch = value.match(/^(\d+)/);
  const numeric = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const suffix = numericMatch ? value.slice(numericMatch[1].length) : value;
  const animated = useCountUp(numeric, 900);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        borderColor: hovered ? `${color}50` : `${color}16`,
        boxShadow: hovered
          ? `0 0 28px ${color}20, 0 6px 24px rgba(0,0,0,0.45)`
          : '0 2px 12px rgba(0,0,0,0.3)',
        y: hovered ? -2 : 0,
      }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: `linear-gradient(145deg, ${color}08 0%, rgba(2,8,20,0.97) 100%)`,
        border: `1px solid ${color}16`,
      }}
    >
      {/* corner glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-24 w-24"
        style={{ background: `radial-gradient(circle at 100% 0%, ${color}14, transparent 68%)` }}
      />

      <div className="relative">
        <motion.div
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}28` }}
          animate={{ boxShadow: hovered ? `0 0 18px ${color}45` : 'none' }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={16} color={color} />
        </motion.div>

        <p
          className="text-[26px] font-bold leading-none tabular-nums"
          style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
        >
          {numericMatch ? `${animated}${suffix}` : value}
        </p>
        <p
          className="mt-1.5 text-[11px] font-medium"
          style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
        >
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/* ── SparkCard ────────────────────────────────────── */
function SparkCard({
  label, data, color, format,
}: { label: string; data: number[]; color: string; format: (v: number) => string }) {
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const last = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-xl p-3"
      style={{ background: `${color}0a`, border: `1px solid ${color}20` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-wider" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
        {trend >= 0
          ? <TrendingUp size={10} color={colors.success} />
          : <TrendingDown size={10} color={colors.danger} />}
      </div>
      <Sparkline data={data} color={color} width={100} height={28} trendColor />
      {last !== null && (
        <p className="text-sm font-bold leading-none" style={{ color, fontFamily: 'var(--font-heading)' }}>
          {format(last)}
        </p>
      )}
    </div>
  );
}

/* ── EmptyFleet ───────────────────────────────────── */
function EmptyFleet({ onAddSensor, onAddTank }: { onAddSensor: () => void; onAddTank: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-5 rounded-2xl p-12 text-center"
      style={{ background: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundImage: linearGradient(gradients.aquaGlow) }}
        animate={{ boxShadow: [`0 0 20px ${colors.cyan}40`, `0 0 36px ${colors.cyan}60`, `0 0 20px ${colors.cyan}40`] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Droplet size={28} color={colors.textInverse} />
      </motion.div>
      <div>
        <p className="text-lg font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          No tanks yet
        </p>
        <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Add your first tank and connect a sensor to start live monitoring.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <LiquidButton label="Add Sensor" variant="primary" icon={<Plus size={14} color={colors.textInverse} />} onClick={onAddSensor} />
        <LiquidButton label="Add Tank Manually" variant="glass" icon={<Cpu size={14} color={colors.textPrimary} />} onClick={onAddTank} />
      </div>
    </motion.div>
  );
}
