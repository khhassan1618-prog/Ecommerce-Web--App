import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Center, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../types';
import { Rotate3d, Layers, RefreshCw, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ProductViewer3DProps {
  product: Product;
  className?: string;
}

// Internal 3D Model Placeholder built with Three.js primitives inside React Three Fiber
const ModelPlaceholderMesh: React.FC<{
  product: Product;
  wireframe: boolean;
  materialMode: 'basalt' | 'chrome' | 'rust';
  autoRotate: boolean;
  rotationSpeed: number;
  onRotationUpdate: (rot: { x: number; y: number }) => void;
}> = ({ product, wireframe, materialMode, autoRotate, rotationSpeed, onRotationUpdate }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  // Material configuration based on selected mode
  const { primaryColor, secondaryColor, metalness, roughness, emissive } = useMemo(() => {
    switch (materialMode) {
      case 'chrome':
        return {
          primaryColor: '#e0e0e0',
          secondaryColor: '#ffffff',
          metalness: 0.95,
          roughness: 0.1,
          emissive: '#111111'
        };
      case 'rust':
        return {
          primaryColor: '#FD8A46',
          secondaryColor: '#ffaa66',
          metalness: 0.5,
          roughness: 0.35,
          emissive: '#451700'
        };
      case 'basalt':
      default:
        return {
          primaryColor: '#1c1c1c',
          secondaryColor: '#FD8A46',
          metalness: 0.4,
          roughness: 0.6,
          emissive: '#000000'
        };
    }
  }, [materialMode]);

  // Frame animation loop
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.6 * rotationSpeed;
      onRotationUpdate({
        x: Math.round((groupRef.current.rotation.x * (180 / Math.PI)) % 360),
        y: Math.round((groupRef.current.rotation.y * (180 / Math.PI)) % 360)
      });
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.x += delta * 0.4;
      ringRef1.current.rotation.y += delta * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.35;
      ringRef2.current.rotation.x -= delta * 0.25;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.5;
    }
  });

  // Dynamic geometry based on product category
  const renderProductGeometry = () => {
    if (product.category === 'Outerwear' || product.id === 'prod-01') {
      // Quantum Jacket: Modular sculptural tech silhouette
      return (
        <group>
          {/* Main Core Torso */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.7, 0.85, 1.6, 24]} />
            <meshStandardMaterial
              color={primaryColor}
              wireframe={wireframe}
              metalness={metalness}
              roughness={roughness}
              emissive={emissive}
            />
          </mesh>
          {/* High Collar */}
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.48, 0.58, 0.4, 24, 1, true]} />
            <meshStandardMaterial
              color={secondaryColor}
              wireframe={wireframe}
              metalness={0.8}
              roughness={0.2}
              emissive="#331400"
            />
          </mesh>
          {/* Left Sleeve */}
          <mesh position={[-0.9, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.22, 0.18, 1.4, 16]} />
            <meshStandardMaterial
              color={primaryColor}
              wireframe={wireframe}
              metalness={metalness}
              roughness={roughness}
            />
          </mesh>
          {/* Right Sleeve */}
          <mesh position={[0.9, 0.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.22, 0.18, 1.4, 16]} />
            <meshStandardMaterial
              color={primaryColor}
              wireframe={wireframe}
              metalness={metalness}
              roughness={roughness}
            />
          </mesh>
          {/* Magnetic Center Seam */}
          <mesh position={[0, 0, 0.8]}>
            <boxGeometry args={[0.04, 1.5, 0.08]} />
            <meshStandardMaterial color="#FD8A46" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    } else if (product.category === 'Footwear' || product.id === 'prod-02') {
      // Chrome Runner: Kinetic sole and aerodynamic chassis
      return (
        <group rotation={[0.2, 0, 0]}>
          {/* Rebound Outsole */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.85, 0.26, 2.2]} />
            <meshStandardMaterial
              color={secondaryColor}
              wireframe={wireframe}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Upper Aero Cone */}
          <mesh position={[0, 0.1, -0.2]} rotation={[Math.PI / 4, 0, 0]}>
            <coneGeometry args={[0.58, 1.5, 20]} />
            <meshStandardMaterial
              color={primaryColor}
              wireframe={wireframe}
              metalness={metalness}
              roughness={roughness}
            />
          </mesh>
          {/* Chrome Heel Counter */}
          <mesh position={[0, -0.1, -0.7]}>
            <sphereGeometry args={[0.52, 24, 16, 0, Math.PI]} />
            <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.08} />
          </mesh>
        </group>
      );
    } else if (product.category === 'Accessories' || product.id === 'prod-06') {
      // Vector Watch: Titanium case with glowing LED ring
      return (
        <group rotation={[Math.PI / 2, 0, 0]}>
          {/* Titanium Bezel */}
          <mesh>
            <cylinderGeometry args={[0.95, 0.95, 0.25, 32]} />
            <meshStandardMaterial
              color={primaryColor}
              wireframe={wireframe}
              metalness={metalness}
              roughness={roughness}
            />
          </mesh>
          {/* Dial Face */}
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.04, 32]} />
            <meshStandardMaterial color="#070707" roughness={0.8} />
          </mesh>
          {/* Luminescent Orange LED Ring */}
          <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.68, 0.03, 16, 32]} />
            <meshStandardMaterial color="#FD8A46" emissive="#FD8A46" emissiveIntensity={1.2} />
          </mesh>
          {/* Integrated Lug Straps */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.65, 0.14, 2.4]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </mesh>
        </group>
      );
    } else {
      // Default / Knitwear / Tops / Bags: Futuristic speculative geometry
      return (
        <group>
          {/* Outer faceted dodecahedron */}
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[1.05, 1]} />
            <meshStandardMaterial
              color={primaryColor}
              wireframe={wireframe}
              metalness={metalness}
              roughness={roughness}
              emissive={emissive}
            />
          </mesh>
          {/* Floating inner cyber core */}
          <mesh ref={innerRef}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial
              color="#FD8A46"
              emissive="#FD8A46"
              emissiveIntensity={0.8}
              wireframe={wireframe}
            />
          </mesh>
        </group>
      );
    }
  };

  return (
    <group ref={groupRef}>
      {/* Central Product Shape */}
      {renderProductGeometry()}

      {/* Retro Floating Telemetry Rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.65, 0.015, 16, 64]} />
        <meshStandardMaterial
          color="#FD8A46"
          transparent
          opacity={0.65}
          wireframe={wireframe}
        />
      </mesh>

      <mesh ref={ringRef2}>
        <torusGeometry args={[1.85, 0.012, 16, 64]} />
        <meshStandardMaterial
          color="#F3EDD8"
          transparent
          opacity={0.35}
          wireframe={wireframe}
        />
      </mesh>

      {/* Orbiting Vertex Points */}
      {[-1.4, 1.4].map((x, i) => (
        <mesh key={i} position={[x, Math.sin(i) * 0.8, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshBasicMaterial color="#FD8A46" />
        </mesh>
      ))}
    </group>
  );
};

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({ product, className = '' }) => {
  const { playClickSound } = useStore();
  const controlsRef = useRef<any>(null);

  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [materialMode, setMaterialMode] = useState<'basalt' | 'chrome' | 'rust'>('basalt');
  const [telemetry, setTelemetry] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoom = (direction: 'in' | 'out') => {
    playClickSound(900);
    if (!controlsRef.current) return;
    const factor = direction === 'in' ? 0.8 : 1.25;
    const cam = controlsRef.current.object;
    if (cam) {
      cam.position.multiplyScalar(factor);
      cam.position.clampLength(2.2, 8.5);
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    playClickSound(750);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative border border-[#202221] bg-[#070707] overflow-hidden select-none ${className}`}>
      {/* 3D Canvas Mount Point using React Three Fiber */}
      <div className="w-full h-full min-h-[380px] md:min-h-[480px]">
        <Canvas
          camera={{ position: [0, 0.4, 4.2], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          {/* Subtle Ambient & Retro Studio Lights */}
          <ambientLight intensity={0.55} color="#F3EDD8" />
          <directionalLight position={[4, 5, 3]} intensity={1.8} color="#ffffff" />
          <directionalLight position={[-3, -2, 2]} intensity={1.2} color="#FD8A46" />
          <directionalLight position={[0, 4, -4]} intensity={2.0} color="#ffffff" />

          {/* Zero-G Floating Effect for the Model */}
          <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.35}
            floatingRange={[-0.08, 0.08]}
          >
            <Center>
              <ModelPlaceholderMesh
                product={product}
                wireframe={wireframe}
                materialMode={materialMode}
                autoRotate={autoRotate}
                rotationSpeed={rotationSpeed}
                onRotationUpdate={setTelemetry}
              />
            </Center>
          </Float>

          {/* Retro Hologram Radar Ground Grid */}
          <Grid
            position={[0, -1.3, 0]}
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.8}
            cellColor="#202221"
            sectionSize={2}
            sectionThickness={1.2}
            sectionColor="#FD8A46"
            fadeDistance={8}
            fadeStrength={1.5}
          />

          {/* Orbit Controls from @react-three/drei */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={2.2}
            maxDistance={8.5}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 4}
            dampingFactor={0.06}
          />
        </Canvas>
      </div>

      {/* CRT Scanlines & Screen Texture Overlay */}
      <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />

      {/* Retro Optical Corner Crosshairs */}
      <div className="absolute top-2 left-2 text-[#FD8A46]/70 font-mono text-[10px] pointer-events-none">
        ┌─ [SYS_3D]
      </div>
      <div className="absolute top-2 right-2 text-[#FD8A46]/70 font-mono text-[10px] pointer-events-none text-right">
        [R3F_DREI] ─┐
      </div>
      <div className="absolute bottom-2 left-2 text-[#FD8A46]/70 font-mono text-[10px] pointer-events-none">
        └─ [PBR_MESH]
      </div>
      <div className="absolute bottom-2 right-2 text-[#FD8A46]/70 font-mono text-[10px] pointer-events-none text-right">
        [ISLAMABAD_NODE] ─┘
      </div>

      {/* Top Retro HUD Overlay: Model ID, Coordinates & Telemetry */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#F3EDD8]/75 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#070707]/85 backdrop-blur-xs px-3 py-1.5 border border-[#202221]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FD8A46] animate-pulse" />
          <span className="text-[#FD8A46] font-bold">MDL-ID:</span>
          <span>{product.sku}</span>
          <span className="text-[#F3EDD8]/40">·</span>
          <span>ERA {product.era}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 bg-[#070707]/85 backdrop-blur-xs px-3 py-1.5 border border-[#202221]">
          <div className="flex items-center gap-1.5">
            <Compass size={11} className="text-[#FD8A46]" />
            <span>LAT 33.6844° N // LON 73.0479° E</span>
          </div>
          <span className="text-[#F3EDD8]/40">·</span>
          <span>PITCH: {telemetry.x}°</span>
          <span className="text-[#FD8A46]">YAW: {telemetry.y}°</span>
        </div>
      </div>

      {/* Floating Center Subtle Interaction Guide */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-center font-mono text-[11px] text-[#F3EDD8] tracking-[0.25em] uppercase">
        <div>[DRAG TO ROTATE 360° · SCROLL TO ZOOM]</div>
      </div>

      {/* Bottom Left: Material Finish Mode Selectors */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5 z-10">
        <div className="text-[10px] font-mono text-[#F3EDD8]/50 hidden sm:block mr-1">
          FINISH:
        </div>
        <button
          onClick={() => {
            playClickSound(800);
            setMaterialMode('basalt');
          }}
          className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors cursor-pointer border ${
            materialMode === 'basalt'
              ? 'bg-[#F3EDD8] text-[#070707] border-[#F3EDD8] font-bold'
              : 'bg-[#121313]/90 text-[#F3EDD8]/70 border-[#202221] hover:text-[#F3EDD8]'
          }`}
        >
          BASALT MATTE
        </button>
        <button
          onClick={() => {
            playClickSound(800);
            setMaterialMode('chrome');
          }}
          className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors cursor-pointer border ${
            materialMode === 'chrome'
              ? 'bg-[#F3EDD8] text-[#070707] border-[#F3EDD8] font-bold'
              : 'bg-[#121313]/90 text-[#F3EDD8]/70 border-[#202221] hover:text-[#F3EDD8]'
          }`}
        >
          ELECTRO CHROME
        </button>
        <button
          onClick={() => {
            playClickSound(800);
            setMaterialMode('rust');
          }}
          className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors cursor-pointer border ${
            materialMode === 'rust'
              ? 'bg-[#FD8A46] text-[#070707] border-[#FD8A46] font-bold'
              : 'bg-[#121313]/90 text-[#F3EDD8]/70 border-[#202221] hover:text-[#F3EDD8]'
          }`}
        >
          CYBER RUST
        </button>
      </div>

      {/* Bottom Right: Interactive Controls (Wireframe, Spin, Zoom, Reset) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10">
        {/* Wireframe toggle */}
        <button
          onClick={() => {
            playClickSound(820);
            setWireframe(!wireframe);
          }}
          title={wireframe ? 'Shaded mode' : 'Wireframe hologram mode'}
          className={`p-2 border transition-colors cursor-pointer text-xs ${
            wireframe
              ? 'bg-[#FD8A46] text-[#070707] border-[#FD8A46]'
              : 'bg-[#121313]/90 text-[#F3EDD8]/80 border-[#202221] hover:border-[#FD8A46]'
          }`}
        >
          <Layers size={13} />
        </button>

        {/* Auto-rotate toggle */}
        <button
          onClick={() => {
            playClickSound(820);
            setAutoRotate(!autoRotate);
          }}
          title={autoRotate ? 'Pause 360° spin' : 'Resume 360° spin'}
          className={`p-2 border transition-colors cursor-pointer text-xs ${
            autoRotate
              ? 'bg-[#202221] text-[#FD8A46] border-[#FD8A46]'
              : 'bg-[#121313]/90 text-[#F3EDD8]/80 border-[#202221] hover:border-[#FD8A46]'
          }`}
        >
          <Rotate3d size={13} />
        </button>

        {/* Spin velocity speed */}
        <button
          onClick={() => {
            playClickSound(840);
            setRotationSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1));
          }}
          title="Change spin velocity"
          className="px-2 py-1.5 bg-[#121313]/90 text-[#F3EDD8]/80 hover:text-[#FD8A46] border border-[#202221] hover:border-[#FD8A46] text-[10px] font-mono cursor-pointer transition-colors"
        >
          {rotationSpeed}X
        </button>

        {/* Zoom In */}
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-2 bg-[#121313]/90 hover:bg-[#202221] text-[#F3EDD8]/80 border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors"
        >
          <ZoomIn size={13} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-2 bg-[#121313]/90 hover:bg-[#202221] text-[#F3EDD8]/80 border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors"
        >
          <ZoomOut size={13} />
        </button>

        {/* Reset Camera */}
        <button
          onClick={handleReset}
          title="Reset Camera Orientation"
          className="p-2 bg-[#121313]/90 hover:bg-[#202221] text-[#F3EDD8]/80 border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
};
