import type { LucideIcon } from 'lucide-react';
import { GlassSurface } from './GlassSurface';
import { PressableScale } from './PressableScale';
import { colors } from '@/theme/tokens';

type IconButtonProps = {
  icon: LucideIcon;
  onClick?: () => void;
  badge?: number;
  size?: number;
  className?: string;
};

export function IconButton({ icon: Icon, onClick, badge, size = 44, className }: IconButtonProps) {
  return (
    <PressableScale onClick={onClick} className={`relative inline-block ${className ?? ''}`}>
      <GlassSurface
        borderRadius={size / 2}
        style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon size={size * 0.45} color={colors.textPrimary} strokeWidth={2} />
      </GlassSurface>
      {!!badge && (
        <span
          className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill border-2 px-1 text-[10px] font-bold"
          style={{ backgroundColor: colors.danger, borderColor: colors.abyss, color: colors.textPrimary, fontFamily: 'var(--font-body)' }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </PressableScale>
  );
}
