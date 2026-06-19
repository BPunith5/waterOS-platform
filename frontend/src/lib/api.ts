import type { TankType } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'waterOS_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export type UserRole = 'user' | 'admin' | 'superadmin';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type TankRecord = {
  _id: string;
  userId: string;
  tankName: string;
  tankType: TankType;
  capacity: number;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTankInput = {
  tankName: string;
  tankType: TankType;
  capacity: number;
  location?: string;
  description?: string;
};

export type DeviceStatus = 'pending' | 'active' | 'offline' | 'unclaimed' | 'decommissioned';
export type HealthLevel = 'healthy' | 'good' | 'warning' | 'critical';

export type DeviceRecord = {
  _id: string;
  deviceId: string;
  deviceName: string;
  userId: string | null;
  tankId: string | null;
  status: DeviceStatus;
  battery: number;
  signal: number;
  lastSeen: string | null;
  activationPin?: string;
  secretKey?: string;
  registrationCode?: string | null;
  qrCode?: string;
  assignedAdminIds?: string[];
  claimedBy?: string | null;
  claimedAt?: string | null;
  provisionSource?: 'user_created' | 'provisioned';
  alertThresholds?: Record<string, number> | null;
  healthScore: number;
  healthLevel: HealthLevel;
  createdAt: string;
  updatedAt: string;
};

export type AdminRecord = {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
};

export type ProvisionedDeviceResult = {
  device: DeviceRecord;
  qrCodeDataUrl: string;
};

export type BatchProvisionResult = {
  devices: DeviceRecord[];
  csv: string;
};

export type AdminPushTelemetryInput = {
  waterLevel?: number;
  dissolvedOxygen?: number;
  ph?: number;
  turbidity?: number;
  temperature?: number;
  tds?: number;
  battery?: number;
  signal?: number;
  note?: string;
};

export type ClaimDeviceInput = {
  registrationCode: string;
  tankId: string;
};

export type TelemetryRecord = {
  _id: string;
  deviceId: string;
  deviceRef: string;
  tankId?: string;
  waterLevel: number;
  waterQuantity: number;
  dissolvedOxygen: number;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  lat?: number;
  lng?: number;
  speed: number;
  battery: number;
  signal: number;
  timestamp: string;
};

export type DeviceUpdatePayload = {
  device: DeviceRecord;
  telemetry: TelemetryRecord;
};

export type CreateDeviceInput = {
  deviceName: string;
  tankId?: string;
};

export type ConnectDeviceInput = {
  deviceId: string;
  activationPin: string;
  tankId: string;
};

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertDeviceRef = { _id: string; deviceId: string; deviceName: string };
export type AlertTankRef = { _id: string; tankName: string };

export type AlertRecord = {
  _id: string;
  userId: string;
  tankId?: AlertTankRef | string | null;
  deviceId: AlertDeviceRef | string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsRange = '7D' | '30D' | '90D';

export type AnalyticsSeriesPoint = {
  date: string;
  waterLevel: number;
  dissolvedOxygen: number;
  ph: number;
  turbidity: number;
  temperature: number;
  battery: number;
  signal: number;
  quality: number;
};

export type AnalyticsSummary = {
  avgWaterLevel: number | null;
  avgQuality: number | null;
  avgTemperature: number | null;
  avgPh: number | null;
  deviceUptimePercent: number;
  sampleCount: number;
};

export type AnalyticsDistribution = {
  type: TankType;
  count: number;
};

export type AnalyticsResponse = {
  range: AnalyticsRange;
  series: AnalyticsSeriesPoint[];
  summary: AnalyticsSummary;
  distribution: AnalyticsDistribution[];
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed');
  }
  return data as T;
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { name: string; email: string; password: string }) =>
      request<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<{ user: AuthUser }>('/auth/me'),
  },
  tanks: {
    list: () => request<TankRecord[]>('/tanks'),
    get: (id: string) => request<TankRecord>(`/tanks/${id}`),
    create: (body: CreateTankInput) => request<TankRecord>('/tanks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateTankInput>) =>
      request<TankRecord>(`/tanks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ success: boolean }>(`/tanks/${id}`, { method: 'DELETE' }),
  },
  devices: {
    list: () => request<DeviceRecord[]>('/devices'),
    register: (body: CreateDeviceInput) => request<DeviceRecord>('/devices', { method: 'POST', body: JSON.stringify(body) }),
    connect: (body: ConnectDeviceInput) => request<DeviceRecord>('/devices/connect', { method: 'POST', body: JSON.stringify(body) }),
  },
  telemetry: {
    logs: (deviceId: string, limit = 1) => request<TelemetryRecord[]>(`/logs/${deviceId}?limit=${limit}`),
  },
  alerts: {
    list: (severity?: AlertSeverity) => request<AlertRecord[]>(`/alerts${severity ? `?severity=${severity}` : ''}`),
    markRead: (id: string, read: boolean) =>
      request<AlertRecord>(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) }),
  },
  analytics: {
    get: (range: AnalyticsRange = '7D', tankId?: string) =>
      request<AnalyticsResponse>(`/analytics?range=${range}${tankId ? `&tankId=${tankId}` : ''}`),
  },
  superadmin: {
    listAdmins: () => request<AdminRecord[]>('/superadmin/admins'),
    createAdmin: (body: { name: string; email: string; password: string }) =>
      request<AdminRecord>('/superadmin/admins', { method: 'POST', body: JSON.stringify(body) }),
    deactivateAdmin: (id: string) => request<void>(`/superadmin/admins/${id}`, { method: 'DELETE' }),
    listDevices: () => request<DeviceRecord[]>('/superadmin/devices'),
    provisionDevice: (body: { deviceName: string; adminId?: string }) =>
      request<ProvisionedDeviceResult>('/superadmin/devices', { method: 'POST', body: JSON.stringify(body) }),
    batchProvision: (body: { namePrefix: string; count: number; adminId?: string }) =>
      request<BatchProvisionResult>('/superadmin/devices/batch', { method: 'POST', body: JSON.stringify(body) }),
    assignDevice: (deviceId: string, adminId: string) =>
      request<DeviceRecord>(`/superadmin/devices/${deviceId}/assign`, { method: 'POST', body: JSON.stringify({ adminId }) }),
    unassignDevice: (deviceId: string, adminId: string) =>
      request<DeviceRecord>(`/superadmin/devices/${deviceId}/assign/${adminId}`, { method: 'DELETE' }),
    listUsers: () => request<AuthUser[]>('/superadmin/users'),
    auditLog: (limit = 50) => request<{ logs: TelemetryRecord[] }>(`/superadmin/audit?limit=${limit}`),
    rotateCode: (deviceId: string) =>
      request<{ registrationCode: string; qrCodeDataUrl: string }>(`/superadmin/devices/${deviceId}/rotate-code`, { method: 'POST' }),
    rotateKey: (deviceId: string) =>
      request<{ secretKey: string }>(`/superadmin/devices/${deviceId}/rotate-key`, { method: 'POST' }),
    decommission: (deviceId: string) =>
      request<DeviceRecord>(`/superadmin/devices/${deviceId}/decommission`, { method: 'POST' }),
  },
  admin: {
    listDevices: () => request<DeviceRecord[]>('/admin/devices'),
    getTelemetry: (deviceId: string, limit = 50) =>
      request<TelemetryRecord[]>(`/admin/devices/${deviceId}/telemetry?limit=${limit}`),
    pushTelemetry: (deviceId: string, body: AdminPushTelemetryInput) =>
      request<TelemetryRecord>(`/admin/devices/${deviceId}/telemetry`, { method: 'POST', body: JSON.stringify(body) }),
    rotateKey: (deviceId: string) =>
      request<{ secretKey: string }>(`/admin/devices/${deviceId}/rotate-key`, { method: 'POST' }),
  },
  userDevices: {
    claim: (body: ClaimDeviceInput) =>
      request<DeviceRecord>('/devices/claim', { method: 'POST', body: JSON.stringify(body) }),
    unclaim: (deviceId: string) => request<DeviceRecord>(`/devices/${deviceId}/unclaim`, { method: 'DELETE' }),
  },
};
