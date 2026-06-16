import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertOctagon, Bell, CheckCircle2, Cpu, Droplet,
  Plus, TrendingDown, TrendingUp, Wifi, ArrowRight,
} from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { Skeleton } from '@/components/glass/Skeleton';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { Reveal } from '@/components/glass/Reveal';
import { LiquidGauge } from '@/components/water/LiquidGauge';
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

type NetworkStatus = 'nominal' | 'degraded' | 'critical' | 'offline';

const networkMeta: Record<NetworkStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  nominal:  { label: 'All Systems Nominal',  color: colors.success,      icon: CheckCircle2 },
  degraded: { label: 'Partially Degraded',   color: colors.warning,      icon: Activity },
  critical: { label: 'Attention Required',   color: colors.danger,       icon: AlertOctagon },
  offline:  { label: 'No Sensors Online',    color: colors.textTertiary, icon: Wifi },
};

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

  const networkStatus: NetworkStatus = !devices.length ? 'offline'
    : criticalAlerts.length > 0 ? 'critical'
    : devices.some((d) => d.status === 'offline') ? 'degraded'
    : 'nominal';

  const netMeta = networkMeta[networkStatus];
  const NetIcon = netMeta.icon;

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

      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length} tank{tanks.length !== 1 ? 's' : ''} monitored · {activeDevices.length} sensor{activeDevices.length !== 1 ? 's' : ''} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadAlerts.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: `${colors.warning}18`, border: `1px solid ${colors.warning}44` }}
            >
              <Bell size={18} color={colors.warning} />
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ backgroundColor: colors.warning, color: colors.textInverse }}
              >
                {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
              </span>
            </button>
          )}
          <LiquidButton
            label="Add Sensor"
            variant="primary"
            icon={<Plus size={15} color={colors.textInverse} />}
            onClick={() => navigate('/devices/add')}
          />
        </div>
      </div>

      {/* ── Hero: Water Health ────────────────────────────── */}
      {loading ? (
        <Skeleton className="mb-6 h-40 rounded-2xl" />
      ) : (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
        >
          <div
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${netMeta.color}44`,
              boxShadow: `0 0 40px ${netMeta.color}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            {/* Background glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 10% 50%, ${netMeta.color}12, transparent 60%)` }}
            />

            <div className="relative flex flex-wrap items-center gap-6">
              {/* Gauge */}
              <div className="flex items-center gap-5">
                <LiquidGauge
                  size={100}
                  percentage={waterHealth / 100}
                  color={waterHealth >= 70 ? colors.success : waterHealth >= 40 ? colors.warning : colors.danger}
                  value={`${waterHealth}`}
                  unit="%"
                  label="Quality"
                />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                    Water Health
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                    {waterHealth >= 70 ? 'Healthy' : waterHealth >= 40 ? 'Degraded' : waterHealth > 0 ? 'Critical' : 'No Data'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: `${netMeta.color}22` }}>
                      <NetIcon size={11} color={netMeta.color} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: netMeta.color, fontFamily: 'var(--font-body)' }}>
                      {netMeta.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden h-16 w-px self-center sm:block" style={{ backgroundColor: colors.glassBorder }} />

              {/* Mini stats */}
              <div className="flex flex-1 flex-wrap gap-6">
                <HeroStat label="System Health" value={`${systemHealth}%`}
                  color={systemHealth >= 70 ? colors.success : systemHealth >= 40 ? colors.warning : colors.danger}
                  icon={Cpu} />
                <HeroStat label="Active Sensors" value={`${activeDevices.length}`} color={colors.cyan} icon={Wifi} />
                <HeroStat label="Critical Alerts" value={`${criticalAlerts.length}`}
                  color={criticalAlerts.length > 0 ? colors.danger : colors.textTertiary}
                  icon={AlertOctagon} />
                <HeroStat label="Connected Tanks" value={`${connectedTanks.length}/${tanks.length}`}
                  color={colors.electricBlue} icon={Droplet} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Main grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* LEFT: Tanks */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              Tank Overview
            </h2>
            {tanks.length > 6 && (
              <button
                type="button"
                onClick={() => navigate('/tanks')}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                View all <ArrowRight size={12} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-56" />)}
            </div>
          ) : tanks.length === 0 ? (
            <div
              className="flex flex-col items-center gap-4 rounded-2xl p-12 text-center"
              style={{ background: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundImage: linearGradient(gradients.aquaGlow) }}
              >
                <Droplet size={28} color={colors.textInverse} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  No tanks yet
                </p>
                <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                  Add your first tank and connect a sensor to start live monitoring.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <LiquidButton label="Add Sensor" variant="primary" icon={<Plus size={15} color={colors.textInverse} />} onClick={() => navigate('/devices/add')} />
                <LiquidButton label="Add Tank Manually" variant="glass" icon={<Cpu size={15} color={colors.textPrimary} />} onClick={() => navigate('/tanks/new')} />
              </div>
            </div>
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

        {/* RIGHT: Alerts + sparklines + quick actions */}
        <div className="flex flex-col gap-5">

          {/* Alerts */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
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
                All <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (() => {
              const shown = criticalAlerts.length > 0 ? criticalAlerts.slice(0, 3) : alerts.slice(0, 3);
              if (!shown.length) {
                return (
                  <div
                    className="flex flex-col items-center gap-1 rounded-xl p-6 text-center"
                    style={{ background: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
                  >
                    <CheckCircle2 size={20} color={colors.success} />
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
                <h2 className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  7-Day Trends
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
                >
                  Analytics <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SparkCard label="Water Level"   data={sparkWaterLevel} color={colors.cyan}          format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Water Quality" data={sparkQuality}    color={colors.success}       format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Sensor Health" data={sparkHealth}     color={colors.electricBlue}  format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Temperature"   data={sparkTemp}       color={colors.warning}       format={(v) => `${(v * 40).toFixed(1)}°C`} />
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              Quick Actions
            </h2>
            <div
              className="flex flex-col gap-2 rounded-2xl p-3"
              style={{ background: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
            >
              <LiquidButton label="Add Sensor" variant="primary" icon={<Plus size={15} color={colors.textInverse} />} fullWidth onClick={() => navigate('/devices/add')} />
              <LiquidButton label="Add Tank Manually" variant="glass" icon={<Cpu size={15} color={colors.textPrimary} />} fullWidth onClick={() => navigate('/tanks/new')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: typeof Cpu }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}33` }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          {value}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function SparkCard({ label, data, color, format }: { label: string; data: number[]; color: string; format: (v: number) => string }) {
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const last = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-xl p-3"
      style={{
        background: `${color}0A`,
        border: `1px solid ${color}22`,
      }}
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
