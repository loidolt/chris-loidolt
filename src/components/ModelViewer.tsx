'use client';

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

interface ModelViewerProps {
  modelPath: string;
  className?: string;
  onError?: () => void;
}

export function ModelViewer({ modelPath, className = "" }: ModelViewerProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ModelViewer] Loading model from:', modelPath);
    }
  }, [modelPath]);

  return (
    <div className={`border ${className}`} style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
      {/* Terminal-style header */}
      <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--link-color)' }}>$ 3d-model-viewer</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="aspect-square w-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent' }}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Soft ambient fill light */}
            <ambientLight intensity={0.8} />

            {/* Softer directional lights from multiple angles */}
            <directionalLight position={[5, 5, 5]} intensity={0.4} />
            <directionalLight position={[-5, 3, -5]} intensity={0.3} />
            <directionalLight position={[0, -5, 0]} intensity={0.2} />

            {/* Subtle hemisphere light for natural feel */}
            <hemisphereLight
              args={['#ffffff', '#444444', 0.4]}
              position={[0, 1, 0]}
            />

            <Model modelPath={modelPath} />
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              enableZoom={true}
              enablePan={true}
            />
            <Environment preset="apartment" />
          </Suspense>
        </Canvas>
      </div>

      {/* Terminal-style footer with controls */}
      <div className="border-t p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="text-xs space-y-1" style={{ color: 'var(--text-primary)' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--accent-secondary)' }}>$</span>
            <span>Left click + drag to rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--accent-secondary)' }}>$</span>
            <span>Right click + drag to pan</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--accent-secondary)' }}>$</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Model({ modelPath }: { modelPath: string; onError?: () => void }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Model] Attempting to load:', modelPath);
  }

  const gltf = useGLTF(modelPath);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Model] Successfully loaded model');
  }

  // Center and scale the model
  if (gltf.scene) {
    gltf.scene.position.set(0, 0, 0);
  }

  return <primitive object={gltf.scene} />;
}

function LoadingSpinner() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b9b7f" wireframe />
    </mesh>
  );
}

// Preload models for better performance
export function preloadModel(modelPath: string) {
  useGLTF.preload(modelPath);
}
