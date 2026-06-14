import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Cpu, Droplet, Plus } from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { Reveal } from '@/components/glass/Reveal';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { StatCard } from '@/components/glass/StatCard';
import { TankListCard } from '@/components/water/TankListCard';
import { useAuth } from '@/context/AuthContext';
import { useAlertUpdates, useDeviceUpdates, useTanksSubscription } from '@/context/SocketContext';
import { api, type AlertRecord, type DeviceRecord, type DeviceUpdatePayload } from '@/lib/api';
import { mergeLiveTank } from '@/lib/live';
import { toDisplayTank } from '@/lib/placeholder';
import { colors, radius } from '@/theme/tokens';
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
              // live data unavailable; fall back to placeholder readings
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
  const recentAlerts = (unreadAlerts.length > 0 ? unreadAlerts : alerts).slice(0, 3);
  const visibleTanks = tanks.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Here's how your water systems are doing.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatCard icon={Droplet} value={`${tanks.length}`} label={`Tank${tanks.length === 1 ? '' : 's'}`} color={colors.cyan} />
        <StatCard icon={Cpu} value={`${activeDevices}`} label="Active Devices" color={colors.success} />
        <StatCard icon={Bell} value={`${unreadAlerts.length}`} label="Unread Alerts" color={unreadAlerts.length > 0 ? colors.warning : colors.textTertiary} />
      </div>

      <div className="mb-8">
        <SectionHeader title="Your Tanks" actionLabel={tanks.length > 0 ? 'View All' : undefined} onAction={() => navigate('/tanks')} />
        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : tanks.length === 0 ? (
          <GlassSurface borderRadius={radius.xl} className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              No tanks yet
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
              Add your first tank to start monitoring water levels and quality.
            </p>
            <LiquidButton label="Add a Tank" variant="primary" icon={<Plus size={18} color={colors.textInverse} />} onClick={() => navigate('/tanks/new')} />
          </GlassSurface>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleTanks.map((tank, i) => (
              <Reveal key={tank.id} index={i}>
                <TankListCard tank={tank} onClick={() => navigate(`/tanks/${tank.id}`)} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {!loading && alerts.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Recent Alerts" actionLabel="View All" onAction={() => navigate('/alerts')} />
          <div className="flex flex-col gap-3">
            {recentAlerts.map((alert, i) => (
              <Reveal key={alert._id} index={i}>
                <AlertCard alert={alert} onMarkRead={!alert.read ? () => markRead(alert._id) : undefined} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
