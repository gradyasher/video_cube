import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// List of all video sources to be used on the cube's faces
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


// A single face of the cube with a looping video texture
const VideoFace = ({ url, rotation, position, faceIndex, onClick }) => {
  // Create and configure a HTML5 video element
  const [video] = useState(() => {
    const v = document.createElement("video");
    v.muted = true;
    v.crossOrigin = "Anonymous";
    v.loop = true;
    v.playsInline = true;
    v.src = url;
    return v;
  });

  // Wrap the video in a Three.js VideoTexture
  const texture = useRef(new THREE.VideoTexture(video)).current;

  // Play video once it's loaded; catches autoplay block errors
  useEffect(() => {
    const handlePlay = () => {
      video.play().catch(err => {
        console.warn("Autoplay blocked:", err);
      });
    };
    video.addEventListener("loadedmetadata", handlePlay);
    return () => video.removeEventListener("loadedmetadata", handlePlay);
  }, [video]);

  // Force texture to update every frame to avoid frozen video
  useFrame(() => {
    texture.needsUpdate = true;
  });

  return (
    <mesh rotation={rotation} position={position} onClick={() => onClick(faceIndex)}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

// Builds and animates the rotating cube
const RotatingCube = () => {
  const groupRef = useRef();
  const { camera } = useThree();
  const [faceIndexes, setFaceIndexes] = useState([0, 1, 2, 3, 4, 5]); // which videos to use on the 6 faces
  const [nextIndex, setNextIndex] = useState(6); // index tracker for potential future updates

  // Rotate the cube slowly around Y and X axes
  useFrame(() => {
    groupRef.current.rotation.y += 0.0045;
    groupRef.current.rotation.x += 0.003;
  });

  // Positions for each face of the cube (relative to cube center)
  const facePositions = [
    [0, 0, 0.5],  // front
    [0, 0, -0.5], // back
    [0.5, 0, 0],  // right
    [-0.5, 0, 0], // left
    [0, 0.5, 0],  // top
    [0, -0.5, 0], // bottom
  ];

  // Rotations for each face so they face outward correctly
  const faceRotations = [
    [0, 0, 0],
    [0, Math.PI, 0],
    [0, Math.PI / 2, 0],
    [0, -Math.PI / 2, 0],
    [-Math.PI / 2, 0, 0],
    [Math.PI / 2, 0, 0],
  ];

  const handleClick = (clickedFaceIndex) => {
    // Convert face's world position to camera-facing direction
    const facePosition = new THREE.Vector3(...facePositions[clickedFaceIndex]);
    const worldPosition = groupRef.current.localToWorld(facePosition.clone());
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const toFace = worldPosition.clone().sub(camera.position);
    const dot = toFace.normalize().dot(cameraDirection);

    if (dot > 0.5) {
      alert(`clicked face ${clickedFaceIndex}`);
    }
  };

  return (
    <group ref={groupRef}>
      {faceIndexes.map((videoIndex, i) => (
        <VideoFace
          key={i}
          url={videoSources[videoIndex % videoSources.length]}
          position={facePositions[i]}
          rotation={faceRotations[i]}
          faceIndex={i}
          onClick={handleClick}
        />
      ))}
    </group>
  );
};

// The main React component that renders the scene
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
      {/* Set up Three.js canvas and camera */}
      <Canvas camera={{ position: [0, 0, 2], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <RotatingCube />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

// 📁 Folder structure you’ll need:
// - public/
//    - videos/
//       - video1.mp4, video2.mp4, ..., video9.mp4

// 🔧 To run this:
// 1. Create a new Vite or CRA React project
// 2. Install dependencies: three, @react-three/fiber, @react-three/drei
// 3. Replace App.jsx with this file
// 4. Add 6-9 short looping .mp4 files in public/videos
// 5. Run: npm run dev (for Vite) or npm start (for CRA)
