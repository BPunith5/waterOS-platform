import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import type { HealthLevel } from './schemas/device.schema';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const REG_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateDeviceId(): string {
  let id = 'WTR';
  const bytes = crypto.randomBytes(13);
  for (let i = 0; i < 13; i++) {
    id += CHARSET[bytes[i] % CHARSET.length];
  }
  return id.slice(0, 16);
}

export function generateActivationPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateRegistrationCode(): string {
  const bytes = crypto.randomBytes(16);
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += REG_CHARSET[bytes[i] % REG_CHARSET.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
}

export async function generateRegistrationQrCode(registrationCode: string): Promise<string> {
  return QRCode.toDataURL(registrationCode, { errorCorrectionLevel: 'H', margin: 2, width: 256 });
}

export async function generateQrCode(deviceId: string, activationPin: string): Promise<string> {
  return QRCode.toDataURL(`${deviceId}:${activationPin}`, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 256,
  });
}

export function calculateHealthScore({
  battery = 0,
  signal = 0,
  lastSeen,
}: {
  battery?: number;
  signal?: number;
  lastSeen?: Date | string | null;
}): number {
  let connectivity = 0;
  if (lastSeen) {
    const minutesAgo = (Date.now() - new Date(lastSeen).getTime()) / 60000;
    if (minutesAgo <= 5) connectivity = 100;
    else if (minutesAgo <= 15) connectivity = 70;
    else if (minutesAgo <= 60) connectivity = 40;
    else connectivity = 10;
  }
  return Math.round(battery * 0.4 + signal * 0.3 + connectivity * 0.3);
}

export function getHealthLevel(score: number): HealthLevel {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
}
