import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, KeyRound, Pencil, Plus, ScanLine, Cpu } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { FilterPill } from '@/components/glass/FilterPill';
import { QrScanner } from '@/components/device/QrScanner';
import { api, type DeviceRecord, type TankRecord } from '@/lib/api';
import { colors, gradients, radius, tankTypeMeta } from '@/theme/tokens';
import type { TankType } from '@/types';

// Step flow:
//   identify → (scan/type sensor code) → tank
//   provision → (new sensor name) → provisioned → (show QR/creds) → tank
//   tank → (pick existing or fill new tank form) → connect → done

type Step = 'identify' | 'provision' | 'provisioned' | 'tank';
type IdentifyTab = 'code' | 'scan';
type TankMode = 'existing' | 'new';

const TANK_TYPES: TankType[] = ['drinking', 'aquaculture', 'industrial', 'irrigation'];

function StepBar({ step }: { step: Step }) {
  const current = step === 'identify' || step === 'provision' || step === 'provisioned' ? 1 : 2;
  return (
    <div className="mb-6 flex items-center gap-2">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: n <= current ? colors.cyan : 'transparent',
              border: `1.5px solid ${n <= current ? colors.cyan : colors.glassBorder}`,
              color: n <= current ? colors.textInverse : colors.textTertiary,
              fontFamily: 'var(--font-body)',
            }}
          >
            {n < current ? <Check size={12} /> : n}
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: n <= current ? colors.textPrimary : colors.textTertiary, fontFamily: 'var(--font-body)' }}
          >
            {n === 1 ? 'Identify Sensor' : 'Set Up Tank'}
          </span>
          {n < 2 && (
            <div
              className="h-px w-6"
              style={{ backgroundColor: n < current ? colors.cyan : colors.glassBorder }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function AddDevicePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('identify');
  const [identifyTab, setIdentifyTab] = useState<IdentifyTab>('code');

  // Sensor credentials (from scan, manual entry, or provisioning)
  const [deviceId, setDeviceId] = useState('');
  const [activationPin, setActivationPin] = useState('');

  // Provisioning a new sensor
  const [deviceName, setDeviceName] = useState('');
  const [registered, setRegistered] = useState<DeviceRecord | null>(null);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Tank setup
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [tankMode, setTankMode] = useState<TankMode>('existing');
  const [tankId, setTankId] = useState('');
  const [newTankName, setNewTankName] = useState('');
  const [newTankType, setNewTankType] = useState<TankType>('drinking');
  const [newTankCapacity, setNewTankCapacity] = useState('');
  const [newTankLocation, setNewTankLocation] = useState('');

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.tanks.list().then((records) => {
      setTanks(records);
      if (records.length > 0) setTankId(records[0]._id);
      else setTankMode('new');
    });
  }, []);

  // ── Scan QR ──────────────────────────────────────────────────
  function handleScan(decoded: string) {
    const [scannedId, scannedPin] = decoded.split(':');
    if (scannedId) setDeviceId(scannedId.trim().toUpperCase());
    if (scannedPin) setActivationPin(scannedPin.trim());
    setStep('tank');
  }

  // ── Enter code manually ───────────────────────────────────────
  function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (!deviceId.trim() || !activationPin.trim()) {
      setError('Enter both the Device ID and PIN printed on your sensor.');
      return;
    }
    setError(null);
    setStep('tank');
  }

  // ── Provision new sensor ──────────────────────────────────────
  async function handleProvision(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setRegistering(true);
    try {
      const device = await api.devices.register({ deviceName });
      setRegistered(device);
      setDeviceId(device.deviceId);
      setActivationPin(device.activationPin ?? '');
      setStep('provisioned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register sensor');
    } finally {
      setRegistering(false);
    }
  }

  async function copyValue(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  // ── Connect sensor to tank ────────────────────────────────────
  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let resolvedTankId = tankId;

    if (tankMode === 'new') {
      if (!newTankName.trim() || !newTankCapacity) {
        setError('Fill in the tank name and capacity.');
        return;
      }
      setConnecting(true);
      try {
        const created = await api.tanks.create({
          tankName: newTankName.trim(),
          tankType: newTankType,
          capacity: Number(newTankCapacity),
          location: newTankLocation.trim(),
          description: '',
        });
        resolvedTankId = created._id;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create tank');
        setConnecting(false);
        return;
      }
    } else {
      if (!resolvedTankId) {
        setError('Select a tank to connect this sensor to.');
        return;
      }
      setConnecting(true);
    }

    try {
      const device = await api.devices.connect({
        deviceId: deviceId.trim().toUpperCase(),
        activationPin: activationPin.trim(),
        tankId: resolvedTankId,
      });
      navigate(`/tanks/${device.tankId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect sensor');
      setConnecting(false);
    }
  }

  const pageTitle =
    step === 'provision' ? 'Set Up New Sensor'
    : step === 'provisioned' ? 'Sensor Ready'
    : step === 'tank' ? 'Set Up Tank'
    : 'Connect Sensor';

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step !== 'identify' && (
            <button
              type="button"
              onClick={() => {
                if (step === 'tank') setStep('identify');
                else if (step === 'provisioned') setStep('provision');
                else if (step === 'provision') setStep('identify');
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
            >
              <ArrowLeft size={16} color={colors.textSecondary} />
            </button>
          )}
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
          >
            {pageTitle}
          </h1>
        </div>
        <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
      </div>

      <StepBar step={step} />

      {error && (
        <p className="mb-4 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      {/* ── Step: identify ──────────────────────────────────────── */}
      {step === 'identify' && (
        <div className="flex flex-col gap-4">
          <GlassSurface borderRadius={radius.lg} className="p-4">
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              How do you want to add a sensor?
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Scan the QR label on your sensor, type its code, or provision a new sensor in the system.
            </p>
          </GlassSurface>

          <div className="flex gap-2">
            <FilterPill label="Enter Code" active={identifyTab === 'code'} onClick={() => setIdentifyTab('code')} gradient={gradients.aquaGlow} />
            <FilterPill label="Scan QR" active={identifyTab === 'scan'} onClick={() => setIdentifyTab('scan')} gradient={gradients.aquaGlow} />
          </div>

          {identifyTab === 'code' ? (
            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
              <GlassInput
                label="Device ID"
                placeholder="e.g. WTR-XXXXXXXXXXXXXXXX"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
                icon={ScanLine}
                required
              />
              <GlassInput
                label="Activation PIN"
                placeholder="6-digit PIN on sensor label"
                value={activationPin}
                onChange={(e) => setActivationPin(e.target.value)}
                icon={KeyRound}
                required
              />
              <LiquidButton
                label="Continue to Tank Setup"
                type="submit"
                variant="primary"
                fullWidth
                disabled={!deviceId.trim() || !activationPin.trim()}
              />
            </form>
          ) : (
            <div>
              <QrScanner onScan={handleScan} onError={(msg) => setError(msg)} />
              {(deviceId || activationPin) && (
                <p className="mt-2 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Scanned: {deviceId} {activationPin && `· PIN ${activationPin}`}
                </p>
              )}
            </div>
          )}

          <div className="relative flex items-center gap-3">
            <div className="flex-1" style={{ height: 1, backgroundColor: colors.glassBorder }} />
            <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              or
            </span>
            <div className="flex-1" style={{ height: 1, backgroundColor: colors.glassBorder }} />
          </div>

          <LiquidButton
            label="Set Up New Sensor"
            variant="glass"
            icon={<Plus size={16} color={colors.textPrimary} />}
            fullWidth
            onClick={() => setStep('provision')}
          />
        </div>
      )}

      {/* ── Step: provision ─────────────────────────────────────── */}
      {step === 'provision' && (
        <form onSubmit={handleProvision} className="flex flex-col gap-4">
          <GlassSurface borderRadius={radius.lg} className="p-4">
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              Provision a new sensor
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Give your sensor a name. You'll get a unique Device ID, PIN, and QR code to program it with.
            </p>
          </GlassSurface>
          <GlassInput
            label="Sensor Name"
            placeholder="e.g. Rooftop Tank Sensor"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            icon={Cpu}
            required
          />
          <LiquidButton
            label={registering ? 'Registering…' : 'Register Sensor'}
            type="submit"
            variant="primary"
            fullWidth
            disabled={registering || !deviceName.trim()}
          />
        </form>
      )}

      {/* ── Step: provisioned (show credentials) ────────────────── */}
      {step === 'provisioned' && registered && (
        <div className="flex flex-col gap-3">
          <GlassSurface borderRadius={radius.lg} className="flex flex-col items-center gap-4 p-5 text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.success}22`, border: `1px solid ${colors.success}55` }}
            >
              <Check size={18} color={colors.success} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                {registered.deviceName} registered
              </p>
              <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                Save these credentials — they'll be used to program the physical device.
              </p>
            </div>
            {registered.qrCode && (
              <img
                src={registered.qrCode}
                alt="QR code"
                className="h-36 w-36 rounded-lg"
                style={{ border: `1px solid ${colors.glassBorder}` }}
              />
            )}
          </GlassSurface>

          <CredRow label="Device ID" value={registered.deviceId} copied={copied === 'id'} onCopy={() => copyValue('id', registered.deviceId)} />
          <CredRow label="Activation PIN" value={registered.activationPin ?? ''} copied={copied === 'pin'} onCopy={() => copyValue('pin', registered.activationPin ?? '')} />
          {registered.secretKey && (
            <CredRow label="Secret Key" value={registered.secretKey} copied={copied === 'sk'} onCopy={() => copyValue('sk', registered.secretKey ?? '')} mono />
          )}

          <LiquidButton label="Continue to Tank Setup →" variant="primary" fullWidth onClick={() => setStep('tank')} />
        </div>
      )}

      {/* ── Step: tank setup ────────────────────────────────────── */}
      {step === 'tank' && (
        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          {/* Sensor confirmation bar */}
          {deviceId && (
            <GlassSurface borderRadius={10} className="flex items-center gap-3 px-4 py-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.cyan}22`, border: `1px solid ${colors.cyan}44` }}
              >
                <Cpu size={15} color={colors.cyan} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                  Sensor identified
                </p>
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
                >
                  {deviceId}
                  {activationPin && <span className="ml-2 font-normal" style={{ color: colors.textTertiary }}>PIN {activationPin}</span>}
                </p>
              </div>
            </GlassSurface>
          )}

          <p
            className="text-sm font-semibold"
            style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
          >
            Which tank is this sensor monitoring?
          </p>

          {/* Existing / New tabs */}
          <div className="flex gap-2">
            {tanks.length > 0 && (
              <FilterPill
                label="Existing Tank"
                active={tankMode === 'existing'}
                onClick={() => setTankMode('existing')}
                gradient={gradients.aquaGlow}
              />
            )}
            <FilterPill
              label="New Tank"
              active={tankMode === 'new'}
              onClick={() => setTankMode('new')}
              gradient={gradients.tealGlow}
            />
          </div>

          {tankMode === 'existing' && tanks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tanks.map((tank) => (
                <FilterPill
                  key={tank._id}
                  label={tank.tankName}
                  active={tankId === tank._id}
                  onClick={() => setTankId(tank._id)}
                />
              ))}
            </div>
          )}

          {tankMode === 'new' && (
            <GlassSurface borderRadius={radius.lg} className="flex flex-col gap-3 p-4">
              <p className="text-xs font-semibold" style={{ color: colors.textSecondary, fontFamily: 'var(--font-heading)' }}>
                New tank details
              </p>
              <GlassInput
                label="Tank Name"
                placeholder="e.g. Rooftop Drinking Tank"
                value={newTankName}
                onChange={(e) => setNewTankName(e.target.value)}
                icon={Pencil}
                required
              />
              <div>
                <p className="mb-2 text-xs font-medium" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                  Tank Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {TANK_TYPES.map((type) => (
                    <FilterPill
                      key={type}
                      label={tankTypeMeta[type].label}
                      active={newTankType === type}
                      onClick={() => setNewTankType(type)}
                      gradient={tankTypeMeta[type].gradient}
                    />
                  ))}
                </div>
              </div>
              <GlassInput
                label="Capacity (litres)"
                placeholder="e.g. 10000"
                value={newTankCapacity}
                onChange={(e) => setNewTankCapacity(e.target.value)}
                required
              />
              <GlassInput
                label="Location (optional)"
                placeholder="e.g. Rooftop · Block A"
                value={newTankLocation}
                onChange={(e) => setNewTankLocation(e.target.value)}
              />
            </GlassSurface>
          )}

          <LiquidButton
            label={connecting ? 'Connecting…' : 'Connect Sensor'}
            type="submit"
            variant="primary"
            fullWidth
            disabled={
              connecting ||
              !deviceId.trim() ||
              !activationPin.trim() ||
              (tankMode === 'existing' && !tankId) ||
              (tankMode === 'new' && (!newTankName.trim() || !newTankCapacity))
            }
          />
        </form>
      )}
    </div>
  );
}

function CredRow({
  label,
  value,
  copied,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
}) {
  return (
    <GlassSurface borderRadius={10} className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
        <p
          className="truncate text-sm font-semibold"
          style={{ color: colors.textPrimary, fontFamily: mono ? 'monospace' : 'var(--font-heading)' }}
        >
          {value}
        </p>
      </div>
      <button type="button" onClick={onCopy} className="shrink-0">
        {copied ? <Check size={16} color={colors.success} /> : <Copy size={16} color={colors.textTertiary} />}
      </button>
    </GlassSurface>
  );
}
