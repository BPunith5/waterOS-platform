import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, Map as MapIcon, Plus, Wifi, WifiOff } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { Reveal } from '@/components/glass/Reveal';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { StatCard } from '@/components/glass/StatCard';
import { DeviceCard } from '@/components/device/DeviceCard';
import { DeviceDetailsModal } from '@/components/device/DeviceDetailsModal';
import { api, type DeviceRecord, type TankRecord } from '@/lib/api';
import { colors } from '@/theme/tokens';

export function DevicesPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [gpsMap, setGpsMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [detailsDevice, setDetailsDevice] = useState<DeviceRecord | null>(null);

  useEffect(() => {
    Promise.all([api.devices.list(), api.tanks.list()])
      .then(async ([deviceRecords, tankRecords]) => {
        setDevices(deviceRecords);
        setTanks(tankRecords);

        // Check GPS for active devices
        const gpsResults: Record<string, boolean> = {};
        await Promise.all(
          deviceRecords
            .filter((d) => d.status === 'active')
            .map(async (d) => {
              try {
                const [log] = await api.telemetry.logs(d.deviceId, 1);
                gpsResults[d._id] = !!(log?.lat && log?.lng && log.lat !== 0 && log.lng !== 0);
              } catch {
                gpsResults[d._id] = false;
              }
            }),
        );
        setGpsMap(gpsResults);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = devices.filter((d) => d.status === 'active').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;
  const pendingCount = devices.filter((d) => d.status === 'pending').length;
  const gpsCount = Object.values(gpsMap).filter(Boolean).length;

  function tankName(tankId: string | null) {
    if (!tankId) return null;
    return tanks.find((t) => t._id === tankId)?.tankName ?? null;
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            Devices
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {devices.length} registered · {activeCount} active
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton icon={MapIcon} onClick={() => navigate('/map')} />
          <IconButton icon={Plus} onClick={() => navigate('/devices/add')} />
        </div>
      </div>

      {/* Stat row */}
      {!loading && devices.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Cpu} value={`${activeCount}`} label="Active" color={colors.success} />
          <StatCard icon={WifiOff} value={`${offlineCount}`} label="Offline" color={offlineCount > 0 ? colors.danger : colors.textTertiary} />
          <StatCard icon={Activity} value={`${pendingCount}`} label="Pending" color={colors.warning} />
          <StatCard icon={Wifi} value={`${gpsCount}`} label="GPS Active" color={colors.cyan} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : devices.length === 0 ? (
        <GlassSurface className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            No devices yet
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            Register a sensor and connect it to a tank to start streaming live readings.
          </p>
        </GlassSurface>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {devices.map((device, i) => (
            <Reveal key={device._id} index={i}>
              <DeviceCard
                device={device}
                tankName={tankName(device.tankId)}
                gpsAvailable={gpsMap[device._id] ?? false}
                onClick={() => { if (device.tankId) navigate(`/tanks/${device.tankId}`); }}
                onConnect={() => navigate(`/devices/add?step=connect&deviceId=${device.deviceId}&pin=${device.activationPin ?? ''}`)}
                onShowDetails={() => setDetailsDevice(device)}
                onViewMap={() => navigate('/map')}
              />
            </Reveal>
          ))}
        </div>
      )}

      <DeviceDetailsModal device={detailsDevice} tankName={tankName(detailsDevice?.tankId ?? null)} onClose={() => setDetailsDevice(null)} />
    </div>
  );
}
