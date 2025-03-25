import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const videoPaths = [
  "/videos/clip 1.mp4",
  "/videos/clip 2.mp4",
  "/videos/clip 3.mp4",
  "/videos/clip 4.mp4",
  "/videos/clip 5.mp4",
  "/videos/clip 6.mp4",
];

export default function RotatingCube({ onFaceClick }) {
  const groupRef = useRef();
  const [textures, setTextures] = useState([]);

  useEffect(() => {
    const loadTextures = async () => {
      const loadedTextures = await Promise.all(
        videoPaths.map(
          (path) =>
            new Promise((resolve) => {
              const video = document.createElement("video");
              video.src = path;
              video.loop = true;
              video.muted = true;
              video.playsInline = true;
              video.preload = "auto";
              video.crossOrigin = "anonymous";

              video.onloadeddata = async () => {
                try {
                  await video.play();
                } catch (e) {
                  console.warn("Playback failed", e);
                }
                const texture = new THREE.VideoTexture(video);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBAFormat;
                texture.needsUpdate = true;
                resolve(texture);
              };

              video.load();
            })
        )
      );
      setTextures(loadedTextures);
    };
    loadTextures();
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x += 0.0015;
    }
  });

  const faces = [
    { pos: [0, 0, 0.5], rot: [0, 0, 0] },
    { pos: [0.5, 0, 0], rot: [0, Math.PI / 2, 0] },
    { pos: [0, 0, -0.5], rot: [0, Math.PI, 0] },
    { pos: [-0.5, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [0, 0.5, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [0, -0.5, 0], rot: [-Math.PI / 2, 0, 0] },
  ];

  return (
    <group ref={groupRef}>
      {faces.map((face, i) => (
        <mesh
          key={i}
          position={face.pos}
          rotation={face.rot}
          onClick={(e) => {
            e.stopPropagation();
            onFaceClick(i);
          }}
        >
          <planeGeometry args={[1, 1]} />
          {textures[i] ? (
            <meshBasicMaterial map={textures[i]} />
          ) : (
            <meshBasicMaterial color="hotpink" />
          )}
        </mesh>
      ))}
    </group>
  );
}
