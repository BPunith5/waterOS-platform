import { useState } from 'react';
import {
  Activity,
  Battery,
  Bell,
  Droplet,
  Gauge,
  LogOut,
  Mail,
  Plus,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
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
import { colors, tankTypeMeta } from '@/theme/tokens';
import type { TankType } from '@/types';

const tankTypes = Object.keys(tankTypeMeta) as TankType[];

export function DevPreviewPage() {
  const [activeFilter, setActiveFilter] = useState<TankType>('drinking');
  const [toggleOn, setToggleOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [activeDot] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-12 pb-32">
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
