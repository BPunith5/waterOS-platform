import { Cog, Droplet, Fish, Leaf, type LucideIcon } from 'lucide-react';
import type { TankType, VesselShape } from '@/types';

// WaterOS design tokens — deep ocean glassmorphism design language (web port).

export const colors = {
  // Core ocean backdrop
  abyss: '#01040F',
  deepNavy: '#03142E',
  oceanBlue: '#06294D',
  midOcean: '#0A3D62',
  surfaceBlue: '#0F5E8C',

  // Glow / accent
  aqua: '#4DE8E6',
  cyan: '#22D3EE',
  teal: '#2DD4BF',
  seafoam: '#5EEAD4',
  electricBlue: '#3B82F6',

  // Status
  success: '#34D8A6',
  warning: '#FBBF24',
  danger: '#FB7185',
  info: '#60A5FA',

  // Text
  textPrimary: '#F4FBFF',
  textSecondary: 'rgba(244, 251, 255, 0.68)',
  textTertiary: 'rgba(244, 251, 255, 0.42)',
  textInverse: '#03142E',

  // Glass surfaces
  glassFill: 'rgba(255, 255, 255, 0.08)',
  glassFillStrong: 'rgba(255, 255, 255, 0.14)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassBorderBright: 'rgba(255, 255, 255, 0.35)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',

  white: '#FFFFFF',
  black: '#000000',
} as const;

// Background gradients — used for full-screen ocean backdrops and accents
export const gradients = {
  ocean: ['#01040F', '#03142E', '#0A3D62'],
  oceanDeep: ['#000308', '#01142B', '#06294D'],
  oceanSurface: ['#0A3D62', '#0F5E8C', '#1487B8'],
  glassPanel: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.04)'],
  glassPanelStrong: ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)'],
  aquaGlow: ['#4DE8E6', '#22D3EE', '#3B82F6'],
  tealGlow: ['#5EEAD4', '#2DD4BF', '#0F5E8C'],
  warmGlow: ['#FFE29F', '#FBBF24', '#FB923C'],
  dangerGlow: ['#FFB3B3', '#FB7185', '#E11D48'],
  drinking: ['#7FE9FF', '#22D3EE', '#0F5E8C'],
  aquaculture: ['#9CFFD9', '#34D8A6', '#0A3D62'],
  industrial: ['#C9D6FF', '#7C8FE8', '#3D2E8C'],
  irrigation: ['#D6FFB3', '#A3E635', '#1F7A4D'],
} as const;

export const typography = {
  fontFamily: {
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 42,
    hero: 56,
  },
} as const;

export const radius = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Converts a `#rrggbb` hex color to an `rgba(...)` string. */
export function hexToRgba(hex: string, alpha = 1) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const shadows = {
  /** Soft colored glow shadow, e.g. behind primary buttons / active icons. */
  glow: (color: string, opacity = 0.45) =>
    `0 8px 24px ${hexToRgba(color, opacity)}`,
  soft: '0 10px 20px rgba(0, 8, 20, 0.35)',
};

export const tankTypeMeta: Record<
  TankType,
  { label: string; gradient: readonly string[]; icon: LucideIcon; accent: string; shape: VesselShape }
> = {
  drinking: {
    label: 'Drinking Water',
    gradient: gradients.drinking,
    icon: Droplet,
    accent: colors.cyan,
    shape: 'rect',
  },
  aquaculture: {
    label: 'Aquaculture',
    gradient: gradients.aquaculture,
    icon: Fish,
    accent: colors.success,
    shape: 'round',
  },
  industrial: {
    label: 'Industrial',
    gradient: gradients.industrial,
    icon: Cog,
    accent: '#7C8FE8',
    shape: 'cone',
  },
  irrigation: {
    label: 'Irrigation',
    gradient: gradients.irrigation,
    icon: Leaf,
    accent: '#A3E635',
    shape: 'pill',
  },
};
