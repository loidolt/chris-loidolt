import React from "react";
import Box from "@mui/material/Box";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense } from "react";
import { Html, useProgress } from '@react-three/drei'

function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress} % loaded</Html>
}

const Model = ({ file }) => {
    const gltf = useLoader(GLTFLoader, file);
    return (
        <primitive object={gltf.scene} scale={8} />
    );
};

export default function ModelViewer({ file }) {
    console.log(file)
    return (
        <Box sx={{ height: 600 }}>
            <Canvas camera={{ position: [10, 10, 10] }}>
                <color attach="background" args={['#252530']} />
                <spotLight castShadow color="white" intensity={2} position={[-50, 50, 40]} angle={0.25} penumbra={1} shadow-mapSize={[128, 128]} shadow-bias={0.00005} />
                <spotLight castShadow color="white" intensity={.5} position={[50, -50, -40]} angle={0.25} penumbra={1} shadow-mapSize={[128, 128]} shadow-bias={0.00005} />
                <Suspense fallback={<Loader />}>
                    <ambientLight intensity={0.75} />
                    <Model file={file} />
                </Suspense>

                <OrbitControls />

                <gridHelper args={[1000, 200, '#151515', '#020202']} position={[0, -1, 0]} />
                <mesh scale={200} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                    <planeGeometry />
                    <shadowMaterial transparent opacity={0.3} />
                </mesh>
            </Canvas>
        </Box >
    );
}