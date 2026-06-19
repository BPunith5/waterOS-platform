import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Tank3D } from './Tank3D';
import type { Tank } from '@/types';

interface Props {
  tank: Tank;
  color: string;
}

function Scene({ tank, color }: Props) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 7, 5]} intensity={2.8} color="#22D3EE" />
      <pointLight position={[-5, 4, -4]} intensity={1.6} color="#2DD4BF" />
      <pointLight position={[0, -1, 5]} intensity={1.0} color={color} />
      <Stars radius={20} depth={8} count={700} factor={2.2} fade speed={0.5} />
      <Tank3D
        position={[0, 0, 0]}
        fillLevel={tank.connected ? tank.currentLevel : 0}
        color={color}
        name={tank.name}
        status={tank.status}
        isSelected
        onClick={() => {}}
        showLabel={false}
        animated={tank.connected}
      />
      {/* soft ground reflection disk */}
      <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 48]} />
        <meshStandardMaterial color={color} transparent opacity={0.06} />
      </mesh>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.0}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.68}
      />
    </>
  );
}

export function TankDetail3D({ tank, color }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 6.2], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#010615']} />
      <fog attach="fog" args={['#010615', 12, 26]} />
      <Suspense fallback={null}>
        <Scene tank={tank} color={color} />
      </Suspense>
    </Canvas>
  );
}
