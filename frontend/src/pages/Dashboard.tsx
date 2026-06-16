import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Bell, Cpu, Droplet, Plus } from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { Reveal } from '@/components/glass/Reveal';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { StatCard } from '@/components/glass/StatCard';
import { TankGridCard } from '@/components/water/TankGridCard';
import { useAuth } from '@/context/AuthContext';
import { useAlertUpdates, useDeviceUpdates, useTanksSubscription } from '@/context/SocketContext';
import { api, type AlertRecord, type DeviceRecord, type DeviceUpdatePayload } from '@/lib/api';
import { mergeLiveTank } from '@/lib/live';
import { toDisplayTank } from '@/lib/placeholder';
import { colors } from '@/theme/tokens';
import type { Tank } from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tanks, setTanks] = useState<Tank[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
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
            } catch {
              // live data unavailable
            }
          }
          return displayTank;
        }),
      );

      setDevices(deviceRecords);
      setAlerts(alertRecords);
      setTanks(displayTanks);
      setLoading(false);
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
    try {
      await api.alerts.markRead(id, true);
    } catch {
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: false } : a)));
    }
  }

  const activeDevices = devices.filter((d) => d.status === 'active').length;
  const unreadAlerts = alerts.filter((a) => !a.read);
  const recentAlerts = (unreadAlerts.length > 0 ? unreadAlerts : alerts).slice(0, 5);
  const connectedTanks = tanks.filter((t) => t.connected);
  const avgQuality =
    connectedTanks.length > 0
      ? Math.round((connectedTanks.reduce((s, t) => s + t.quality, 0) / connectedTanks.length) * 100)
      : null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="w-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
          >
            {greeting}{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length} tank{tanks.length !== 1 ? 's' : ''} monitored · {activeDevices} sensor{activeDevices !== 1 ? 's' : ''} active
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

      {/* ── Stat row ──────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Droplet} value={`${tanks.length}`} label={`Tank${tanks.length !== 1 ? 's' : ''}`} color={colors.cyan} />
        <StatCard icon={Cpu} value={`${activeDevices}`} label="Sensors Active" color={colors.success} />
        <StatCard
          icon={Bell}
          value={`${unreadAlerts.length}`}
          label="Active Alerts"
          color={unreadAlerts.length > 0 ? colors.warning : colors.textTertiary}
        />
        <StatCard
          icon={Activity}
          value={avgQuality != null ? `${avgQuality}%` : '—'}
          label="Avg Quality"
          color={colors.aqua}
        />
      </div>

      {/* ── Main two-column grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT: Tank overview (2/3 of space on large screens) */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="Tank Overview" />
            {tanks.length > 6 && (
              <button
                type="button"
                onClick={() => navigate('/tanks')}
                className="text-xs font-medium"
                style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
              >
                View all →
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
          ) : tanks.length === 0 ? (
            <GlassSurface borderRadius={12} className="flex flex-col items-center gap-3 p-10 text-center">
              <p
                className="text-base font-semibold"
                style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
              >
                No tanks yet
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                Add your first tank, then connect a sensor to start monitoring live data.
              </p>
              <div className="flex flex-wrap gap-2">
                <LiquidButton
                  label="Add Tank"
                  variant="primary"
                  icon={<Plus size={16} color={colors.textInverse} />}
                  onClick={() => navigate('/tanks/new')}
                />
                <LiquidButton
                  label="Connect Sensor"
                  variant="glass"
                  icon={<Cpu size={16} color={colors.textPrimary} />}
                  onClick={() => navigate('/devices/add')}
                />
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

        {/* RIGHT: Alerts + quick actions (1/3 of space) */}
        <div className="flex flex-col gap-5">
          {/* Alert feed */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeader title="Alert Feed" />
              {alerts.length > 5 && (
                <button
                  type="button"
                  onClick={() => navigate('/alerts')}
                  className="text-xs font-medium"
                  style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
                >
                  View all →
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : recentAlerts.length === 0 ? (
              <GlassSurface borderRadius={12} className="px-4 py-6 text-center">
                <p className="text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  All clear — no active alerts
                </p>
              </GlassSurface>
            ) : (
              <div className="flex flex-col gap-2">
                {recentAlerts.map((alert, i) => (
                  <Reveal key={alert._id} index={i}>
                    <AlertCard
                      alert={alert}
                      onMarkRead={!alert.read ? () => markRead(alert._id) : undefined}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <SectionHeader title="Quick Actions" />
            <GlassSurface borderRadius={12} className="flex flex-col gap-2 p-3">
              <LiquidButton
                label="Add Tank"
                variant="glass"
                icon={<Plus size={16} color={colors.textPrimary} />}
                fullWidth
                onClick={() => navigate('/tanks/new')}
              />
              <LiquidButton
                label="Connect Sensor"
                variant="glass"
                icon={<Cpu size={16} color={colors.textPrimary} />}
                fullWidth
                onClick={() => navigate('/devices/add')}
              />
            </GlassSurface>
          </div>
        </div>
      </div>
    </div>
  );
}
