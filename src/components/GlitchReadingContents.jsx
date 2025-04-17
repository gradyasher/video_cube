// components/GlitchReadingContents.jsx
import React, { Suspense, useMemo, useEffect } from "react";
import { EffectComposer, Vignette, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useVideoTexture } from "@react-three/drei";

import VolumetricScattering from "./VolumetricScattering";
import VHSShaderMaterial from "./VHSShaderMaterial";
import BackgroundVideo from "./BackgroundVideo";
import { hostedVideoLinks } from "../constants/videoSources";

export default function GlitchReadingContents({ onSphereReady, onBgReady }) {
  const videoURL = useMemo(() => {
    const index = Math.floor(Math.random() * hostedVideoLinks.length);
    return hostedVideoLinks[index];
  }, []);

  const texture = useVideoTexture(videoURL, { start: true, muted: true });
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.x = 1.25;

  useEffect(() => {
    if (texture?.image?.videoWidth > 0) {
      onSphereReady?.();
    }
  }, [texture, onSphereReady]);

  return (
    <>
      <fog attach="fog" args={["#000000", 2, 12]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 4, 4]} intensity={2} />
      <BackgroundVideo onReady={onBgReady} />

      <mesh position={[0, 0, 1]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial
          map={texture}
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
