import { useState } from 'react';
import { Tag, MapPin, Droplet as DropletIcon, FileText } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { GlassInput } from '@/components/glass/GlassInput';
import { PressableScale } from '@/components/glass/PressableScale';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { WaterVessel } from '@/components/water/WaterVessel';
import { colors, radius, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import type { TankType } from '@/types';

const TANK_TYPES = Object.keys(tankTypeMeta) as TankType[];

export type TankFormValues = {
  tankName: string;
  tankType: TankType;
  location: string;
  capacity: number;
  description: string;
};

type Props = {
  initial?: Partial<TankFormValues>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: TankFormValues) => void;
};

export function TankForm({ initial, submitLabel, submitting, onSubmit }: Props) {
  const [selectedType, setSelectedType] = useState<TankType>(initial?.tankType ?? 'drinking');
  const [tankName, setTankName] = useState(initial?.tankName ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [capacity, setCapacity] = useState(initial?.capacity ? String(initial.capacity) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [errors, setErrors] = useState<{ tankName?: string; capacity?: string }>({});

  const meta = tankTypeMeta[selectedType];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = tankName.trim();
    const capacityNum = parseFloat(capacity);

    const nextErrors: typeof errors = {};
    if (!trimmedName) nextErrors.tankName = 'Tank name is required';
    if (!capacity.trim() || isNaN(capacityNum) || capacityNum <= 0) {
      nextErrors.capacity = 'Enter a valid capacity in liters';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      tankName: trimmedName,
      tankType: selectedType,
      location: location.trim(),
      capacity: capacityNum,
      description: description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
      <SectionHeader title="Tank Type" />
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TANK_TYPES.map((type) => {
          const typeMeta = tankTypeMeta[type];
          const Icon = typeMeta.icon;
          const selected = type === selectedType;
          return (
            <PressableScale key={type} onClick={() => setSelectedType(type)}>
              <GlassSurface
                bordered={!selected}
                className="flex flex-col items-center gap-2 p-4"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {selected && (
                  <div aria-hidden className="absolute inset-0" style={{ backgroundImage: linearGradient(typeMeta.gradient) }} />
                )}
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: selected ? 'rgba(255,255,255,0.25)' : colors.glassFill,
                    borderColor: selected ? 'rgba(255,255,255,0.4)' : colors.glassBorder,
                  }}
                >
                  <Icon size={22} color={selected ? colors.textInverse : typeMeta.accent} />
                </div>
                <span
                  className="relative text-sm font-semibold"
                  style={{ color: selected ? colors.textInverse : colors.textSecondary, fontFamily: 'var(--font-body)' }}
                >
                  {typeMeta.label}
                </span>
              </GlassSurface>
            </PressableScale>
          );
        })}
      </div>

      <div className="mb-8">
        <SectionHeader title="Tank Details" />
        <GlassSurface borderRadius={radius.xl} className="p-5 pb-1">
          <GlassInput
            label="Tank Name"
            icon={Tag}
            placeholder="e.g. Rooftop Reservoir"
            value={tankName}
            onChange={(e) => {
              setTankName(e.target.value);
              if (errors.tankName) setErrors((er) => ({ ...er, tankName: undefined }));
            }}
            error={errors.tankName}
          />
          <GlassInput
            label="Location"
            icon={MapPin}
            placeholder="e.g. Block A · Rooftop"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <GlassInput
            label="Capacity (Liters)"
            icon={DropletIcon}
            type="number"
            min={0}
            placeholder="e.g. 50000"
            value={capacity}
            onChange={(e) => {
              setCapacity(e.target.value);
              if (errors.capacity) setErrors((er) => ({ ...er, capacity: undefined }));
            }}
            error={errors.capacity}
          />
          <GlassInput
            label="Description (optional)"
            icon={FileText}
            placeholder="e.g. Supplies drinking water to Block A"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </GlassSurface>
      </div>

      <div className="mb-8">
        <SectionHeader title="Preview" />
        <GlassSurface borderRadius={radius.xl} className="flex items-center gap-6 p-5">
          <WaterVessel width={88} height={168} percentage={0.5} color={meta.accent} radius={26} />
          <div>
            <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
              Vessel preview for
            </p>
            <p className="text-lg font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              {meta.label}
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Live levels will appear once a device is connected to this tank.
            </p>
          </div>
        </GlassSurface>
      </div>

      <LiquidButton type="submit" label={submitting ? 'Saving…' : submitLabel} fullWidth disabled={submitting} />
    </form>
  );
}
