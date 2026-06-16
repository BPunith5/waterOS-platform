import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertOctagon, Bell, CheckCircle2, Cpu, Droplet, Plus, TrendingDown, TrendingUp, Wifi } from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { Reveal } from '@/components/glass/Reveal';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { LiquidGauge } from '@/components/water/LiquidGauge';
import { Sparkline } from '@/components/water/Sparkline';
import { TankGridCard } from '@/components/water/TankGridCard';
import { useAuth } from '@/context/AuthContext';
import { useAlertUpdates, useDeviceUpdates, useTanksSubscription } from '@/context/SocketContext';
import { api, type AlertRecord, type AnalyticsResponse, type DeviceRecord, type DeviceUpdatePayload } from '@/lib/api';
import { mergeLiveTank } from '@/lib/live';
import { toDisplayTank } from '@/lib/placeholder';
import { colors } from '@/theme/tokens';
import type { Tank } from '@/types';

type NetworkStatus = 'nominal' | 'degraded' | 'critical' | 'offline';

const networkMeta: Record<NetworkStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  nominal: { label: 'All Systems Nominal', color: colors.success, icon: CheckCircle2 },
  degraded: { label: 'Partially Degraded', color: colors.warning, icon: Activity },
  critical: { label: 'Attention Required', color: colors.danger, icon: AlertOctagon },
  offline: { label: 'No Devices Online', color: colors.textTertiary, icon: Wifi },
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
          let displayTank = toDisplayTank(record);
          const match = deviceRecords.find((d) => d.tankId === record._id);
          if (match) {
            try {
              const logs = await api.telemetry.logs(match.deviceId, 1);
              if (logs[0]) {
                lastLevelsRef.current.set(record._id, logs[0].waterLevel);
                displayTank = mergeLiveTank(displayTank, match, logs[0]);
              }
            } catch { /* live data unavailable */ }
          }
          return displayTank;
        }),
      );

      setDevices(deviceRecords);
      setAlerts(alertRecords);
      setTanks(displayTanks);
      setLoading(false);

      try {
        const analyticsData = await api.analytics.get('7D');
        setAnalytics(analyticsData);
      } catch { /* non-critical */ }
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

  const networkStatus: NetworkStatus = !devices.length
    ? 'offline'
    : criticalAlerts.length > 0
      ? 'critical'
      : devices.some((d) => d.status === 'offline')
        ? 'degraded'
        : 'nominal';

  const netMeta = networkMeta[networkStatus];
  const NetIcon = netMeta.icon;

  const sparkWaterLevel = analytics?.series.map((p) => p.waterLevel) ?? [];
  const sparkQuality = analytics?.series.map((p) => p.quality) ?? [];
  const sparkDeviceHealth = analytics?.series.map((p) => (p.battery + p.signal) / 200) ?? [];
  const sparkTemp = analytics?.series.map((p) => p.temperature / 40) ?? [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="w-full">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {greeting}{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length} tank{tanks.length !== 1 ? 's' : ''} · {activeDevices.length} active sensor{activeDevices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadAlerts.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="relative flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.warning}22`, border: `1px solid ${colors.warning}44` }}
            >
              <Bell size={16} color={colors.warning} />
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ backgroundColor: colors.warning, color: colors.textInverse }}
              >
                {unreadAlerts.length}
              </span>
            </button>
          )}
          <LiquidButton
            label="Add Tank"
            variant="primary"
            icon={<Plus size={16} color={colors.textInverse} />}
            onClick={() => navigate('/tanks/new')}
          />
        </div>
      </div>

      {/* ── Infrastructure Health Hero ───────────────────── */}
      {loading ? (
        <Skeleton className="mb-5 h-36" />
      ) : (
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        >
          <GlassSurface borderRadius={16} className="p-5" style={{ borderLeft: `3px solid ${netMeta.color}` }}>
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-4">
                <LiquidGauge
                  size={88}
                  percentage={waterHealth / 100}
                  color={waterHealth >= 70 ? colors.success : waterHealth >= 40 ? colors.warning : colors.danger}
                  value={`${waterHealth}`}
                  unit="%"
                  label="Water"
                />
                <div>
                  <p className="text-xs uppercase tracking-widest" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                    Infrastructure
                  </p>
                  <p className="text-xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                    Water Health
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <NetIcon size={12} color={netMeta.color} />
                    <span className="text-sm font-semibold" style={{ color: netMeta.color, fontFamily: 'var(--font-body)' }}>
                      {netMeta.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden h-14 w-px sm:block" style={{ backgroundColor: colors.glassBorder }} />

              <div className="flex flex-1 flex-wrap gap-5">
                <MiniStat label="System Health" value={`${systemHealth}%`} color={systemHealth >= 70 ? colors.success : systemHealth >= 40 ? colors.warning : colors.danger} icon={Cpu} />
                <MiniStat label="Active Sensors" value={`${activeDevices.length}`} color={colors.cyan} icon={Wifi} />
                <MiniStat label="Critical Alerts" value={`${criticalAlerts.length}`} color={criticalAlerts.length > 0 ? colors.danger : colors.textTertiary} icon={AlertOctagon} />
                <MiniStat label="Connected Tanks" value={`${connectedTanks.length}/${tanks.length}`} color={colors.electricBlue} icon={Droplet} />
              </div>
            </div>
          </GlassSurface>
        </motion.div>
      )}

      {/* ── Main two-column grid ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT: Tank grid */}
        <div className="lg:col-span-2">
          <SectionHeader
            title="Tank Overview"
            actionLabel={tanks.length > 6 ? 'View all →' : undefined}
            onAction={() => navigate('/tanks')}
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-52" />)}
            </div>
          ) : tanks.length === 0 ? (
            <GlassSurface borderRadius={12} className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                No tanks yet
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                Add your first tank, then connect a sensor to start monitoring live data.
              </p>
              <div className="flex flex-wrap gap-2">
                <LiquidButton label="Add Tank" variant="primary" icon={<Plus size={16} color={colors.textInverse} />} onClick={() => navigate('/tanks/new')} />
                <LiquidButton label="Connect Sensor" variant="glass" icon={<Cpu size={16} color={colors.textPrimary} />} onClick={() => navigate('/devices/add')} />
              </div>
            </GlassSurface>
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

        {/* RIGHT: Alerts + sparklines */}
        <div className="flex flex-col gap-5">
          <div>
            <SectionHeader
              title={criticalAlerts.length > 0 ? `Critical · ${criticalAlerts.length}` : 'Recent Alerts'}
              actionLabel="All →"
              onAction={() => navigate('/alerts')}
            />
            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (() => {
              const shown = criticalAlerts.length > 0 ? criticalAlerts.slice(0, 3) : alerts.slice(0, 3);
              if (!shown.length) {
                return (
                  <GlassSurface borderRadius={12} className="px-4 py-5 text-center">
                    <p className="text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                      All clear — no alerts
                    </p>
                  </GlassSurface>
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

          {/* 7-Day sparklines */}
          {!loading && analytics && analytics.series.length > 0 && (
            <div>
              <SectionHeader title="7-Day Trends" actionLabel="Analytics →" onAction={() => navigate('/analytics')} />
              <div className="grid grid-cols-2 gap-2">
                <SparkCard label="Water Level" data={sparkWaterLevel} color={colors.cyan} format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Water Quality" data={sparkQuality} color={colors.success} format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Device Health" data={sparkDeviceHealth} color={colors.electricBlue} format={(v) => `${Math.round(v * 100)}%`} />
                <SparkCard label="Temperature" data={sparkTemp} color={colors.warning} format={(v) => `${Math.round(v * 40)}°C`} />
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <SectionHeader title="Quick Actions" />
            <GlassSurface borderRadius={12} className="flex flex-col gap-2 p-3">
              <LiquidButton label="Add Tank" variant="glass" icon={<Plus size={16} color={colors.textPrimary} />} fullWidth onClick={() => navigate('/tanks/new')} />
              <LiquidButton label="Connect Sensor" variant="glass" icon={<Cpu size={16} color={colors.textPrimary} />} fullWidth onClick={() => navigate('/devices/add')} />
            </GlassSurface>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: typeof Cpu }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          {value}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
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
    <GlassSurface borderRadius={10} className="flex flex-col gap-1 p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
        {trend >= 0 ? <TrendingUp size={9} color={colors.success} /> : <TrendingDown size={9} color={colors.danger} />}
      </div>
      <Sparkline data={data} color={color} width={100} height={26} trendColor />
      {last !== null && (
        <p className="text-sm font-bold leading-none" style={{ color, fontFamily: 'var(--font-heading)' }}>
          {format(last)}
        </p>
      )}
    </GlassSurface>
  );
}
