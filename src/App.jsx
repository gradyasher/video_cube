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
// List of hosted YouTube links to show in modal on click
const hostedVideoLinks = [
  "https://www.youtube.com/watch?v=njJAC-EAQdk",
  "https://www.youtube.com/watch?v=ldn5A29IvNU",
  "https://www.youtube.com/watch?v=F-aOtychLss",
  "https://www.youtube.com/watch?v=aDz1Vf0Wd7w",
  "https://www.youtube.com/watch?v=Y0tjih9vlNY",
  "https://www.youtube.com/watch?v=dK1v9P3xVnM",
  "https://www.youtube.com/watch?v=-_0J4IbJqvk",
  "https://www.youtube.com/watch?v=GeSePALnQKQ",
];

// A single face of the cube with a looping video texture
const VideoFace = ({ url, rotation, position, faceIndex, onClick }) => {
  const [video] = useState(() => {
    const v = document.createElement("video");
    v.muted = true;
    v.crossOrigin = "Anonymous";
    v.loop = true;
    v.playsInline = true;
    v.src = url;
    return v;
  });

  const texture = useRef(new THREE.VideoTexture(video)).current;

  useEffect(() => {
    const handlePlay = () => {
      video.play().catch(err => {
        console.warn("Autoplay blocked:", err);
      });
    };
    video.addEventListener("loadedmetadata", handlePlay);
    return () => video.removeEventListener("loadedmetadata", handlePlay);
  }, [video]);

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

const RotatingCube = ({ onFaceClick }) => {
  const groupRef = useRef();
  const { camera } = useThree();
  const [faceIndexes, setFaceIndexes] = useState([0, 1, 2, 3, 4, 5]);
  const [nextIndex, setNextIndex] = useState(6);

  useFrame(() => {
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.001;
  });

  const facePositions = [
    [0, 0, 0.5],
    [0, 0, -0.5],
    [0.5, 0, 0],
    [-0.5, 0, 0],
    [0, 0.5, 0],
    [0, -0.5, 0],
  ];

  const faceRotations = [
    [0, 0, 0],
    [0, Math.PI, 0],
    [0, Math.PI / 2, 0],
    [0, -Math.PI / 2, 0],
    [-Math.PI / 2, 0, 0],
    [Math.PI / 2, 0, 0],
  ];

  const handleClick = (clickedFaceIndex) => {
    const facePosition = new THREE.Vector3(...facePositions[clickedFaceIndex]);
    const worldPosition = groupRef.current.localToWorld(facePosition.clone());
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const toFace = worldPosition.clone().sub(camera.position);
    const dot = toFace.normalize().dot(cameraDirection);

    if (dot > 0.5) {
      onFaceClick(clickedFaceIndex);
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

export default function App() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);

  const closeModal = () => setActiveVideoIndex(null);

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <RotatingCube onFaceClick={setActiveVideoIndex} />
        <OrbitControls enableZoom={false} />
      </Canvas>
      {activeVideoIndex !== null && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "80%",
              height: "80%",
              boxShadow: "0 0 40px rgba(255, 0, 255, 0.4)",
              borderRadius: "16px",
              overflow: "hidden",
              background: "black",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={hostedVideoLinks[activeVideoIndex % hostedVideoLinks.length].replace("watch?v=", "embed/") + "?autoplay=1&modestbranding=1&rel=0&showinfo=0"}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
      )}
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
