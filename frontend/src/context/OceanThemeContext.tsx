import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TankType } from '@/types';

type OceanThemeContextValue = {
  tankType: TankType | null;
  setTankType: (tankType: TankType | null) => void;
};

const OceanThemeContext = createContext<OceanThemeContextValue | undefined>(undefined);

export function OceanThemeProvider({ children }: { children: ReactNode }) {
  const [tankType, setTankType] = useState<TankType | null>(null);
  return <OceanThemeContext.Provider value={{ tankType, setTankType }}>{children}</OceanThemeContext.Provider>;
}

export function useOceanTheme() {
  const ctx = useContext(OceanThemeContext);
  if (!ctx) throw new Error('useOceanTheme must be used within OceanThemeProvider');
  return ctx;
}

/** Retints the ocean background to match `tankType` for as long as the calling page is mounted. */
export function useOceanAccent(tankType: TankType | null) {
  const { setTankType } = useOceanTheme();
  useEffect(() => {
    setTankType(tankType);
    return () => setTankType(null);
  }, [tankType, setTankType]);
}
