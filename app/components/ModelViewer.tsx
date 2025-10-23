import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

interface ModelViewerProps {
  modelPath: string;
  className?: string;
}

export function ModelViewer({ modelPath, className = "" }: ModelViewerProps) {
  return (
    <div className={`border border-terminal-border bg-terminal-black ${className}`}>
      {/* Terminal-style header */}
      <div className="border-b border-terminal-border p-2 bg-terminal-dark">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-terminal-red"></div>
            <div className="w-3 h-3 rounded-full bg-terminal-amber"></div>
            <div className="w-3 h-3 rounded-full bg-terminal-green"></div>
          </div>
          <span className="text-terminal-text text-xs">3D Model Viewer</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="aspect-square w-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: "#0a0e14" }}
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
      <div className="border-t border-terminal-border p-3 bg-terminal-dark">
        <div className="text-xs text-terminal-text space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-terminal-amber">$</span>
            <span>Left click + drag to rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-terminal-amber">$</span>
            <span>Right click + drag to pan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-terminal-amber">$</span>
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
      <meshStandardMaterial color="#3fb950" wireframe />
    </mesh>
  );
}

// Preload models for better performance
export function preloadModel(modelPath: string) {
  useGLTF.preload(modelPath);
}
