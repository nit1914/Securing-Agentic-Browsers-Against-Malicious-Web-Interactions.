import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NetworkGrid({ threatCount }: { threatCount: number }) {
  const gridRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);

  const nodeCount = 40;
  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < nodeCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ]);
    }
    return positions;
  }, []);

  const linePositions = useMemo(() => {
    const lines: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = Math.sqrt(
          (nodePositions[i][0] - nodePositions[j][0]) ** 2 +
          (nodePositions[i][1] - nodePositions[j][1]) ** 2 +
          (nodePositions[i][2] - nodePositions[j][2]) ** 2
        );
        if (dist < 2.5) {
          lines.push(...nodePositions[i], ...nodePositions[j]);
        }
      }
    }
    return new Float32Array(lines);
  }, [nodePositions]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.rotation.y = t * 0.05;
    }
    if (nodesRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < nodeCount; i++) {
        const [x, y, z] = nodePositions[i];
        dummy.position.set(
          x + Math.sin(t + i) * 0.05,
          y + Math.cos(t + i * 0.7) * 0.05,
          z
        );
        dummy.scale.setScalar(i < threatCount ? 1.5 : 1);
        dummy.updateMatrix();
        nodesRef.current.setMatrixAt(i, dummy.matrix);
        
        const color = i < threatCount 
          ? new THREE.Color(0xef4444) 
          : new THREE.Color(0x22d3ee);
        nodesRef.current.setColorAt(i, color);
      }
      nodesRef.current.instanceMatrix.needsUpdate = true;
      if (nodesRef.current.instanceColor) nodesRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={gridRef}>
      {/* Network lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.1} />
      </lineSegments>

      {/* Nodes */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial emissive="#22d3ee" emissiveIntensity={2} />
      </instancedMesh>

      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#22d3ee" />
    </group>
  );
}

interface NetworkVisualization3DProps {
  threatCount?: number;
  className?: string;
}

export function NetworkVisualization3D({ threatCount = 0, className = "" }: NetworkVisualization3DProps) {
  return (
    <div className={className} style={{ background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <NetworkGrid threatCount={threatCount} />
      </Canvas>
    </div>
  );
}
