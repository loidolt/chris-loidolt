import React from "react";
import Box from "@mui/material/Box";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense } from "react";

const Model = ({ file }) => {
    const gltf = useLoader(GLTFLoader, file);
    return (
        <>
            <primitive object={gltf.scene} scale={8} />
        </>
    );
};

export default function ModelViewer({ file }) {
    console.log(file)
    return (
        <Box sx={{ height: 600 }}>
            <Canvas>
                <Suspense fallback={null}>
                    <Model file={file} />
                    <OrbitControls />
                    <Environment preset="sunset" /* background */ />
                </Suspense>
            </Canvas>
        </Box >
    );
}