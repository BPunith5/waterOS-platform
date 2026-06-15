import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Check, Cpu } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { TankForm, type TankFormValues } from '@/components/tank/TankForm';
import { api } from '@/lib/api';
import { colors, radius } from '@/theme/tokens';

type Props = {
  mode: 'create' | 'edit';
};

export function TankFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [initial, setInitial] = useState<Partial<TankFormValues> | undefined>(undefined);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTank, setCreatedTank] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    api.tanks
      .get(id)
      .then((tank) => {
        setInitial({
          tankName: tank.tankName,
          tankType: tank.tankType,
          location: tank.location ?? '',
          capacity: tank.capacity,
          description: tank.description ?? '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load tank'))
      .finally(() => setLoading(false));
  }, [mode, id]);

  async function handleSubmit(values: TankFormValues) {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'create') {
        const tank = await api.tanks.create(values);
        setCreatedTank({ id: tank._id, name: tank.tankName });
      } else if (id) {
        await api.tanks.update(id, values);
        navigate(`/tanks/${id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tank');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          {createdTank ? 'Tank Created' : mode === 'create' ? 'Add New Tank' : 'Edit Tank'}
        </h1>
        <IconButton icon={X} onClick={() => (createdTank ? navigate(`/tanks/${createdTank.id}`) : navigate(-1))} />
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      {createdTank ? (
        <GlassSurface borderRadius={radius.xl} className="flex flex-col items-center gap-4 p-6 text-center">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.success}22`, border: `1px solid ${colors.success}55` }}
          >
            <Check size={22} color={colors.success} />
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
              "{createdTank.name}" was added
            </p>
            <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              Connect an IoT sensor now to start seeing live readings, or skip and add one later. Without a sensor,
              this tank won't show any live data.
            </p>
          </div>
          <LiquidButton
            label="Connect IoT Sensor"
            variant="primary"
            icon={<Cpu size={18} color={colors.textInverse} />}
            fullWidth
            onClick={() => navigate(`/devices/add?tankId=${createdTank.id}`)}
          />
          <LiquidButton label="Skip for Now" variant="ghost" fullWidth onClick={() => navigate(`/tanks/${createdTank.id}`, { replace: true })} />
        </GlassSurface>
      ) : (
        !loading && (
          <TankForm
            initial={initial}
            submitLabel={mode === 'create' ? 'Add Tank' : 'Save Changes'}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )
      )}
    </div>
  );
}
