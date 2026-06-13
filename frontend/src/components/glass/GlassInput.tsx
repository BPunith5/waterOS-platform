import { useState, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { GlassSurface } from './GlassSurface';
import { colors, radius, shadows } from '@/theme/tokens';

type GlassInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  error?: string;
};

export function GlassInput({
  label,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  error,
  className,
  onFocus,
  onBlur,
  ...inputProps
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="mb-2 ml-1 block text-sm font-medium" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <GlassSurface
        borderRadius={radius.md}
        className="w-full"
        style={{
          boxShadow: focused ? shadows.glow(colors.cyan, 0.25) : error ? shadows.glow(colors.danger, 0.2) : undefined,
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <div
          className="flex items-center gap-3 rounded-md border px-[18px] py-4 transition-colors"
          style={{
            borderRadius: radius.md,
            borderColor: error
              ? 'rgba(251, 113, 133, 0.55)'
              : focused
                ? 'rgba(34, 211, 238, 0.55)'
                : 'transparent',
          }}
        >
          {Icon && <Icon size={18} color={error ? colors.danger : focused ? colors.cyan : colors.textTertiary} />}
          <input
            {...inputProps}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={`w-full flex-1 bg-transparent text-base outline-none ${className ?? ''}`}
            style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}
          />
          {RightIcon && (
            <button type="button" onClick={onRightIconClick} className="shrink-0">
              <RightIcon size={18} color={colors.textTertiary} />
            </button>
          )}
        </div>
      </GlassSurface>
      {error && (
        <p className="mt-1.5 ml-1 text-xs" style={{ color: colors.danger, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
