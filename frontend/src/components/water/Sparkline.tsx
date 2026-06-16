import { useId } from 'react';
import { colors } from '@/theme/tokens';

type Props = {
  data: number[];    // raw values (any range)
  color?: string;
  width?: number;
  height?: number;
  /** If true, line color turns danger when trend is negative */
  trendColor?: boolean;
};

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const cpx = (x1 + x2) / 2;
    d += ` C${cpx.toFixed(2)},${y1.toFixed(2)} ${cpx.toFixed(2)},${y2.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`;
  }
  return d;
}

export function Sparkline({ data, color = colors.cyan, width = 80, height = 28, trendColor = false }: Props) {
  const uid = useId().replace(/:/g, '');
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 0.0001);
  const pad = 2;
  const drawH = height - pad * 2;

  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    pad + drawH - ((v - min) / range) * drawH,
  ]);

  const linePath = smoothPath(pts);
  const last = pts[pts.length - 1];
  const delta = data[data.length - 1] - data[0];
  const lineColor = trendColor && delta < 0 ? colors.danger : color;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sp-${uid})`} />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={lineColor} />
    </svg>
  );
}
