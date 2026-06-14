import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, Plus } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { Reveal } from '@/components/glass/Reveal';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { DeviceCard } from '@/components/device/DeviceCard';
import { api, type DeviceRecord, type TankRecord } from '@/lib/api';
import { colors } from '@/theme/tokens';

export function DevicesPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.devices.list(), api.tanks.list()])
      .then(([deviceRecords, tankRecords]) => {
        setDevices(deviceRecords);
        setTanks(tankRecords);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = devices.filter((d) => d.status === 'active').length;

  function tankName(tankId: string | null) {
    if (!tankId) return null;
    return tanks.find((t) => t._id === tankId)?.tankName ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            Your Devices
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {devices.length} device{devices.length === 1 ? '' : 's'} · {activeCount} active
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton icon={MapIcon} onClick={() => navigate('/map')} />
          <IconButton icon={Plus} onClick={() => navigate('/devices/add')} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <GlassSurface key={i} className="h-36 animate-pulse" />
          ))}
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
        <div className="flex flex-col gap-4">
          {devices.map((device, i) => (
            <Reveal key={device._id} index={i}>
              <DeviceCard
                device={device}
                tankName={tankName(device.tankId)}
                onClick={() => {
                  if (device.tankId) navigate(`/tanks/${device.tankId}`);
                }}
                onConnect={() =>
                  navigate(`/devices/add?step=connect&deviceId=${device.deviceId}&pin=${device.activationPin ?? ''}`)
                }
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
