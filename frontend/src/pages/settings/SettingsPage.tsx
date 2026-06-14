import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronLeft,
  CloudDownload,
  FileText,
  Globe,
  Info,
  Mail,
  Moon,
  Volume2,
  Bell,
} from 'lucide-react';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { IconButton } from '@/components/glass/IconButton';
import { LiquidToggle } from '@/components/glass/LiquidToggle';
import { MenuRow } from '@/components/glass/MenuRow';
import { colors, gradients, radius } from '@/theme/tokens';

const SETTINGS_KEY = 'waterOS_settings';

type Units = 'metric' | 'imperial';

type Settings = {
  pushEnabled: boolean;
  criticalOnly: boolean;
  emailReports: boolean;
  soundEffects: boolean;
  units: Units;
};

const DEFAULT_SETTINGS: Settings = {
  pushEnabled: true,
  criticalOnly: false,
  emailReports: true,
  soundEffects: true,
  units: 'metric',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Divider() {
  return <div className="h-px" style={{ backgroundColor: colors.glassBorder, marginLeft: 48 }} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 ml-1 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-heading)' }}>
      {children}
    </p>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <IconButton icon={ChevronLeft} onClick={() => navigate(-1)} />
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Settings
        </h1>
      </div>

      <SectionLabel>Notifications</SectionLabel>
      <GlassSurface borderRadius={radius.lg} className="mb-8 flex flex-col gap-0 px-4">
        <MenuRow
          icon={Bell}
          label="Push Notifications"
          showChevron={false}
          rightElement={<LiquidToggle value={settings.pushEnabled} onChange={(v) => update('pushEnabled', v)} />}
        />
        <Divider />
        <MenuRow
          icon={AlertCircle}
          label="Critical Alerts Only"
          showChevron={false}
          rightElement={<LiquidToggle value={settings.criticalOnly} onChange={(v) => update('criticalOnly', v)} />}
        />
        <Divider />
        <MenuRow
          icon={Mail}
          label="Weekly Email Reports"
          showChevron={false}
          rightElement={<LiquidToggle value={settings.emailReports} onChange={(v) => update('emailReports', v)} />}
        />
        <Divider />
        <MenuRow
          icon={Volume2}
          label="Sound Effects"
          showChevron={false}
          rightElement={<LiquidToggle value={settings.soundEffects} onChange={(v) => update('soundEffects', v)} />}
        />
      </GlassSurface>

      <SectionLabel>Preferences</SectionLabel>
      <GlassSurface borderRadius={radius.lg} className="mb-8 flex flex-col gap-0 px-4">
        <div className="flex flex-col gap-2 py-3">
          <span className="text-base font-medium" style={{ color: colors.textPrimary, fontFamily: 'var(--font-body)' }}>
            Measurement Units
          </span>
          <div className="flex gap-2">
            <FilterPill label="Metric" active={settings.units === 'metric'} onClick={() => update('units', 'metric')} gradient={gradients.aquaGlow} />
            <FilterPill label="Imperial" active={settings.units === 'imperial'} onClick={() => update('units', 'imperial')} gradient={gradients.aquaGlow} />
          </div>
        </div>
        <Divider />
        <MenuRow icon={Moon} label="Theme" value="Dark (Ocean)" showChevron={false} />
        <Divider />
        <MenuRow icon={Globe} label="Language" value="English" />
      </GlassSurface>

      <SectionLabel>Data &amp; Privacy</SectionLabel>
      <GlassSurface borderRadius={radius.lg} className="mb-8 flex flex-col gap-0 px-4">
        <MenuRow icon={CloudDownload} label="Export Data" />
        <Divider />
        <MenuRow icon={FileText} label="Privacy Policy" />
      </GlassSurface>

      <SectionLabel>About</SectionLabel>
      <GlassSurface borderRadius={radius.lg} className="mb-8 flex flex-col gap-0 px-4">
        <MenuRow icon={Info} label="App Version" value="1.0.0" showChevron={false} />
        <Divider />
        <MenuRow icon={FileText} label="Terms of Service" />
      </GlassSurface>
    </div>
  );
}
