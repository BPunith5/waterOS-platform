import { Outlet } from 'react-router-dom';
import { OceanBackground } from '@/components/water/OceanBackground';
import { LiquidTabBar } from '@/components/navigation/LiquidTabBar';

export function AppShell() {
  return (
    <div className="relative min-h-screen">
      <OceanBackground />
      <main className="relative px-4 pb-32 pt-6 md:pl-28 md:pb-10 md:pr-6">
        <Outlet />
      </main>
      <LiquidTabBar />
    </div>
  );
}
