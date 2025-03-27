import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { UnrealBloomPass } from "three-stdlib";
import { Plane, useFBO } from "@react-three/drei";
import { shaderMaterial } from "@react-three/drei";

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

const VolumetricMaterial = shaderMaterial(
  { tDiffuse: null, lightPosition: new THREE.Vector2(0.5, 0.5) },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D tDiffuse;
    uniform vec2 lightPosition;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - lightPosition;
      vec4 color = vec4(0.0);
      float decay = .7;    // faster fade
      float weight = 0.5;    // less dense
      float exposure = .5; // lower brightness
      vec2 delta = dir * 1.0 / 60.0;

      for(int i = 0; i < 60; i++) {
        vec2 coord = vUv - delta * float(i);
        color += texture2D(tDiffuse, coord) * weight;
        weight *= decay;
      }
      color *= exposure;
      gl_FragColor = color;
    }
  `
);

extend({ VolumetricMaterial });

function VolumetricScattering() {
  const material = useRef();
  const fbo = useFBO();
  const screen = useRef();
  const { gl, scene, camera } = useThree();
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, []);

  useFrame(() => {
    if (!initialized.current || !ready) {
      initialized.current = true;
      return;
    }

    if (screen.current) screen.current.visible = false;

    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (screen.current) screen.current.visible = true;
    if (material.current) material.current.tDiffuse = fbo.texture;
  }, 1);

  if (!ready) return null;

  return (
    <Plane args={[2, 2]} position={[0, 0, 0]} renderOrder={999} ref={screen}>
      <volumetricMaterial ref={material} lightPosition={new THREE.Vector2(0.5, 0.5)} />
    </Plane>
  );
}

function VideoCube({ onFaceClick, setFogColor, fogColor, fogColorTarget }) {
  const mesh = useRef();
  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);

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
    <mesh ref={mesh} scale={[2.5, 2.5, 2.5]}>
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

export default function App() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [fogColor, setFogColor] = useState(new THREE.Color(0x88ccff));
  const fogColorTarget = useRef(fogColor.clone());

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5] }} fog={{ color: '#000000', near: 2, far: 12 }}>
        <fog attach="fog" args={["#000000", 2, 12]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <VideoCube
          onFaceClick={(index) => setActiveVideoIndex(index)}
          setFogColor={setFogColor}
          fogColor={fogColor}
          fogColorTarget={fogColorTarget}
        />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={1.5} intensity={5.0} />
          <Noise opacity={0.15} />
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
        <VolumetricScattering />
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
