export type TankType = 'drinking' | 'aquaculture' | 'industrial' | 'irrigation';

export type TankStatus = 'optimal' | 'warning' | 'critical';

export type Tank = {
  id: string;
  name: string;
  type: TankType;
  location: string;
  capacityLiters: number;
  currentLevel: number; // 0-1
  health: number; // 0-1
  temperature: number; // celsius
  ph: number;
  dissolvedOxygen: number; // 0-1 (percent saturation)
  quality: number; // 0-1 score
  status: TankStatus;
  lastUpdated: string;
  trend: 'rising' | 'falling' | 'stable';
};

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertItem = {
  id: string;
  tankId: string;
  tankName: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

export type UserProfile = {
  name: string;
  email: string;
  facility: string;
  memberSince: string;
  initials: string;
};

export type HistoryPoint = {
  label: string;
  value: number;
};
