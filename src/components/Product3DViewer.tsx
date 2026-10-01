import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Product } from '../types';
import { Rotate3d, ZoomIn, ZoomOut, Maximize2, Layers, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Product3DViewerProps {
  product: Product;
  className?: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ product, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { playClickSound } = useStore();

  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [materialMode, setMaterialMode] = useState<'basalt' | 'chrome' | 'orange'>('basalt');
  const [cameraAngle, setCameraAngle] = useState({ pitch: 0, yaw: 0, zoom: 100 });
  const [isLoading, setIsLoading] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Apply material finishes
  const updateMaterials = useCallback((mode: 'basalt' | 'chrome' | 'orange', wireframeState: boolean) => {
    materialsRef.current.forEach(mat => {
      mat.wireframe = wireframeState;
      if (mode === 'basalt') {
        mat.color.setHex(0x1a1a1a);
        mat.metalness = 0.35;
        mat.roughness = 0.65;
        mat.emissive.setHex(0x000000);
      } else if (mode === 'chrome') {
        mat.color.setHex(0xd8d8d8);
        mat.metalness = 0.95;
        mat.roughness = 0.1;
        mat.emissive.setHex(0x111111);
      } else if (mode === 'orange') {
        mat.color.setHex(0xfd8a46);
        mat.metalness = 0.5;
        mat.roughness = 0.4;
        mat.emissive.setHex(0x3a1905);
      }
      mat.needsUpdate = true;
    });
  }, []);

  useEffect(() => {
    updateMaterials(materialMode, isWireframe);
  }, [materialMode, isWireframe, updateMaterials]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    materialsRef.current = [];

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070707, 0.04);
    sceneRef.current = scene;

    // Camera
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Three-point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xf3edd8, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfd8a46, 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Create 3D Model based on product category/ID
    const group = new THREE.Group();
    modelGroupRef.current = group;

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      metalness: 0.4,
      roughness: 0.6,
      wireframe: false
    });
    materialsRef.current.push(baseMaterial);

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xfd8a46,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x441b00
    });
    materialsRef.current.push(accentMaterial);

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.95,
      roughness: 0.1
    });
    materialsRef.current.push(chromeMaterial);

    // Model Construction by Product
    if (product.id === 'prod-01') {
      // QUANTUM JACKET - Sculptural Outerwear Geometry
      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.75, 0.85, 1.6, 24);
      const torso = new THREE.Mesh(torsoGeo, baseMaterial);
      group.add(torso);

      // Collar
      const collarGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.45, 24, 1, true);
      const collar = new THREE.Mesh(collarGeo, accentMaterial);
      collar.position.y = 0.95;
      group.add(collar);

      // Articulated Sleeves
      const sleeveLeftGeo = new THREE.CylinderGeometry(0.24, 0.2, 1.4, 16);
      sleeveLeftGeo.rotateZ(Math.PI / 6);
      const sleeveLeft = new THREE.Mesh(sleeveLeftGeo, baseMaterial);
      sleeveLeft.position.set(-0.9, 0.1, 0);
      group.add(sleeveLeft);

      const sleeveRightGeo = new THREE.CylinderGeometry(0.24, 0.2, 1.4, 16);
      sleeveRightGeo.rotateZ(-Math.PI / 6);
      const sleeveRight = new THREE.Mesh(sleeveRightGeo, baseMaterial);
      sleeveRight.position.set(0.9, 0.1, 0);
      group.add(sleeveRight);

      // Magnetic Buckles & Zipper seam
      const zipperGeo = new THREE.BoxGeometry(0.04, 1.5, 0.08);
      const zipper = new THREE.Mesh(zipperGeo, chromeMaterial);
      zipper.position.set(0, 0, 0.82);
      group.add(zipper);

      // Utility pocket boxes
      const pocketGeo = new THREE.BoxGeometry(0.35, 0.35, 0.1);
      const pocketLeft = new THREE.Mesh(pocketGeo, baseMaterial);
      pocketLeft.position.set(-0.4, -0.3, 0.78);
      group.add(pocketLeft);

      const pocketRight = new THREE.Mesh(pocketGeo, baseMaterial);
      pocketRight.position.set(0.4, -0.3, 0.78);
      group.add(pocketRight);
    } else if (product.id === 'prod-02') {
      // CHROME RUNNER - Sculptural Footwear Geometry
      // Sole
      const soleGeo = new THREE.BoxGeometry(0.9, 0.24, 2.2);
      const sole = new THREE.Mesh(soleGeo, accentMaterial);
      sole.position.y = -0.4;
      group.add(sole);

      // Upper
      const upperGeo = new THREE.ConeGeometry(0.58, 1.5, 20);
      upperGeo.rotateX(Math.PI / 4);
      const upper = new THREE.Mesh(upperGeo, baseMaterial);
      upper.position.set(0, 0.1, -0.2);
      group.add(upper);

      // Chrome Heel Counter
      const heelGeo = new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI);
      const heel = new THREE.Mesh(heelGeo, chromeMaterial);
      heel.position.set(0, -0.1, -0.7);
      group.add(heel);

      // Speed lace rings
      for (let i = 0; i < 4; i++) {
        const ringGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
        const ring = new THREE.Mesh(ringGeo, chromeMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.1 + i * 0.12, 0.2 - i * 0.15);
        group.add(ring);
      }
    } else if (product.id === 'prod-06') {
      // VECTOR WATCH - Titanium Timepiece
      // Case
      const caseGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.25, 32);
      const watchCase = new THREE.Mesh(caseGeo, chromeMaterial);
      watchCase.rotation.x = Math.PI / 2;
      group.add(watchCase);

      // Dial face
      const dialGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.05, 32);
      const dial = new THREE.Mesh(dialGeo, baseMaterial);
      dial.rotation.x = Math.PI / 2;
      dial.position.z = 0.11;
      group.add(dial);

      // Glowing LED ring
      const ledGeo = new THREE.TorusGeometry(0.68, 0.03, 16, 32);
      const ledRing = new THREE.Mesh(ledGeo, accentMaterial);
      ledRing.position.z = 0.14;
      group.add(ledRing);

      // Strap
      const strapGeo = new THREE.BoxGeometry(0.65, 2.4, 0.12);
      const strap = new THREE.Mesh(strapGeo, baseMaterial);
      group.add(strap);

      // Titanium Bezel Markers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const markerGeo = new THREE.BoxGeometry(0.04, 0.12, 0.02);
        const marker = new THREE.Mesh(markerGeo, accentMaterial);
        marker.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0.14);
        marker.rotation.z = angle;
        group.add(marker);
      }
    } else {
      // Default: SIGNAL HOODIE / BAG / TEE - Geometric Tech Silhouette
      const mainGeo = new THREE.DodecahedronGeometry(1.1, 1);
      const mainMesh = new THREE.Mesh(mainGeo, baseMaterial);
      group.add(mainMesh);

      const cageGeo = new THREE.IcosahedronGeometry(1.4, 1);
      const cageMat = new THREE.MeshStandardMaterial({
        color: 0xfd8a46,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      materialsRef.current.push(cageMat);
      const cage = new THREE.Mesh(cageGeo, cageMat);
      group.add(cage);

      const coreGeo = new THREE.SphereGeometry(0.4, 20, 20);
      const core = new THREE.Mesh(coreGeo, chromeMaterial);
      group.add(core);
    }

    scene.add(group);

    // Ground retro wireframe radar grid
    const grid = new THREE.GridHelper(8, 20, 0xfd8a46, 0x202221);
    grid.position.y = -1.2;
    scene.add(grid);

    setIsLoading(false);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (autoRotate && group && !isDraggingRef.current) {
        group.rotation.y += delta * 0.45;
      }

      if (group) {
        setCameraAngle({
          pitch: Math.round(group.rotation.x * (180 / Math.PI)),
          yaw: Math.round((group.rotation.y % (Math.PI * 2)) * (180 / Math.PI)),
          zoom: Math.round((4.5 / camera.position.z) * 100)
        });
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      materialsRef.current.forEach(m => m.dispose());
    };
  }, [product.id, autoRotate]);

  // Mouse & Touch Orbit Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !modelGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    modelGroupRef.current.rotation.y += deltaX * 0.008;
    modelGroupRef.current.rotation.x += deltaY * 0.008;

    // Clamp vertical pitch
    modelGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, modelGroupRef.current.rotation.x));

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleZoom = (direction: 'in' | 'out') => {
    playClickSound(900);
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? 0.8 : 1.25;
    const newZ = cameraRef.current.position.z * factor;
    if (newZ >= 2.0 && newZ <= 8.0) {
      cameraRef.current.position.z = newZ;
    }
  };

  const resetCamera = () => {
    playClickSound(750);
    if (cameraRef.current && modelGroupRef.current) {
      cameraRef.current.position.set(0, 0.5, 4.5);
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className={`relative border border-[#202221] bg-[#070707] overflow-hidden select-none ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full min-h-[360px] md:min-h-[460px] cursor-grab active:cursor-grabbing"
      />

      {/* CRT Scanline Overlay inside viewport */}
      <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />

      {/* Retro-Futuristic HUD Top Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#F3EDD8]/70 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#070707]/80 backdrop-blur-xs px-2.5 py-1 border border-[#202221]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FD8A46] animate-pulse" />
          <span>3D CHASSIS ENGINE // {product.sku}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-[#070707]/80 backdrop-blur-xs px-2.5 py-1 border border-[#202221]">
          <span>PITCH: {cameraAngle.pitch}°</span>
          <span>YAW: {cameraAngle.yaw}°</span>
          <span className="text-[#FD8A46]">ZOOM: {cameraAngle.zoom}%</span>
        </div>
      </div>

      {/* HUD Bottom Left: Material Switcher */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
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
            setMaterialMode('orange');
          }}
          className={`px-2.5 py-1 text-[10px] font-mono tracking-wider transition-colors cursor-pointer border ${
            materialMode === 'orange'
              ? 'bg-[#FD8A46] text-[#070707] border-[#FD8A46] font-bold'
              : 'bg-[#121313]/90 text-[#F3EDD8]/70 border-[#202221] hover:text-[#F3EDD8]'
          }`}
        >
          CYBER ORANGE
        </button>
      </div>

      {/* HUD Bottom Right: Interactive Controls (Rotate, Wireframe, Zoom, Reset) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={() => {
            playClickSound(820);
            setIsWireframe(!isWireframe);
          }}
          title={isWireframe ? 'Shaded mode' : 'Wireframe hologram mode'}
          className={`p-2 border transition-colors cursor-pointer text-xs ${
            isWireframe
              ? 'bg-[#FD8A46] text-[#070707] border-[#FD8A46]'
              : 'bg-[#121313]/90 text-[#F3EDD8]/80 border-[#202221] hover:border-[#FD8A46]'
          }`}
        >
          <Layers size={14} />
        </button>

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
          <Rotate3d size={14} />
        </button>

        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-2 bg-[#121313]/90 hover:bg-[#202221] text-[#F3EDD8]/80 border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors"
        >
          <ZoomIn size={14} />
        </button>

        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-2 bg-[#121313]/90 hover:bg-[#202221] text-[#F3EDD8]/80 border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors"
        >
          <ZoomOut size={14} />
        </button>

        <button
          onClick={resetCamera}
          title="Reset Camera Orientation"
          className="p-2 bg-[#121313]/90 hover:bg-[#202221] text-[#F3EDD8]/80 border border-[#202221] hover:border-[#FD8A46] cursor-pointer transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Floating Center Helper Prompt */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-center font-mono text-xs text-[#F3EDD8] tracking-widest uppercase">
        <div>[DRAG TO ROTATE 360°]</div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#070707] flex items-center justify-center font-mono text-xs text-[#FD8A46] tracking-widest">
          INITIALIZING 3D ENGINE...
        </div>
      )}
    </div>
  );
};
