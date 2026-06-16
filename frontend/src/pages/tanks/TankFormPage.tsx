import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { TankForm, type TankFormValues } from '@/components/tank/TankForm';
import { api } from '@/lib/api';
import { colors } from '@/theme/tokens';

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
        navigate(`/tanks/${tank._id}`, { replace: true });
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
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
        >
          {mode === 'create' ? 'Add New Tank' : 'Edit Tank'}
        </h1>
        <IconButton icon={X} onClick={() => navigate(-1)} />
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      {!loading && (
        <TankForm
          initial={initial}
          submitLabel={mode === 'create' ? 'Add Tank' : 'Save Changes'}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
