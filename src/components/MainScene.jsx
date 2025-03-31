import React from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import BackgroundVideo from "./BackgroundVideo";
import VideoCube from "./VideoCube";
import VHSShaderMaterial from "./VHSShaderMaterial";
import VolumetricScattering from "./VolumetricScattering";

export default function MainScene({ onFaceClick, setFogColor, fogColor, fogColorTarget, onCubeReady, onBgReady }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} fog={{ color: '#000000', near: 2, far: 12 }}>
      <fog attach="fog" args={["#000000", 2, 12]} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <BackgroundVideo onReady={onBgReady} />
      <VideoCube
        onCubeReady={onCubeReady}
        onFaceClick={onFaceClick}
        setFogColor={setFogColor}
        fogColor={fogColor}
        fogColorTarget={fogColorTarget}
      />
      <EffectComposer>
        <Vignette eskil={false} offset={0.3} darkness={1.4} />
      </EffectComposer>
      <VolumetricScattering />
      <VHSShaderMaterial />
    </Canvas>
  );
}
