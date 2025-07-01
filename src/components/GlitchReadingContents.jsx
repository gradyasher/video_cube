import React, { useEffect, useRef, useState } from "react";
import { EffectComposer, Vignette, Bloom } from "@react-three/postprocessing";
import {
  RepeatWrapping,
  Vector3,
  BackSide,
} from "three";
import { useFrame, extend } from "@react-three/fiber";
import VibrantVideoMaterial from "../shaders/VibrantVideoMaterial";
import VolumetricScattering from "./VolumetricScattering";
import VHSShaderMaterial from "./VHSShaderMaterial";
import BackgroundVideo from "./BackgroundVideo";
import { useCustomVideoTexture } from "../hooks/useCustomVideoTexture"; // ← custom replacement

extend({ VibrantVideoMaterial });

export default function GlitchReadingContents({
  sphereVideoUrl,
  bgVideoUrl,
  onSphereReady,
  onBgReady,
  recording,
  showScene,
}) {
  const scale = recording ? 0.78 : 1;
  const meshRef = useRef();
  const [entered, setEntered] = useState(false);

  const texture = useCustomVideoTexture(sphereVideoUrl, {
    start: true,
    muted: true,
  });

  useEffect(() => {
    if (!texture) return;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(-1, 1);
    texture.offset.set(1, 0);
  }, [texture]);

  useEffect(() => {
    if (texture?.image?.videoWidth > 0) {
      onSphereReady?.();
    }
  }, [texture]);

  useEffect(() => {
    if (showScene && meshRef.current && texture?.image?.videoWidth > 0) {
      meshRef.current.position.set(0, -2, 5);
      setEntered(true);
    }
  }, [showScene]);

  useFrame((_, delta) => {
    if (entered && meshRef.current) {
      meshRef.current.position.lerp(new Vector3(0, 0, -0.5), 1 - Math.exp(-5 * delta));
    }
  });

  return (
    <>
      <fog attach="fog" args={["#000000", 2, 12]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 4, 4]} intensity={0.5} />
      <BackgroundVideo onReady={onBgReady} videoUrl={bgVideoUrl} />

      <mesh ref={meshRef} scale={[scale, scale, scale]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <vibrantVideoMaterial
          uTexture={texture}
          uSaturation={1.5}
          uBrightness={0.4}
          uOffsetX={0.25}
          side={BackSide}
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
