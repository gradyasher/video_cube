import React, { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";

import BackgroundVideo from "./BackgroundVideo";
import VideoCube from "./VideoCube";
const VHSShaderMaterial = lazy(() => import("./VHSShaderMaterial"));
const VolumetricScattering = lazy(() => import("./VolumetricScattering"));

export default function MainScene({ showScene, onFaceClick, onCubeReady, onBgReady }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} fog={{ color: '#000000', near: 2, far: 12 }}>
      <fog attach="fog" args={["#000000", 2, 12]} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[0, 0, 2]} intensity={1.2} color={"white"} />
      <BackgroundVideo onReady={onBgReady} />
      <Suspense fallback={null}>
        <VideoCube
          showScene={showScene}
          onCubeReady={onCubeReady}
          onFaceClick={onFaceClick}
        />
      </Suspense>
      <EffectComposer>
        <Vignette eskil={false} offset={0.3} darkness={1.4} />
      </EffectComposer>
      <Suspense>
        <VolumetricScattering />
        <VHSShaderMaterial />
      </Suspense>
    </Canvas>
  );
}
