import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import { Tank3D } from './Tank3D';
import { colors } from '@/theme/tokens';

const DEMO_TANKS: {
  name: string;
  level: number;
  color: string;
  status: 'optimal' | 'warning' | 'critical';
  pos: [number, number, number];
}[] = [
  { name: 'Drinking',     level: 0.73, color: colors.cyan,         status: 'optimal', pos: [-5.5, 0, -1.5] },
  { name: 'Aquaculture',  level: 0.45, color: colors.success,      status: 'warning', pos: [-1.8, 0,  1.5] },
  { name: 'Industrial',   level: 0.62, color: '#7C8FE8',           status: 'optimal', pos: [ 1.8, 0, -1.5] },
  { name: 'Irrigation',   level: 0.88, color: '#A3E635',           status: 'optimal', pos: [ 5.5, 0,  1.5] },
];

function HeroSceneInner() {
  return (
    <>
      <fog attach="fog" args={['#01040F', 14, 38]} />
      <ambientLight intensity={0.35} color="#90c8ff" />
      <directionalLight position={[8, 14, 8]}  intensity={0.9} color="#e0f4ff" castShadow />
      <directionalLight position={[-6, 10, -4]} intensity={0.4} color="#80aaff" />

      <Stars radius={40} depth={20} count={600} factor={3} fade speed={0.6} />

      <Grid
        args={[30, 30]}
        position={[0, -1.62, 0]}
        cellColor={colors.deepNavy}
        sectionColor={colors.oceanBlue}
        cellSize={1}
        sectionSize={4}
        fadeDistance={22}
        fadeStrength={1.8}
        infiniteGrid
      />

      {DEMO_TANKS.map((t) => (
        <Tank3D
          key={t.name}
          position={t.pos}
          fillLevel={t.level}
          color={t.color}
          name={t.name}
          status={t.status}
          isSelected={false}
          onClick={() => {}}
          animated
        />
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.7}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export function HeroScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 9, 16], fov: 50 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <HeroSceneInner />
      </Suspense>
    </Canvas>
  );
}
