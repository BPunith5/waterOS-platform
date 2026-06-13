import { GlassSurface } from './GlassSurface';
import { PressableScale } from './PressableScale';
import { colors, gradients, radius } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

type FilterPillProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  gradient?: readonly string[];
};

export function FilterPill({ label, active, onClick, gradient }: FilterPillProps) {
  return (
    <PressableScale onClick={onClick}>
      <GlassSurface borderRadius={radius.pill} bordered={!active} className="px-[18px] py-[9px]">
        {active && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: linearGradient(gradient ?? gradients.aquaGlow) }}
          />
        )}
        <span
          className="relative whitespace-nowrap text-sm font-semibold"
          style={{ color: active ? colors.textInverse : colors.textSecondary, fontFamily: 'var(--font-body)' }}
        >
          {label}
        </span>
      </GlassSurface>
    </PressableScale>
  );
}
