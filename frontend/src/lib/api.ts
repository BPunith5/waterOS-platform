import type { TankType } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'waterOS_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
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

export type DeviceStatus = 'pending' | 'active' | 'offline';
export type HealthLevel = 'healthy' | 'good' | 'warning' | 'critical';

export type DeviceRecord = {
  _id: string;
  deviceId: string;
  deviceName: string;
  userId: string;
  tankId: string | null;
  status: DeviceStatus;
  battery: number;
  signal: number;
  lastSeen: string | null;
  activationPin?: string;
  qrCode?: string;
  healthScore: number;
  healthLevel: HealthLevel;
  createdAt: string;
  updatedAt: string;
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

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertRecord = {
  _id: string;
  userId: string;
  tankId?: string | null;
  deviceId: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
  },
  telemetry: {
    logs: (deviceId: string, limit = 1) => request<TelemetryRecord[]>(`/logs/${deviceId}?limit=${limit}`),
  },
};
