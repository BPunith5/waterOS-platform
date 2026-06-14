import { GlassSurface } from './GlassSurface';
import { radius } from '@/theme/tokens';

type SkeletonProps = {
  className?: string;
  borderRadius?: number;
};

/** A shimmering glass placeholder shown while content loads. */
export function Skeleton({ className = '', borderRadius: br = radius.lg }: SkeletonProps) {
  return <GlassSurface borderRadius={br} className={`glass-shimmer ${className}`} />;
}
