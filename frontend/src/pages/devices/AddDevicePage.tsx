import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Check, Copy, KeyRound, ScanLine, Pencil } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { FilterPill } from '@/components/glass/FilterPill';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { QrScanner } from '@/components/device/QrScanner';
import { api, type DeviceRecord, type TankRecord } from '@/lib/api';
import { colors, gradients, radius } from '@/theme/tokens';

type Step = 'register' | 'connect';
type ConnectTab = 'manual' | 'scan';

export function AddDevicePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState<Step>(params.get('step') === 'connect' ? 'connect' : 'register');
  const [connectTab, setConnectTab] = useState<ConnectTab>('manual');

  const [deviceName, setDeviceName] = useState('');
  const [registered, setRegistered] = useState<DeviceRecord | null>(null);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deviceId, setDeviceId] = useState(params.get('deviceId') ?? '');
  const [activationPin, setActivationPin] = useState(params.get('pin') ?? '');
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [tankId, setTankId] = useState(params.get('tankId') ?? '');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const presetTankId = params.get('tankId');
    api.tanks.list().then((records) => {
      setTanks(records);
      setTankId((prev) => prev || presetTankId || records[0]?._id || '');
    });
  }, [params]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setRegistering(true);
    try {
      const device = await api.devices.register({ deviceName });
      setRegistered(device);
      setDeviceId(device.deviceId);
      setActivationPin(device.activationPin ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register device');
    } finally {
      setRegistering(false);
    }
  }

  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    if (!tankId) {
      setError('Select a tank to connect this device to.');
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      const device = await api.devices.connect({
        deviceId: deviceId.trim().toUpperCase(),
        activationPin: activationPin.trim(),
        tankId,
      });
      navigate(`/tanks/${device.tankId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect device');
      setConnecting(false);
    }
  }

  function handleScan(decoded: string) {
    const [scannedId, scannedPin] = decoded.split(':');
    if (scannedId) setDeviceId(scannedId.trim());
    if (scannedPin) setActivationPin(scannedPin.trim());
    setConnectTab('manual');
  }

  async function copyValue(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied((prev) => (prev === label ? null : prev)), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          {step === 'register' ? 'Add Device' : 'Connect Device'}
        </h1>
        <IconButton icon={X} onClick={() => navigate(-1)} />
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      {step === 'register' && !registered && (
        <form onSubmit={handleRegister}>
          <GlassSurface borderRadius={radius.xl} className="mb-6 p-5">
            <p className="mb-1 text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              Register a sensor
            </p>
            <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Give your device a name. You'll get a unique ID, PIN and QR code to connect it to a tank.
            </p>
          </GlassSurface>

          <GlassInput
            label="Device Name"
            placeholder="e.g. Rooftop Tank Sensor"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
          />

          <LiquidButton label={registering ? 'Registering…' : 'Register Device'} type="submit" variant="primary" fullWidth disabled={registering || !deviceName.trim()} />
        </form>
      )}

      {step === 'register' && registered && (
        <div className="flex flex-col gap-4">
          <GlassSurface borderRadius={radius.xl} className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              {registered.deviceName}
            </p>
            {registered.qrCode && (
              <img src={registered.qrCode} alt="Device QR code" className="h-44 w-44 rounded-lg" style={{ border: `1px solid ${colors.glassBorder}` }} />
            )}
            <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Scan this QR code or enter the details below to connect this device to a tank.
            </p>
          </GlassSurface>

          <CredentialRow label="Device ID" value={registered.deviceId} copied={copied === 'id'} onCopy={() => copyValue('id', registered.deviceId)} />
          <CredentialRow label="Activation PIN" value={registered.activationPin ?? ''} copied={copied === 'pin'} onCopy={() => copyValue('pin', registered.activationPin ?? '')} />
          {registered.secretKey && (
            <CredentialRow label="Secret Key" value={registered.secretKey} copied={copied === 'secret'} onCopy={() => copyValue('secret', registered.secretKey ?? '')} mono icon={KeyRound} />
          )}

          <LiquidButton label="Continue to Connect" variant="primary" fullWidth onClick={() => setStep('connect')} />
        </div>
      )}

      {step === 'connect' && (
        <form onSubmit={handleConnect} className="flex flex-col gap-2">
          <div className="mb-2 flex gap-2">
            <FilterPill label="Manual Entry" active={connectTab === 'manual'} onClick={() => setConnectTab('manual')} gradient={gradients.aquaGlow} />
            <FilterPill label="Scan QR" active={connectTab === 'scan'} onClick={() => setConnectTab('scan')} gradient={gradients.aquaGlow} />
          </div>

          {connectTab === 'manual' ? (
            <>
              <GlassInput
                label="Device ID"
                placeholder="WTR-XXXXXXXXXXXXXXXX"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                icon={ScanLine}
                required
              />
              <GlassInput
                label="Activation PIN"
                placeholder="6-digit PIN"
                value={activationPin}
                onChange={(e) => setActivationPin(e.target.value)}
                icon={KeyRound}
                required
              />
            </>
          ) : (
            <div className="mb-4">
              <QrScanner onScan={handleScan} onError={(message) => setError(message)} />
              {(deviceId || activationPin) && (
                <p className="mt-2 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Scanned: {deviceId} {activationPin && `· PIN ${activationPin}`}
                </p>
              )}
            </div>
          )}

          <SectionHeader title="Connect to Tank" />
          {tanks.length === 0 ? (
            <GlassSurface className="mb-4 p-4">
              <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                You don't have any tanks yet. Add one first, then come back to connect this device.
              </p>
              <div className="mt-3">
                <LiquidButton label="Add a Tank" variant="glass" icon={<Pencil size={16} color={colors.textPrimary} />} onClick={() => navigate('/tanks/new')} />
              </div>
            </GlassSurface>
          ) : (
            <div className="mb-4 flex flex-wrap gap-2">
              {tanks.map((tank) => (
                <FilterPill key={tank._id} label={tank.tankName} active={tankId === tank._id} onClick={() => setTankId(tank._id)} />
              ))}
            </div>
          )}

          <LiquidButton
            label={connecting ? 'Connecting…' : 'Connect Device'}
            type="submit"
            variant="primary"
            fullWidth
            disabled={connecting || !deviceId.trim() || !activationPin.trim() || !tankId}
          />
        </form>
      )}
    </div>
  );
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
  mono,
  icon: Icon,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
  icon?: typeof KeyRound;
}) {
  return (
    <GlassSurface className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
        <p
          className="truncate text-sm font-semibold"
          style={{ color: colors.textPrimary, fontFamily: mono ? 'monospace' : 'var(--font-heading)' }}
        >
          {Icon && <Icon size={12} className="mr-1 inline" />} {value}
        </p>
      </div>
      <button type="button" onClick={onCopy} className="shrink-0">
        {copied ? <Check size={18} color={colors.success} /> : <Copy size={18} color={colors.textTertiary} />}
      </button>
    </GlassSurface>
  );
}
