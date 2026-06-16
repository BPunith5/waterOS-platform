import { useId } from 'react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { colors } from '@/theme/tokens';

type Props = {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  yMin?: number;
  yMax?: number;
  yFormat?: (v: number) => string;
  title?: string;
  unit?: string;
  className?: string;
};

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = i > 0 ? pts[i - 1] : pts[i];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const [x3, y3] = i < pts.length - 2 ? pts[i + 2] : pts[i + 1];
    const cp1x = x1 + (x2 - x0) / 5;
    const cp1y = y1 + (y2 - y0) / 5;
    const cp2x = x2 - (x3 - x1) / 5;
    const cp2y = y2 - (y3 - y1) / 5;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`;
  }
  return d;
}

export function TrendChart({ data, labels = [], color = colors.cyan, height = 160, yMin, yMax, yFormat = (v) => `${Math.round(v)}`, title, unit, className = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  if (!data.length) return null;

  const W = 400;
  const H = height;
  const padL = 34, padR = 10, padT = 12, padB = labels.length > 0 ? 22 : 10;
  const drawW = W - padL - padR;
  const drawH = H - padT - padB;

  const dMin = yMin ?? Math.min(...data);
  const dMax = yMax ?? Math.max(...data);
  const range = Math.max(dMax - dMin, 0.0001);

  const toX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * drawW;
  const toY = (v: number) => padT + drawH - Math.max(0, Math.min(1, (v - dMin) / range)) * drawH;

  const pts: [number, number][] = data.map((v, i) => [toX(i), toY(v)]);
  const linePath = smoothPath(pts);
  const areaPath = data.length > 1
    ? `${linePath} L${toX(data.length - 1).toFixed(2)},${(padT + drawH).toFixed(2)} L${padL},${(padT + drawH).toFixed(2)} Z`
    : '';

  const gridPcts = [0, 0.25, 0.5, 0.75, 1];
  const last = pts[pts.length - 1];

  return (
    <GlassSurface className={`overflow-hidden p-0 ${className}`}>
      {(title || unit) && (
        <div className="flex items-center justify-between px-4 py-2.5">
          {title && (
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
              {title}
            </span>
          )}
          {unit && (
            <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
              {unit}
            </span>
          )}
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`tc-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridPcts.map((pct) => {
          const y = padT + drawH - pct * drawH;
          const val = dMin + pct * range;
          return (
            <g key={pct}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize={8} fill="rgba(244,251,255,0.35)" fontFamily="var(--font-body)">
                {yFormat(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill={`url(#tc-${uid})`} />}

        {/* Smooth line */}
        {linePath && <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}

        {/* Last point dot */}
        {last && <circle cx={last[0]} cy={last[1]} r={3} fill={color} />}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const step = Math.max(1, Math.ceil(labels.length / 7));
          if (i % step !== 0 && i !== labels.length - 1) return null;
          return (
            <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize={8} fill="rgba(244,251,255,0.35)" fontFamily="var(--font-body)">
              {label}
            </text>
          );
        })}
      </svg>
    </GlassSurface>
  );
}
