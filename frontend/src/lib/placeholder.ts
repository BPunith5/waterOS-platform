import type { HistoryPoint, Tank } from '@/types';
import type { TankRecord } from './api';

/**
 * Until a device is connected to a tank, there is no real telemetry to
 * show. Render a "not connected" tank with zeroed-out readings rather
 * than fabricated placeholder numbers.
 */
export function toDisplayTank(record: TankRecord): Tank {
  return {
    id: record._id,
    name: record.tankName,
    type: record.tankType,
    location: record.location || 'No location set',
    capacityLiters: record.capacity,
    currentLevel: 0,
    health: 0,
    temperature: 0,
    ph: 0,
    dissolvedOxygen: 0,
    quality: 0,
    status: 'warning',
    lastUpdated: 'No device connected',
    trend: 'stable',
    connected: false,
  };
}

export function generateHistory(base: number, variance: number, points = 7): HistoryPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return Array.from({ length: points }).map((_, i) => {
    const seed = Math.sin((i + 1) * 12.9898) * 10000;
    const rand = seed - Math.floor(seed);
    return {
      label: days[i % days.length],
      value: Math.max(0, Math.min(1, base + (rand - 0.5) * variance)),
    };
  });
}
