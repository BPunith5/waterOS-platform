import { motion } from 'framer-motion';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { colors, radius } from '@/theme/tokens';
import type { HistoryPoint } from '@/types';

type Props = {
  data: HistoryPoint[];
  color: string;
  height?: number;
};

/** Animated glass bar chart used for 7-day trends on detail & analytics screens. */
export function HistoryBarChart({ data, color, height = 140 }: Props) {
  const trackHeight = height - 28;

  return (
    <GlassSurface className="p-4">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((point, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="flex w-[56%] items-end overflow-hidden"
              style={{ height: trackHeight, borderRadius: radius.pill, backgroundColor: colors.glassFill }}
            >
              <motion.div
                className="w-full overflow-hidden"
                style={{ borderRadius: radius.pill, backgroundImage: `linear-gradient(to top, ${color}, ${color}22)` }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(0.04, point.value) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </div>
            <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: colors.textTertiary }}>
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </GlassSurface>
  );
}
