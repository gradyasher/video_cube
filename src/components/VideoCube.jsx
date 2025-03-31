import React, { useRef, useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { videoSources } from "../constants/videoSources";


export default function VideoCube({ onFaceClick, setFogColor, fogColor, fogColorTarget }) {
  const mesh = useRef();
  const { gl, camera, size } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const isMobile = size.width < 768;

  const videoTextures = useMemo(() => {
    return videoSources.map((src, i) => {
      const video = document.createElement("video");
      video.src = src;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("playsinline", "true");
      video.load();
      video.addEventListener("canplay", () => {
        video.play().catch((e) => console.warn("Autoplay failed", e));
      });
      return new THREE.VideoTexture(video);
    });
  }, []);

  const materials = useMemo(() =>
    videoTextures.map(
      (texture) =>
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    ), [videoTextures]);

  useEffect(() => {
    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh.current, true);
      if (intersects.length > 0) {
        const faceIndex = intersects[0].face.materialIndex;
        onFaceClick(faceIndex);
      }
    };
    window.addEventListener("pointerdown", handleClick);
    return () => window.removeEventListener("pointerdown", handleClick);
  }, [gl, camera, raycaster, mouse, onFaceClick]);

  useFrame(() => {
    mesh.current.rotation.y += 0.002;
    mesh.current.rotation.x += 0.001;
  });

  return (
    <mesh ref={mesh} scale={isMobile ? [1.8, 1.8, 1.8] : [2.5, 2.5, 2.5]}>
      <boxGeometry args={[1, 1, 1]} />
      {materials.map((material, index) => (
        <primitive
          key={index}
          attach={`material-${index}`}
          object={material}
        />
      ))}
    </mesh>
  );
}
