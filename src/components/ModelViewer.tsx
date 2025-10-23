import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

interface ModelViewerProps {
  modelPath: string;
  className?: string;
}

export function ModelViewer({ modelPath, className = "" }: ModelViewerProps) {
  return (
    <div className={`border ${className}`} style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
      {/* Terminal-style header */}
      <div className="border-b p-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--error-color)' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent-secondary)' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-primary)' }}>3D Model Viewer</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="aspect-square w-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            <Model modelPath={modelPath} />
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              enableZoom={true}
              enablePan={true}
            />
            <Environment preset="studio" />
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

function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);

  return <primitive object={scene} />;
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
