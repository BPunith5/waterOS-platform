import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { GlassSurface } from './GlassSurface';
import { PressableScale } from './PressableScale';
import { colors, radius } from '@/theme/tokens';

export type ActionSheetItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  onClick: () => void;
};

type ActionSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
};

export function ActionSheet({ open, onClose, title, items }: ActionSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(1, 4, 15, 0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-6 bottom-8 z-50 flex flex-col gap-2"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          >
            <GlassSurface borderRadius={radius.xl} tint="dark" className="px-6">
              {title && (
                <p
                  className="truncate py-4 text-center text-sm font-semibold"
                  style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
                >
                  {title}
                </p>
              )}
              {items.map((item, i) => (
                <div key={item.key}>
                  {i > 0 && <div className="h-px" style={{ backgroundColor: colors.glassBorder }} />}
                  <PressableScale
                    onClick={() => {
                      onClose();
                      item.onClick();
                    }}
                    className="flex items-center gap-4 py-4"
                  >
                    <item.icon size={20} color={item.destructive ? colors.danger : colors.textPrimary} />
                    <span
                      className="text-base font-medium"
                      style={{ color: item.destructive ? colors.danger : colors.textPrimary, fontFamily: 'var(--font-body)' }}
                    >
                      {item.label}
                    </span>
                  </PressableScale>
                </div>
              ))}
            </GlassSurface>
            <PressableScale onClick={onClose}>
              <GlassSurface borderRadius={radius.xl} className="flex items-center justify-center py-4">
                <span className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}>
                  Cancel
                </span>
              </GlassSurface>
            </PressableScale>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
