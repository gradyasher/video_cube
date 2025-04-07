// src/components/ShopScene.jsx
import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useGLTF } from "@react-three/drei";
import BackgroundVideo from "./BackgroundVideo";
import VHSShaderMaterial from "./VHSShaderMaterial";

useGLTF.preload("/models/2troofz.glb");
useGLTF.preload("/models/allover1.glb");


const models = [
  "/models/2troofz.glb",
  "/models/allover1.glb"
];

function FloatingShirt({ modelPath }) {
  const glb = useGLTF(modelPath, true);
  const ref = useRef();
  console.log("Loaded model:", modelPath, glb);

  if (!glb?.scene) {
    console.warn("No scene in model:", modelPath);
    return null;
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.rotation.y = 0; // ✅ reset rotation on model switch
    }
  }, [modelPath]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
    }
  });

  return (
    <primitive
      ref={ref}
      object={glb.scene}
      position={[0, -2, 0]}
      scale={1.2}
    />

  );
}

export default function ShopScene() {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  const handleNext = () => {
    console.log("hit next");
    setCurrentModelIndex((prev) => (prev + 1) % models.length);
  };

  const handlePrev = () => {
    console.log("hit prev");
    setCurrentModelIndex((prev) => (prev - 1 + models.length) % models.length);
  };
  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 5], near: 0.1, far: 1000 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
        }}
      >

        {/* Key Light - strong and angled */}
        <ambientLight intensity={2} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2.2}
          color="#ffffff"
        />

        {/* Fill Light - softer and opposite the key */}
        <directionalLight
          position={[-5, 2, 5]}
          intensity={0.5}
          color="#ccccff"
        />

        {/* Rim Light - behind for glow outline */}
        <directionalLight
          position={[0, 3, -5]}
          intensity={0.8}
          color="#ffccdd"
        />

        <BackgroundVideo />
        <Suspense fallback={null}>
          {models.map((path, index) => (
            index === currentModelIndex && (
              <FloatingShirt key={path} modelPath={path} />
            )
          ))}
        </Suspense>
        <VHSShaderMaterial />
        <EffectComposer>
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
      </Canvas>
      {/* UI Arrows */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "2vw",
          transform: "translateY(-50%)",
          zIndex: 100,
          cursor: "pointer",
        }}
        onClick={handlePrev}
      >
        <img
          src="/assets/left_arrow.png"
          alt="Previous shirt"
          style={{ width: "40px", height: "40px" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "2vw",
          transform: "translateY(-50%)",
          zIndex: 100,
          cursor: "pointer",
        }}
        onClick={handleNext}
      >
        <img
          src="/assets/right_arrow.png"
          alt="Next shirt"
          style={{ width: "40px", height: "40px" }}
        />
      </div>
    </>
  );
}
