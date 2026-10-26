import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, KeyRound, Pencil, ScanLine, Cpu } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { FilterPill } from '@/components/glass/FilterPill';
import { QrScanner } from '@/components/device/QrScanner';
import { api, type TankRecord } from '@/lib/api';
import { colors, gradients, radius, tankTypeMeta } from '@/theme/tokens';
import type { TankType } from '@/types';

type Step = 'identify' | 'tank';
type IdentifyTab = 'code' | 'scan';
type TankMode = 'existing' | 'new';

const TANK_TYPES: TankType[] = ['drinking', 'aquaculture', 'industrial', 'irrigation'];

function StepBar({ step }: { step: Step }) {
  const current = step === 'identify' ? 1 : 2;
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
            {n === 1 ? 'Identify Device' : 'Set Up Tank'}
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

  const [deviceId, setDeviceId] = useState('');
  const [activationPin, setActivationPin] = useState('');

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

  function handleScan(decoded: string) {
    const [scannedId, scannedPin] = decoded.split(':');
    if (scannedId) setDeviceId(scannedId.trim().toUpperCase());
    if (scannedPin) setActivationPin(scannedPin.trim());
    setStep('tank');
  }

  function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (!deviceId.trim() || !activationPin.trim()) {
      setError('Enter both the Device ID and PIN printed on your device.');
      return;
    }
    setError(null);
    setStep('tank');
  }

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
        setError('Select a tank to connect this device to.');
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
      setError(err instanceof Error ? err.message : 'Failed to connect device');
      setConnecting(false);
    }
  }

  const pageTitle = step === 'tank' ? 'Set Up Tank' : 'Connect Device';

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step === 'tank' && (
            <button
              type="button"
              onClick={() => setStep('identify')}
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
              How do you want to add a device?
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Scan the QR label on your device, or type in the Device ID and PIN from the label.
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
                placeholder="6-digit PIN on device label"
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
        </div>
      )}

      {/* ── Step: tank setup ────────────────────────────────────── */}
      {step === 'tank' && (
        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          {/* Device confirmation bar */}
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
                  Device identified
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
            Which tank is this device monitoring?
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
            label={connecting ? 'Connecting…' : 'Connect Device'}
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
