import type { Tank, TankStatus } from '@/types';
import type { DeviceRecord, TelemetryRecord } from './api';
import { formatRelativeTime } from './format';

/**
 * Overlays live device telemetry onto a tank's display data, replacing
 * the seeded-placeholder readings once a device is connected and reporting.
 */
export function mergeLiveTank(
  base: Tank,
  device: DeviceRecord,
  telemetry: TelemetryRecord,
  previousWaterLevel?: number | null,
): Tank {
  const currentLevel = telemetry.waterLevel;
  const health = device.healthScore / 100;
  const quality = Math.max(
    0,
    Math.min(
      1,
      (telemetry.dissolvedOxygen +
        Math.max(0, 1 - telemetry.turbidity / 10) +
        Math.max(0, 1 - Math.abs(telemetry.ph - 7) / 3.5)) /
        3,
    ),
  );

  const status: TankStatus =
    currentLevel < 0.2 || health < 0.5 ? 'critical' : currentLevel < 0.4 || health < 0.7 ? 'warning' : 'optimal';

  let trend = base.trend;
  if (previousWaterLevel != null) {
    const delta = currentLevel - previousWaterLevel;
    trend = delta > 0.005 ? 'rising' : delta < -0.005 ? 'falling' : 'stable';
  }

  return {
    ...base,
    currentLevel,
    health,
    temperature: telemetry.temperature,
    ph: telemetry.ph,
    dissolvedOxygen: telemetry.dissolvedOxygen,
    quality,
    status,
    trend,
    lastUpdated: formatRelativeTime(telemetry.timestamp),
    connected: true,
  };
}
