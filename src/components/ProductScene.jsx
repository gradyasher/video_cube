// src/components/ShopScene.jsx
import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useGLTF } from "@react-three/drei";
import BackgroundVideo from "./BackgroundVideo";
import VHSShaderMaterial from "./VHSShaderMaterial";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

useGLTF.preload("/models/2troofz.glb");
useGLTF.preload("/models/allover2.glb");
useGLTF.preload("/models/hoodie1.glb");


const models = [
  "/models/2troofz.glb",
  "/models/allover2.glb",
  "/models/hoodie1.glb"
];

function FloatingShirt({ modelPath }) {
  const glb = useGLTF(modelPath);
  const ref = useRef();

  const targetPos = useRef(new THREE.Vector3(0, -1.2, 0));

  useEffect(() => {
    if (ref.current) {
      ref.current.rotation.y = 0;
      ref.current.position.set(-5, -2.2, -2);
      targetPos.current.set(0, -2.2, -2);
    }
  }, [modelPath]);

  useFrame(() => {
    if (ref.current) {
      // distance from center determines spin speed
      const distance = Math.abs(ref.current.position.x);
      const spinSpeed = THREE.MathUtils.lerp(0.03, 0.01, 1 - (Math.min(distance / 5, 1)*15));

      ref.current.rotation.y += spinSpeed;
      // smooth slide-in
      ref.current.position.lerp(targetPos.current, 0.1);
    }
  });

  return (
    <primitive
      ref={ref}
      object={glb.scene}
      scale={1.25}
    />
  );
}

function ProductScene({ initialModel }) {
  const initialIndex = models.findIndex((m) => m === initialModel);
  const [currentModelIndex, setCurrentModelIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const navigate = useNavigate();

  const handleNext = () => {
    const nextIndex = (currentModelIndex + 1) % models.length;
    const nextModel = models[nextIndex];
    navigate(`/shop/view?model=${encodeURIComponent(nextModel)}`); // 👈 URL-driven
  };

  const handlePrev = () => {
    const prevIndex = (currentModelIndex - 1 + models.length) % models.length;
    const prevModel = models[prevIndex];
    navigate(`/shop/view?model=${encodeURIComponent(prevModel)}`);
  };

  return (
    <div id="canvas-container">
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
    </div>
  );
}


const MemoizedProductScene = React.memo(ProductScene);
export default MemoizedProductScene;
