import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const H = 2.0;
const R = 0.70;
const SEGS = 16;

function TankScene({
  fillLevel,
  color,
  status,
}: {
  fillLevel: number;
  color: string;
  status: 'optimal' | 'warning' | 'critical';
}) {
  const surfRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const glowColor =
    status === 'critical' ? '#FB7185' : status === 'warning' ? '#FBBF24' : color;

  const clampedFill = Math.max(0.04, fillLevel);
  const wH = clampedFill * H;
  const wY = -H / 2 + wH / 2;
  const surfY = -H / 2 + wH;

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.55;
    if (surfRef.current) {
      surfRef.current.position.y =
        surfY + Math.sin(state.clock.elapsedTime * 1.3) * 0.016;
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight color={glowColor} intensity={1.6} distance={4.5} decay={2} />

      {/* glass shell */}
      <mesh>
        <cylinderGeometry args={[R, R, H, SEGS, 1, true]} />
        <meshPhysicalMaterial
          color="#c8f4ff"
          transparent
          opacity={0.09}
          roughness={0}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* top rim */}
      <mesh position={[0, H / 2, 0]}>
        <torusGeometry args={[R, 0.04, 6, SEGS]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* bottom rim */}
      <mesh position={[0, -H / 2, 0]}>
        <torusGeometry args={[R, 0.04, 6, SEGS]} />
        <meshStandardMaterial
          color="#8af4ff"
          transparent
          opacity={0.22}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>

      {/* water volume */}
      {fillLevel > 0.03 && (
        <mesh position={[0, wY, 0]}>
          <cylinderGeometry args={[R * 0.91, R * 0.91, wH, SEGS]} />
          <meshStandardMaterial
            color={glowColor}
            transparent
            opacity={0.82}
            emissive={glowColor}
            emissiveIntensity={0.42}
            roughness={0.06}
            metalness={0.08}
          />
        </mesh>
      )}

      {/* water surface cap */}
      {fillLevel > 0.03 && (
        <mesh ref={surfRef} position={[0, surfY, 0]}>
          <circleGeometry args={[R * 0.91, SEGS]} />
          <meshStandardMaterial
            color={glowColor}
            transparent
            opacity={0.98}
            emissive={glowColor}
            emissiveIntensity={0.95}
          />
        </mesh>
      )}
    </group>
  );
}

type Props = {
  fillLevel: number;
  color: string;
  status: 'optimal' | 'warning' | 'critical';
  className?: string;
  style?: React.CSSProperties;
};

export function TankMini3D({ fillLevel, color, status, className, style }: Props) {
  return (
    <Canvas
      className={className}
      style={{ background: 'transparent', display: 'block', ...style }}
      camera={{ position: [0, 0.35, 4.1], fov: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={0.22} color="#6af0ff" />
      <directionalLight position={[3, 5, 2]} intensity={0.65} />
      <TankScene fillLevel={fillLevel} color={color} status={status} />
    </Canvas>
  );
}
