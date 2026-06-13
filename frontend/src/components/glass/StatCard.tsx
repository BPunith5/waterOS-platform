import type { LucideIcon } from 'lucide-react';
import { GlassSurface } from './GlassSurface';
import { colors, radius } from '@/theme/tokens';

type StatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  color?: string;
  className?: string;
};

export function StatCard({ icon: Icon, value, label, color = colors.cyan, className }: StatCardProps) {
  return (
    <GlassSurface borderRadius={radius.lg} className={`flex flex-1 flex-col gap-2 p-4 ${className ?? ''}`}>
      <div
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full border"
        style={{ backgroundColor: `${color}22`, borderColor: `${color}55` }}
      >
        <Icon size={17} color={color} />
      </div>
      <span className="truncate text-lg font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
        {value}
      </span>
      <span className="truncate text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
    </GlassSurface>
  );
}
