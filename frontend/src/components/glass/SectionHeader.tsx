import { colors } from '@/theme/tokens';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <h2 className="text-xl" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
        {title}
      </h2>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold"
          style={{ color: colors.cyan, fontFamily: 'var(--font-body)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
