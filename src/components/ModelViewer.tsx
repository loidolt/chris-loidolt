import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

interface ModelViewerProps {
  modelPath: string;
  className?: string;
  onError?: () => void;
}

export function ModelViewer({ modelPath, className = "", onError }: ModelViewerProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`border ${className}`} style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="aspect-square w-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl opacity-30" style={{ color: 'var(--text-muted)' }}>🔲</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>3D model not available</div>
          </div>
        </div>
      </div>
    );
  }

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
          onCreated={() => {
            // Check if model path exists
            fetch(modelPath, { method: 'HEAD' })
              .then(response => {
                if (!response.ok) {
                  setHasError(true);
                  onError?.();
                }
              })
              .catch(() => {
                setHasError(true);
                onError?.();
              });
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            <Model modelPath={modelPath} onError={() => {
              setHasError(true);
              onError?.();
            }} />
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

function Model({ modelPath, onError }: { modelPath: string; onError?: () => void }) {
  try {
    const { scene } = useGLTF(modelPath);
    return <primitive object={scene} />;
  } catch (error) {
    console.error('Error loading 3D model:', error);
    onError?.();
    return null;
  }
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
