import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface ShieldMeshProps {
  riskLevel: number; // 0-100
  scanning: boolean;
}

function ShieldCore({ riskLevel, scanning }: ShieldMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const color = useMemo(() => {
    if (riskLevel <= 20) return new THREE.Color(0x2dd4a8);
    if (riskLevel <= 50) return new THREE.Color(0xf59e0b);
    return new THREE.Color(0xef4444);
  }, [riskLevel]);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(300);
    for (let i = 0; i < 300; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1.8 + Math.random() * 0.5;
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.rotation.x = Math.cos(t * 0.3) * 0.2;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.1;
      particlesRef.current.rotation.x = Math.sin(t * 0.15) * 0.05;
    }
  });

  return (
    <group>
      {/* Main shield sphere */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.2, scanning ? 3 : 2]} />
          <MeshDistortMaterial
            color={color}
            transparent
            opacity={0.3}
            wireframe
            distort={scanning ? 0.4 : 0.15}
            speed={scanning ? 5 : 2}
          />
        </mesh>
      </Float>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={scanning ? 1.5 : 0.5}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Orbiting ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.6, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Second ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.8, 0.015, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.03}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>

      {/* Ambient + directional lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color={color} />
      <pointLight position={[-3, -3, -3]} intensity={0.4} color="#4488ff" />
    </group>
  );
}

interface SecurityShield3DProps {
  riskLevel: number;
  scanning?: boolean;
  className?: string;
}

export function SecurityShield3D({ riskLevel, scanning = false, className = "" }: SecurityShield3DProps) {
  return (
    <div className={`${className}`} style={{ background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ShieldCore riskLevel={riskLevel} scanning={scanning} />
      </Canvas>
    </div>
  );
}
