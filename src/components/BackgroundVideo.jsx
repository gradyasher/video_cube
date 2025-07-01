import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { VideoTexture, LinearFilter, RGBFormat } from "three";
import { backgroundShader } from "../shaders/backgroundShader";
import { bgVids } from "../constants/videoSources";

export default function BackgroundVideo({ onReady, videoUrl, scale = 1 }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const videoRef = useRef(null);
  const [videoTexture, setVideoTexture] = useState(null);

  const selectedSrc = useMemo(() => {
    if (videoUrl) return videoUrl;
    const randomIndex = Math.floor(Math.random() * bgVids.length);
    return bgVids[randomIndex];
  }, [videoUrl]);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = selectedSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");

    videoRef.current = video;

    video.addEventListener("canplay", () => {
      const tex = new VideoTexture(video);
      tex.minFilter = LinearFilter;
      tex.magFilter = LinearFilter;
      tex.format = RGBFormat;
      tex.needsUpdate = true;
      setVideoTexture(tex);
      onReady?.();
      video.play().catch((e) => console.warn("Autoplay failed", e));
    });

    video.load();
  }, [selectedSrc, onReady]);

  useFrame(() => {
    if (videoTexture && videoRef.current?.readyState >= 2) {
      videoTexture.needsUpdate = true;
    }
  });

  if (!videoTexture) return null;

  const width = 100 * scale;
  const height = 30 * scale;

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} renderOrder={-1}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={backgroundShader.vertexShader}
        fragmentShader={backgroundShader.fragmentShader}
        uniforms={{
          map: { value: videoTexture },
          warpAmount: { value: 1.5 },
        }}
        transparent={false}
      />
    </mesh>
  );
}
