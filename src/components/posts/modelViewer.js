/* eslint-disable react/no-unknown-property */
import { Box, CircularProgress } from '@mui/material';
import { Environment, Html, OrbitControls, Stage, useProgress } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import PropTypes from 'prop-types';
import React, { Suspense, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <CircularProgress variant="determinate" value={progress} />
    </Html>
  );
}

export function Model({ file }, props) {
  const group = useRef();
  const gltf = useLoader(GLTFLoader, file);
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh receiveShadow castShadow>
        <primitive object={gltf.scene} scale={8} />
        <meshStandardMaterial envMapIntensity={0.25} />
      </mesh>
    </group>
  );
}

Model.propTypes = {
  file: PropTypes.any
};

export default function ModelViewer({ file }) {
  return (
    <Box sx={{ height: 600 }}>
      <Canvas shadows camera={{ position: [-15, 10, 15], fov: 35, zoom: 0.8, near: 1, far: 1000 }}>
        <Suspense fallback={<Loader />}>
          <Stage intensity={1}>
            <color attach="background" args={['#252530']} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <OrbitControls />

            <Model file={file} />
            <Environment preset="sunset" />
          </Stage>
        </Suspense>
      </Canvas>
    </Box>
  );
}

ModelViewer.propTypes = {
  file: PropTypes.any
};
