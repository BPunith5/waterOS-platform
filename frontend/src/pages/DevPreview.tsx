import { useState } from 'react';
import {
  Activity,
  Battery,
  Bell,
  Droplet,
  Gauge,
  Heart,
  LogOut,
  Mail,
  Plus,
  Settings,
  Thermometer,
  Trash2,
  User,
} from 'lucide-react';
import { OceanBackground } from '@/components/water/OceanBackground';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PressableScale } from '@/components/glass/PressableScale';
import { Reveal } from '@/components/glass/Reveal';
import { IconButton } from '@/components/glass/IconButton';
import { StatusPill } from '@/components/glass/StatusPill';
import { FilterPill } from '@/components/glass/FilterPill';
import { StatCard } from '@/components/glass/StatCard';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { MenuRow } from '@/components/glass/MenuRow';
import { PaginationDots } from '@/components/glass/PaginationDots';
import { FloatingBadge } from '@/components/glass/FloatingBadge';
import { LiquidToggle } from '@/components/glass/LiquidToggle';
import { LiquidCheckbox } from '@/components/glass/LiquidCheckbox';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { ActionSheet } from '@/components/glass/ActionSheet';
import { WaterVessel } from '@/components/water/WaterVessel';
import { LiquidGauge } from '@/components/water/LiquidGauge';
import { PulseRing } from '@/components/water/PulseRing';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { HistoryBarChart } from '@/components/water/HistoryBarChart';
import { TankListCard } from '@/components/water/TankListCard';
import { TankPreviewCard } from '@/components/water/TankPreviewCard';
import { colors, tankTypeMeta } from '@/theme/tokens';
import type { HistoryPoint, Tank, TankType } from '@/types';

const tankTypes = Object.keys(tankTypeMeta) as TankType[];

const previewTanks: Tank[] = [
  {
    id: 'tank-001',
    name: 'Main Reservoir',
    type: 'drinking',
    location: 'Rooftop · Block A',
    capacityLiters: 50000,
    currentLevel: 0.78,
    health: 0.94,
    temperature: 21.4,
    ph: 7.2,
    dissolvedOxygen: 0.86,
    quality: 0.96,
    status: 'optimal',
    lastUpdated: '2 min ago',
    trend: 'stable',
    connected: true,
  },
  {
    id: 'tank-005',
    name: 'Rooftop Drinking Tank',
    type: 'drinking',
    location: 'Rooftop · Block B',
    capacityLiters: 30000,
    currentLevel: 0.23,
    health: 0.58,
    temperature: 22.6,
    ph: 6.4,
    dissolvedOxygen: 0.65,
    quality: 0.62,
    status: 'critical',
    lastUpdated: 'Just now',
    trend: 'falling',
    connected: true,
  },
  {
    id: 'tank-002',
    name: 'Tilapia Pond A',
    type: 'aquaculture',
    location: 'Farm Sector 2',
    capacityLiters: 120000,
    currentLevel: 0.64,
    health: 0.88,
    temperature: 26.8,
    ph: 6.8,
    dissolvedOxygen: 0.72,
    quality: 0.9,
    status: 'optimal',
    lastUpdated: '5 min ago',
    trend: 'rising',
    connected: true,
  },
];

const historyData: HistoryPoint[] = [
  { label: 'Mon', value: 0.62 },
  { label: 'Tue', value: 0.7 },
  { label: 'Wed', value: 0.58 },
  { label: 'Thu', value: 0.75 },
  { label: 'Fri', value: 0.81 },
  { label: 'Sat', value: 0.69 },
  { label: 'Sun', value: 0.78 },
];

export function DevPreviewPage() {
  const [activeFilter, setActiveFilter] = useState<TankType>('drinking');
  const [toggleOn, setToggleOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [activeDot] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-12 pb-32">
      <OceanBackground />
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            WaterOS Platform
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            Component preview — deep ocean glassmorphism
          </p>
        </div>
        <div className="flex gap-3">
          <IconButton icon={Bell} badge={3} />
          <IconButton icon={Settings} />
        </div>
      </header>

      <section className="mb-10">
        <SectionHeader title="Glass Surfaces" actionLabel="See all" onAction={() => {}} />
        <div className="grid grid-cols-3 gap-4">
          <Reveal index={0}>
            <GlassSurface tint="default" className="flex h-24 items-center justify-center">
              <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>default</span>
            </GlassSurface>
          </Reveal>
          <Reveal index={1}>
            <GlassSurface tint="bright" className="flex h-24 items-center justify-center">
              <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>bright</span>
            </GlassSurface>
          </Reveal>
          <Reveal index={2}>
            <GlassSurface tint="dark" className="flex h-24 items-center justify-center">
              <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>dark</span>
            </GlassSurface>
          </Reveal>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Water Vessels" />
        <div className="flex flex-wrap items-end gap-6">
          <Reveal index={0}>
            <WaterVessel width={100} height={200} percentage={0.78} color={colors.cyan} />
          </Reveal>
          <Reveal index={1}>
            <WaterVessel width={100} height={200} percentage={0.42} color={colors.warning} />
          </Reveal>
          <Reveal index={2}>
            <WaterVessel width={100} height={200} percentage={0.15} color={colors.danger} />
          </Reveal>
          <Reveal index={3}>
            <WaterVessel width={64} height={132} percentage={0.64} color={colors.success} radius={20} showBubbles={false} />
          </Reveal>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Liquid Gauges & Pulse" />
        <div className="flex flex-wrap items-center gap-6">
          <Reveal index={0}>
            <LiquidGauge
              size={120}
              percentage={0.78}
              color={colors.cyan}
              value="78"
              unit="%"
              label="Water Level"
              icon={<Droplet size={16} color={colors.textPrimary} style={{ marginBottom: 2 }} />}
            />
          </Reveal>
          <Reveal index={1}>
            <LiquidGauge
              size={120}
              percentage={0.86}
              color={colors.aqua}
              value="86"
              unit="%"
              label="Oxygen"
              icon={<Activity size={16} color={colors.textPrimary} style={{ marginBottom: 2 }} />}
            />
          </Reveal>
          <Reveal index={2}>
            <GlassSurface className="relative flex h-32 w-32 items-center justify-center overflow-visible">
              <PulseRing size={56} color={colors.danger} />
              <PulseRing size={56} color={colors.danger} delay={600} />
              <Heart size={22} color={colors.danger} />
            </GlassSurface>
          </Reveal>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Metric Orb Cards" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Reveal index={0}>
            <MetricOrbCard
              icon={<Thermometer size={16} color={colors.textPrimary} style={{ marginBottom: 2 }} />}
              label="Temperature"
              value="21.4"
              unit="°C"
              percentage={0.6}
              color={colors.cyan}
            />
          </Reveal>
          <Reveal index={1}>
            <MetricOrbCard
              icon={<Activity size={16} color={colors.textPrimary} style={{ marginBottom: 2 }} />}
              label="Dissolved Oxygen"
              value="86"
              unit="%"
              percentage={0.86}
              color={colors.success}
            />
          </Reveal>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="History Bar Chart" />
        <HistoryBarChart data={historyData} color={colors.cyan} />
      </section>

      <section className="mb-10">
        <SectionHeader title="Tank Cards" />
        <div className="mb-4 flex flex-col gap-4">
          {previewTanks.map((tank) => (
            <TankListCard key={tank.id} tank={tank} />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {previewTanks.map((tank) => (
            <TankPreviewCard key={tank.id} tank={tank} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Status & Filters" />
        <div className="mb-4 flex gap-3">
          <StatusPill status="optimal" />
          <StatusPill status="warning" />
          <StatusPill status="critical" />
        </div>
        <div className="flex flex-wrap gap-3">
          {tankTypes.map((type) => (
            <FilterPill
              key={type}
              label={tankTypeMeta[type].label}
              active={activeFilter === type}
              onClick={() => setActiveFilter(type)}
              gradient={tankTypeMeta[type].gradient}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Stats" />
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Droplet} value="3" label="Total Tanks" color={colors.cyan} />
          <StatCard icon={Activity} value="2" label="Active Devices" color={colors.success} />
          <StatCard icon={Gauge} value="78%" label="Water Level" color={colors.aqua} />
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Menu Rows" />
        <GlassSurface className="flex flex-col px-5">
          <MenuRow icon={User} label="Profile" value="Edit" />
          <MenuRow icon={Mail} label="Notifications" rightElement={<LiquidToggle value={toggleOn} onChange={setToggleOn} />} showChevron={false} />
          <MenuRow icon={Battery} label="Device Health" value="92%" />
          <MenuRow icon={Trash2} label="Delete Tank" danger />
          <MenuRow icon={LogOut} label="Log Out" danger showChevron={false} />
        </GlassSurface>
      </section>

      <section className="mb-10">
        <SectionHeader title="Controls" />
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <LiquidToggle value={toggleOn} onChange={setToggleOn} />
            <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>Toggle</span>
          </div>
          <div className="flex items-center gap-3">
            <LiquidCheckbox checked={checked} onToggle={() => setChecked((c) => !c)} />
            <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>Checkbox</span>
          </div>
          <PaginationDots count={3} activeIndex={activeDot} />
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Buttons" />
        <div className="flex flex-wrap gap-4">
          <LiquidButton label="Primary" variant="primary" icon={<Plus size={18} color={colors.textInverse} />} />
          <LiquidButton label="Glass" variant="glass" />
          <LiquidButton label="Ghost" variant="ghost" />
          <LiquidButton label="Disabled" variant="primary" disabled />
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Inputs" />
        <GlassInput label="Email" icon={Mail} placeholder="you@example.com" />
        <GlassInput label="With error" icon={User} placeholder="Username" error="This field is required" />
      </section>

      <section className="relative mb-32 h-40">
        <SectionHeader title="Floating Badge" />
        <GlassSurface className="relative flex h-32 items-center justify-center overflow-visible">
          <FloatingBadge icon={Droplet} label="Live data" color={colors.cyan} style={{ top: 16, left: 24 }} />
          <FloatingBadge icon={Activity} label="92% health" color={colors.success} delay={0.6} style={{ bottom: 16, right: 24 }} />
          <span className="text-sm" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            badges bob gently
          </span>
        </GlassSurface>
      </section>

      <section className="mb-10">
        <SectionHeader title="Action Sheet" />
        <PressableScale onClick={() => setSheetOpen(true)}>
          <GlassSurface className="flex items-center justify-center px-6 py-4">
            <span className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}>
              Open action sheet
            </span>
          </GlassSurface>
        </PressableScale>
        <ActionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Tank Options"
          items={[
            { key: 'edit', label: 'Edit Tank', icon: Settings, onClick: () => {} },
            { key: 'delete', label: 'Delete Tank', icon: Trash2, destructive: true, onClick: () => {} },
          ]}
        />
      </section>
    </div>
  );
}
