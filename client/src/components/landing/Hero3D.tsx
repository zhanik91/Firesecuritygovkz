import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, MeshDistortMaterial, Sphere, Box, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

function Emblem(props: any) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(t / 4) / 2;
      meshRef.current.rotation.z = Math.cos(t / 4) / 4;
    }
  });

  return (
    <group ref={meshRef} {...props}>
      {/* Central Shield-like shape composed of geometries */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>

        {/* Core Shield */}
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Outer Ring */}
        <Torus args={[2.2, 0.15, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#2563EB" emissive="#1E40AF" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
        </Torus>

        <Torus args={[2.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
        </Torus>

        {/* Orbiting Particles */}
        <Sphere args={[0.2, 16, 16]} position={[2, 1, 1]}>
             <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={2} />
        </Sphere>
        <Sphere args={[0.15, 16, 16]} position={[-2, -1, 1]}>
             <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={2} />
        </Sphere>
         <Sphere args={[0.1, 16, 16]} position={[0, 2, -1]}>
             <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={2} />
        </Sphere>

      </Float>
    </group>
  );
}

function Particles({ count = 50 }) {
  const points = useRef<THREE.Points>(null!);

  // Generate random positions
  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
        points.current.rotation.y += 0.001;
        points.current.rotation.x += 0.001;
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F59E0B" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2563EB" />

        <Emblem position={[0, 0, 0]} />
        <Particles />

        <ContactShadows resolution={1024} scale={10} blur={2.5} opacity={0.5} far={10} color="#000000" />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
