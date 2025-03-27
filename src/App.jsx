import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { UnrealBloomPass } from "three-stdlib";
import { KernelSize } from "postprocessing";

extend({ UnrealBloomPass });

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

function VideoCube({ onFaceClick, setFogColor, fogColor, fogColorTarget }) {
  const cubeRef = useRef();
  const { camera } = useThree();

  const videoElements = useMemo(() => {
    return videoSources.slice(0, 6).map((src) => {
      const video = document.createElement("video");
      video.src = src;
      video.crossOrigin = "Anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("preload", "auto");
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
    // smooth transition of fogColor toward target
    if (fogColor && fogColorTarget.current) {
      fogColor.lerp(fogColorTarget.current, 0.05);
    }
    if (cubeRef.current) {
      cubeRef.current.rotation.y += 0.01;
      cubeRef.current.rotation.x += 0.005;

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const normalVectors = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1),
      ];

      const matrix = new THREE.Matrix4();
      matrix.extractRotation(cubeRef.current.matrixWorld);

      normalVectors.forEach((normal, i) => {
        const worldNormal = normal.clone().applyMatrix4(matrix);
        const dot = worldNormal.dot(cameraDirection);

        if (dot < -0.5) {
          if (videoElements[i].paused) videoElements[i].play().catch(() => {});
        } else {
          if (!videoElements[i].paused) videoElements[i].pause();
        }

        if (dot > 0.9 && setFogColor) {
          const r = Math.random() * 0.5 + 0.5;
          const g = Math.random() * 0.5 + 0.5;
          const b = Math.random() * 0.5 + 0.5;
          const target = new THREE.Color(r, g, b);
          fogColorTarget.current.copy(target);
        }
      });
    }

    videoTextures.forEach((texture) => {
      texture.needsUpdate = true;
    });
  });

  useEffect(() => {
    const handleClick = (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cubeRef.current, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const faceIndex = Math.floor(intersection.faceIndex / 2);
        onFaceClick(faceIndex);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [camera, onFaceClick]);

  return (
    <mesh ref={cubeRef} position={[0, 0, 0]}>
      <boxGeometry args={[4, 4, 4]} />
      {videoTextures.map((texture, i) => (
        <meshStandardMaterial
          attach={`material-${i}`}
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={2.5}
          key={i}
        />
      ))}
    </mesh>
  );
}

function FogPlanes({ color = new THREE.Color(0xffffff) }) {
  const groupRef = useRef();
  const fogCount = 3;
  const noise = useLoader(THREE.TextureLoader, "/textures/smoke.png");
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((plane, i) => {
        // plane.position.z += 0.002;
        // if (plane.position.z > 5) plane.position.z = -5 + i * 1.5;
        plane.material.color = color;
        plane.material.opacity = 0.2;
      });
    }
  });

  const fogPlanes = useMemo(() => {
    const planes = [];
    for (let i = 0; i < fogCount; i++) {
      planes.push(
        <mesh key={i} position={[0, 0, i ]} rotation={[0, 0, 0]}>
          <planeGeometry args={[30, 40]} />
          <meshBasicMaterial
            map={noise}
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            color={color}
          />
        </mesh>
      );
    }
    return planes;
  }, [noise, color]);

  return <group ref={groupRef}>{fogPlanes}</group>;
}

export default function App() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [fogColor, setFogColor] = useState(new THREE.Color(0x88ccff));
  const fogColorTarget = useRef(fogColor.clone());

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 10] }} fog={{ color: '#000000', near: 2, far: 12 }}>
        <fog attach="fog" args={["#000000", 2, 12]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <FogPlanes color={fogColor} />
        <VideoCube onFaceClick={(index) => setActiveVideoIndex(index)} setFogColor={setFogColor} fogColor={fogColor} fogColorTarget={fogColorTarget} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={1.5} intensity={10.0} />
          <Noise opacity={0.15} />
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
      </Canvas>
      {activeVideoIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backgroundImage: "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
          }}
          onClick={() => setActiveVideoIndex(null)}
        >
          <iframe
            width="80%"
            height="80%"
            src={hostedVideoLinks[activeVideoIndex].replace("watch?v=", "embed/") + "?autoplay=1&rel=0&modestbranding=1&controls=0"}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ borderRadius: "12px", boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)" }}
          ></iframe>
        </div>
      )}
    </div>
  );
}
