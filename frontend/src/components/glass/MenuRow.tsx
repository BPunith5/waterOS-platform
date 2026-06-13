import type { ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { PressableScale } from './PressableScale';
import { colors } from '@/theme/tokens';

type MenuRowProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  showChevron?: boolean;
  rightElement?: ReactNode;
};

export function MenuRow({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
  showChevron = true,
  rightElement,
}: MenuRowProps) {
  return (
    <PressableScale onClick={onClick} scaleTo={0.985} className="w-full">
      <div className="flex items-center gap-4 py-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
          style={{
            backgroundColor: danger ? `${colors.danger}1A` : colors.glassFill,
            borderColor: danger ? `${colors.danger}55` : colors.glassBorder,
          }}
        >
          <Icon size={18} color={danger ? colors.danger : colors.textPrimary} />
        </div>
        <span
          className="flex-1 truncate text-left text-base font-medium"
          style={{ color: danger ? colors.danger : colors.textPrimary, fontFamily: 'var(--font-body)' }}
        >
          {label}
        </span>
        {value && (
          <span className="text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            {value}
          </span>
        )}
        {rightElement}
        {showChevron && !rightElement && <ChevronRight size={18} color={colors.textTertiary} />}
      </div>
    </PressableScale>
  );
}
