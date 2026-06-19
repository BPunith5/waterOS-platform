import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

const H = 3.2;
const R = 0.88;
const SEGS = 40;

export interface Tank3DProps {
  position: [number, number, number];
  fillLevel: number;
  color: string;
  name: string;
  status: 'optimal' | 'warning' | 'critical';
  isSelected: boolean;
  onClick: () => void;
  showLabel?: boolean;
  animated?: boolean;
}

export function Tank3D({
  position,
  fillLevel,
  color,
  name,
  status,
  isSelected,
  onClick,
  showLabel = true,
  animated = false,
}: Tank3DProps) {
  const surfaceRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.PointLight>(null!);
  const [hovered, setHovered] = useState(false);
  const internalLevel = useRef(fillLevel);

  useCursor(hovered);

  const glowColor =
    status === 'critical' ? '#FB7185' : status === 'warning' ? '#FBBF24' : color;

  useFrame((state, delta) => {
    if (animated) {
      internalLevel.current = fillLevel + Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    } else {
      internalLevel.current = fillLevel;
    }

    const wH = Math.max(0.05, internalLevel.current * H);
    const surfY = -H / 2 + wH;

    if (surfaceRef.current) {
      surfaceRef.current.position.y = surfY + Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
      surfaceRef.current.rotation.y += delta * 0.35;
    }
    if (glowRef.current) {
      glowRef.current.intensity =
        (isSelected ? 1.6 : 0.7) + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  const wH = Math.max(0.05, fillLevel * H);
  const wY = -H / 2 + wH / 2;
  const surfY = -H / 2 + wH;

  return (
    <group position={position}>
      <pointLight ref={glowRef} color={glowColor} intensity={isSelected ? 1.6 : 0.7} distance={5.5} decay={2} />

      {/* glass shell */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[R, R, H, SEGS, 1, true]} />
        <meshPhysicalMaterial
          color="#b8eeff"
          transparent
          opacity={hovered || isSelected ? 0.22 : 0.11}
          roughness={0}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* top ring */}
      <mesh position={[0, H / 2, 0]}>
        <torusGeometry args={[R, 0.048, 8, SEGS]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.35}
          metalness={0.5}
          roughness={0.15}
        />
      </mesh>

      {/* bottom ring */}
      <mesh position={[0, -H / 2, 0]}>
        <torusGeometry args={[R, 0.048, 8, SEGS]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.25} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* water body */}
      <mesh position={[0, wY, 0]}>
        <cylinderGeometry args={[R * 0.91, R * 0.91, wH, SEGS]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.72}
          emissive={glowColor}
          emissiveIntensity={isSelected ? 0.5 : 0.22}
          roughness={0.08}
          metalness={0.12}
        />
      </mesh>

      {/* water surface */}
      <mesh ref={surfaceRef} position={[0, surfY, 0]}>
        <circleGeometry args={[R * 0.91, SEGS]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.92}
          emissive={glowColor}
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* selection halo on ground */}
      {isSelected && (
        <mesh position={[0, -H / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R + 0.18, R + 0.52, SEGS]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.55} />
        </mesh>
      )}

      {showLabel && (
        <Html center position={[0, H / 2 + 0.7, 0]} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(1,4,15,0.88)',
            border: `1px solid ${color}50`,
            borderRadius: 10,
            padding: '4px 12px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            boxShadow: `0 4px 20px ${color}25`,
            transform: 'translateX(-50%)',
          }}>
            <p style={{ color: '#F4FBFF', fontSize: 11, fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
              {name}
            </p>
            <p style={{ color: glowColor, fontSize: 10, margin: 0, fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>
              {Math.round(fillLevel * 100)}%
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
