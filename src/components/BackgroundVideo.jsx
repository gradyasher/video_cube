import React, { useEffect, useMemo, useState } from "react";
import { Plane } from "@react-three/drei";
import * as THREE from "three";
import { backgroundShader } from "../shaders/backgroundShader";
import { bgVids } from "../constants/videoSources";



export default function BackgroundVideo({ onReady, scale = 1 }) {
  const selectedSrc = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * bgVids.length);
    return bgVids[randomIndex];
  }, []);

  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = selectedSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");

    video.addEventListener("canplay", () => {
      video.play().catch((e) => console.warn("Autoplay failed", e));
      const tex = new THREE.VideoTexture(video);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBFormat;
      tex.needsUpdate = true;
      setTexture(tex);

      if (onReady) onReady();
    });

    video.load();
  }, [selectedSrc]);

  if (!texture) return null;

  const width = 100 * scale;
  const height = 30 * scale;

  return (
    <Plane args={[width, height]} position={[0, 0, -5]} renderOrder={-1}>
      <shaderMaterial
        vertexShader={backgroundShader.vertexShader}
        fragmentShader={backgroundShader.fragmentShader}
        uniforms={{
          map: { value: texture },
          warpAmount: { value: 1.5 },
        }}
        transparent={false}
      />
    </Plane>
  );
}
