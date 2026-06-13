import type { HistoryPoint, Tank, TankStatus } from '@/types';
import type { TankRecord } from './api';

function seeded(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Until devices/telemetry (Milestones 7+9) are wired up, derive
 * deterministic placeholder readings from the tank's id so cards and
 * the detail view have something representative to render.
 */
export function toDisplayTank(record: TankRecord): Tank {
  const seed = hashString(record._id);
  const currentLevel = 0.3 + seeded(seed) * 0.6;
  const health = 0.55 + seeded(seed + 1) * 0.45;
  const temperature = 18 + seeded(seed + 2) * 16;
  const ph = 6.4 + seeded(seed + 3) * 1.8;
  const dissolvedOxygen = 0.5 + seeded(seed + 4) * 0.45;
  const quality = 0.55 + seeded(seed + 5) * 0.45;

  const trendRoll = seeded(seed + 6);
  const trend: Tank['trend'] = trendRoll < 0.34 ? 'rising' : trendRoll < 0.67 ? 'falling' : 'stable';

  const status: TankStatus = currentLevel < 0.25 || health < 0.6 ? 'critical' : health < 0.8 ? 'warning' : 'optimal';

  return {
    id: record._id,
    name: record.tankName,
    type: record.tankType,
    location: record.location || 'No location set',
    capacityLiters: record.capacity,
    currentLevel,
    health,
    temperature,
    ph,
    dissolvedOxygen,
    quality,
    status,
    lastUpdated: 'No device connected',
    trend,
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
