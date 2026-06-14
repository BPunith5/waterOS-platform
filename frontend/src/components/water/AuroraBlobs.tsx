import { motion } from 'framer-motion';
import { colors } from '@/theme/tokens';

/**
 * Two large soft blurred color blobs that slowly drift behind hero
 * content, adding ambient depth without competing with the waves/bubbles.
 */
export function AuroraBlobs() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="aurora-blob"
        style={{ top: '-10%', left: '-10%', width: '60vw', height: '60vw', maxWidth: 560, maxHeight: 560, backgroundColor: colors.cyan }}
        animate={{ x: ['0%', '12%', '0%'], y: ['0%', '8%', '0%'] }}
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora-blob"
        style={{ bottom: '-15%', right: '-10%', width: '55vw', height: '55vw', maxWidth: 520, maxHeight: 520, backgroundColor: colors.teal }}
        animate={{ x: ['0%', '-10%', '0%'], y: ['0%', '-6%', '0%'] }}
        transition={{ duration: 44, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
