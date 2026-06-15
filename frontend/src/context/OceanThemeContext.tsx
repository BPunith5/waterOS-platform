import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TankType } from '@/types';

type OceanThemeContextValue = {
  tankType: TankType | null;
  setTankType: (tankType: TankType | null) => void;
  waterLevel: number | null;
  setWaterLevel: (waterLevel: number | null) => void;
};

const OceanThemeContext = createContext<OceanThemeContextValue | undefined>(undefined);

export function OceanThemeProvider({ children }: { children: ReactNode }) {
  const [tankType, setTankType] = useState<TankType | null>(null);
  const [waterLevel, setWaterLevel] = useState<number | null>(null);
  return (
    <OceanThemeContext.Provider value={{ tankType, setTankType, waterLevel, setWaterLevel }}>
      {children}
    </OceanThemeContext.Provider>
  );
}

export function useOceanTheme() {
  const ctx = useContext(OceanThemeContext);
  if (!ctx) throw new Error('useOceanTheme must be used within OceanThemeProvider');
  return ctx;
}

/**
 * Retints the ocean background to match `tankType` and raises or lowers
 * the water line to reflect `waterLevel` (0-1), for as long as the
 * calling page is mounted.
 */
export function useOceanAccent(tankType: TankType | null, waterLevel: number | null = null) {
  const { setTankType, setWaterLevel } = useOceanTheme();

  useEffect(() => {
    setTankType(tankType);
    return () => setTankType(null);
  }, [tankType, setTankType]);

  useEffect(() => {
    setWaterLevel(waterLevel);
    return () => setWaterLevel(null);
  }, [waterLevel, setWaterLevel]);
}
