// components/GlitchReadingContents.jsx
import React, { Suspense, useMemo, useEffect } from "react";
import { EffectComposer, Vignette, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useVideoTexture } from "@react-three/drei";
import VibrantVideoMaterial from "../shaders/VibrantVideoMaterial";
import VolumetricScattering from "./VolumetricScattering";
import VHSShaderMaterial from "./VHSShaderMaterial";
import BackgroundVideo from "./BackgroundVideo";

export default function GlitchReadingContents({ sphereVideoUrl, bgVideoUrl, onSphereReady, onBgReady, recording }) {
  const scale = recording ? 0.78 : 1;

  const texture = useVideoTexture(sphereVideoUrl, { start: true, muted: true });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(-1, 1);
  texture.offset.set(1, 0);

  useEffect(() => {
    if (texture?.image?.videoWidth > 0) {
      onSphereReady?.();
    }
  }, [texture, onSphereReady]);

  return (
    <>
      <fog attach="fog" args={["#000000", 2, 12]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 4, 4]} intensity={0.5} />
      <BackgroundVideo onReady={onBgReady} videoUrl={bgVideoUrl} />

      <mesh position={[0, 0, -0.5]} scale={[scale, scale, scale]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <vibrantVideoMaterial
          uTexture={texture}
          uSaturation={1.125}
          uBrightness={1.05}
          uOffsetX={.25}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>


      <EffectComposer>
        <Vignette eskil={false} offset={0.2} darkness={1.3} />
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          height={300}
          intensity={1.5}
        />
      </EffectComposer>

      <VolumetricScattering />
      <VHSShaderMaterial />
    </>
  );
}
