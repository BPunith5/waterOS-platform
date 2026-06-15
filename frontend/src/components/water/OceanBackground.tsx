import type { ReactNode } from 'react';
import { WaveLayer } from './WaveLayer';
import { BubbleField } from './BubbleField';
import { AuroraBlobs } from './AuroraBlobs';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

type OceanBackgroundProps = {
  children?: ReactNode;
  bubbles?: boolean;
  waves?: boolean;
  variant?: 'deep' | 'surface';
};

/**
 * Full-screen animated ocean backdrop: deep gradient, three parallax
 * wave layers, and an optional ambient bubble field. Mounted once at
 * the app root so it stays fixed behind every route.
 */
export function OceanBackground({ children, bubbles = true, waves = true, variant = 'deep' }: OceanBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: linearGradient(variant === 'deep' ? gradients.oceanDeep : gradients.oceanSurface, 115) }}
      />
      <AuroraBlobs />
      {bubbles && (
        <>
          <BubbleField count={18} />
          <BubbleField count={16} seedOffset={777} />
        </>
      )}
      {waves && (
        <>
          <WaveLayer color={colors.oceanBlue} opacity={0.55} amplitude={22} baseline={0.55} duration={16000} height={260} bottom={-60} />
          <WaveLayer color={colors.midOcean} opacity={0.45} amplitude={30} baseline={0.6} duration={11000} height={240} bottom={-80} reverse />
          <WaveLayer color={colors.surfaceBlue} opacity={0.3} amplitude={16} baseline={0.7} duration={20000} height={220} bottom={-100} />
        </>
      )}
      {children}
    </div>
  );
}
