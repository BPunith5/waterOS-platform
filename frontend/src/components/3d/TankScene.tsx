import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Grid, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Droplets, Thermometer, Wind, Activity, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import * as THREE from 'three';
import { Tank3D } from './Tank3D';
import type { Tank, TankType } from '@/types';
import { tankTypeMeta, colors } from '@/theme/tokens';

THREE; // ensure import is kept

const SPACING = 5.5;
const COLS = 4;

function getPosition(i: number, total: number): [number, number, number] {
  const cols = Math.min(total, COLS);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const rowLen = i < cols ? Math.min(total, cols) : Math.min(total - row * cols, cols);
  const offset = ((rowLen - 1) * SPACING) / 2;
  return [col * SPACING - offset, 0, row * SPACING * 1.4];
}

function defaultCamera(total: number): [number, number, number] {
  const rows = Math.ceil(total / COLS);
  return [0, 12 + rows * 1.5, 20 + rows * 2.5];
}

/* ── 3-D scene (runs inside Canvas) ─────────────────────────────── */
interface SceneProps {
  tanks: Tank[];
  selectedId: string | null;
  onSelect: (id: string, pos: [number, number, number]) => void;
  onDeselect: () => void;
}

function Scene({ tanks, selectedId, onSelect, onDeselect }: SceneProps) {
  const ctrlRef = useRef<CameraControls>(null!);

  function flyTo(pos: [number, number, number]) {
    ctrlRef.current?.setLookAt(pos[0] + 4.5, 6, pos[2] + 9, pos[0], 1.5, pos[2], true);
  }

  function flyHome() {
    const [cx, cy, cz] = defaultCamera(tanks.length);
    ctrlRef.current?.setLookAt(cx, cy, cz, 0, 0, Math.ceil(tanks.length / COLS) * SPACING * 0.35, true);
  }

  return (
    <>
      <fog attach="fog" args={['#01040F', 20, 50]} />
      <ambientLight intensity={0.28} color="#90b8ff" />
      <directionalLight position={[12, 18, 12]} intensity={0.85} color="#d8f0ff" />
      <directionalLight position={[-8, 14, -6]} intensity={0.35} color="#6090ff" />

      <Stars radius={50} depth={25} count={800} factor={3} fade speed={0.5} />

      <Grid
        args={[60, 60]}
        position={[0, -1.62, 0]}
        cellColor={colors.deepNavy}
        sectionColor={colors.oceanBlue}
        cellSize={1}
        sectionSize={5}
        fadeDistance={35}
        fadeStrength={2}
        infiniteGrid
      />

      {/* invisible floor — click to deselect */}
      <mesh
        position={[0, -1.61, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => { onDeselect(); flyHome(); }}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      <CameraControls
        ref={ctrlRef}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.15}
        dollySpeed={0.6}
        truckSpeed={1.2}
      />

      {tanks.map((tank, i) => {
        const pos = getPosition(i, tanks.length);
        return (
          <Tank3D
            key={tank.id}
            position={pos}
            fillLevel={tank.currentLevel}
            color={tankTypeMeta[tank.type as TankType]?.accent ?? colors.cyan}
            name={tank.name}
            status={tank.status}
            isSelected={selectedId === tank.id}
            onClick={() => { onSelect(tank.id, pos); flyTo(pos); }}
          />
        );
      })}
    </>
  );
}

/* ── Detail panel ─────────────────────────────────────────────── */
function DetailPanel({ tank, onClose, onView }: { tank: Tank; onClose: () => void; onView: () => void }) {
  const meta = tankTypeMeta[tank.type as TankType];
  const accent = meta.accent;
  const Icon = meta.icon;

  const StatusIcon =
    tank.status === 'critical' ? AlertOctagon :
    tank.status === 'warning'  ? AlertTriangle :
    CheckCircle;

  const statusColor =
    tank.status === 'critical' ? colors.danger :
    tank.status === 'warning'  ? colors.warning :
    colors.success;

  const stats = [
    { icon: Droplets,     label: 'pH',        value: tank.ph.toFixed(1),                  unit: '',   color: colors.cyan },
    { icon: Thermometer,  label: 'Temp',       value: tank.temperature.toFixed(1),         unit: '°C', color: colors.warning },
    { icon: Wind,         label: 'Dissolved O₂',value: Math.round(tank.dissolvedOxygen * 100).toString(), unit: '%', color: colors.success },
    { icon: Activity,     label: 'Quality',    value: Math.round(tank.quality * 100).toString(), unit: '%', color: colors.electricBlue },
  ];

  return (
    <div
      style={{
        background: 'rgba(1,4,15,0.9)',
        border: `1px solid ${accent}30`,
        borderRadius: 20,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        padding: 20,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        overflow: 'hidden',
        boxShadow: `0 8px 40px ${accent}18`,
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}40, ${accent}18)`,
            border: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={accent} />
          </div>
          <div>
            <p style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              {tank.name}
            </p>
            <p style={{ color: colors.textTertiary, fontSize: 11, margin: 0, fontFamily: 'Manrope, sans-serif' }}>
              {meta.label}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={14} color={colors.textSecondary} />
        </button>
      </div>

      {/* fill level */}
      <div style={{ background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: 14, padding: '14px 16px' }}>
        <p style={{ color: colors.textTertiary, fontSize: 10, fontWeight: 600, margin: '0 0 4px', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Water Level
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ color: accent, fontSize: 36, fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
            {Math.round(tank.currentLevel * 100)}
          </span>
          <span style={{ color: accent, fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>%</span>
          <span style={{ color: colors.textTertiary, fontSize: 11, fontFamily: 'Manrope, sans-serif', marginLeft: 6 }}>
            of {tank.capacityLiters.toLocaleString()}L
          </span>
        </div>
        {/* progress bar */}
        <div style={{ marginTop: 10, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tank.currentLevel * 100}%` }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${accent}, ${accent}88)`, borderRadius: 4 }}
          />
        </div>
      </div>

      {/* status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: `${statusColor}10`, border: `1px solid ${statusColor}25`, borderRadius: 10 }}>
        <StatusIcon size={14} color={statusColor} />
        <span style={{ color: statusColor, fontSize: 12, fontWeight: 600, fontFamily: 'Manrope, sans-serif', textTransform: 'capitalize' }}>
          {tank.status}
        </span>
        {tank.connected && (
          <span style={{ color: colors.textTertiary, fontSize: 11, marginLeft: 'auto', fontFamily: 'Manrope, sans-serif' }}>
            · Live
          </span>
        )}
      </div>

      {/* sensor stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {stats.map((s) => {
          const SIcon = s.icon;
          return (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <SIcon size={11} color={s.color} />
                <span style={{ color: colors.textTertiary, fontSize: 10, fontFamily: 'Manrope, sans-serif' }}>{s.label}</span>
              </div>
              <p style={{ color: s.color, fontSize: 17, fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                {s.value}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 2 }}>{s.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* location */}
      {tank.location && (
        <p style={{ color: colors.textTertiary, fontSize: 11, margin: 0, fontFamily: 'Manrope, sans-serif' }}>
          📍 {tank.location}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={onView}
        style={{
          marginTop: 'auto',
          background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
          color: '#01040F',
          border: 'none',
          borderRadius: 12,
          padding: '11px 16px',
          fontWeight: 700,
          fontSize: 13,
          fontFamily: 'Outfit, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        View Full Details
        <ExternalLink size={13} />
      </button>
    </div>
  );
}

/* ── Public component ─────────────────────────────────────────── */
export function TankScene({ tanks, onNavigate }: { tanks: Tank[]; onNavigate: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTank = tanks.find((t) => t.id === selectedId) ?? null;
  const [cam] = useState<[number, number, number]>(() => defaultCamera(tanks.length));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 520 }}>
      <Canvas
        camera={{ position: cam, fov: 55 }}
        style={{ background: '#01040F', borderRadius: 16 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene
            tanks={tanks}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onDeselect={() => setSelectedId(null)}
          />
        </Suspense>
      </Canvas>

      {/* detail panel */}
      <AnimatePresence>
        {selectedTank && (
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            style={{ position: 'absolute', top: 12, right: 12, bottom: 12, width: 268 }}
          >
            <DetailPanel
              tank={selectedTank}
              onClose={() => setSelectedId(null)}
              onView={() => onNavigate(selectedTank.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* hint */}
      {!selectedId && tanks.length > 0 && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
          <span style={{ color: colors.textTertiary, fontSize: 11, fontFamily: 'var(--font-body)' }}>
            Click a tank to inspect · Drag to orbit · Scroll to zoom
          </span>
        </div>
      )}

      {/* empty state */}
      {tanks.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <p style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)', fontSize: 14 }}>
            No tanks yet — add one to see it here in 3D
          </p>
        </div>
      )}
    </div>
  );
}
