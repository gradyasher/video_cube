import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const videoSources = [
  "/videos/clip 1.mp4",
  "/videos/clip 2.mp4",
  "/videos/clip 3.mp4",
  "/videos/clip 4.mp4",
  "/videos/clip 5.mp4",
  "/videos/clip 6.mp4",
  "/videos/clip 7.mp4",
  "/videos/clip 8.mp4",
];

function VideoCube() {
  const cubeRef = useRef();

  const videoElements = useMemo(() => {
    return videoSources.slice(0, 6).map((src) => {
      const video = document.createElement("video");
      video.src = src;
      video.crossOrigin = "Anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("preload", "auto");
      video.play().catch(() => {});
      return video;
    });
  }, []);

  const videoTextures = useMemo(() => {
    return videoElements.map((video) => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      return texture;
    });
  }, [videoElements]);

  useEffect(() => {
    videoElements.forEach((video) => {
      video.play().catch(() => {});
    });
  }, [videoElements]);

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += 0.01;
      cubeRef.current.rotation.x += 0.005;
    }

    videoTextures.forEach((texture) => {
      texture.needsUpdate = true;
    });
  });

  return (
    <mesh ref={cubeRef} position={[0, 0, 0]}>
      <boxGeometry args={[4, 4, 4]} />
      {videoTextures.map((texture, i) => (
        <meshStandardMaterial attach={`material-${i}`} map={texture} key={i} />
      ))}
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <VideoCube />
      </Canvas>
    </div>
  );
}
