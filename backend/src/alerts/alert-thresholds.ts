export const ALERT_TYPES = [
  'low_water_level',
  'tank_empty',
  'low_oxygen',
  'high_turbidity',
  'poor_water_quality',
  'abnormal_ph',
  'low_battery',
  'weak_signal',
  'device_offline',
  'gps_lost',
  'high_temperature',
  'rapid_sensor_change',
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const OFFLINE_MINUTES = 15;
export const ALERT_DEDUP_WINDOW_MS = 30 * 60 * 1000;
