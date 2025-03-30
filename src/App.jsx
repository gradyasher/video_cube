import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { UnrealBloomPass } from "three-stdlib";
import { Plane, useFBO } from "@react-three/drei";
import { shaderMaterial } from "@react-three/drei";
import VHSShaderMaterial from "./components/VHSShaderMaterial";
import VolumetricScattering from "./components/VolumetricScattering";
import BackgroundVideo from "./components/BackgroundVideo";
import VideoCube from "./components/VideoCube";
import { hostedVideoLinks } from "./constants/videoSources";

extend({ UnrealBloomPass });


export default function App() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [fogColor, setFogColor] = useState(new THREE.Color(0x88ccff));
  const fogColorTarget = useRef(fogColor.clone());
  const iframeRef = useRef(null);


  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (activeVideoIndex !== null && iframeRef.current) {
      const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&enablejsapi=1`;
    }
  }, [activeVideoIndex]);

  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
  };


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5] }} fog={{ color: '#000000', near: 2, far: 12 }}>
        <fog attach="fog" args={["#000000", 2, 12]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <BackgroundVideo />
        <VideoCube
          onFaceClick={(index) => setActiveVideoIndex(index)}
          setFogColor={setFogColor}
          fogColor={fogColor}
          fogColorTarget={fogColorTarget}
        />
        <EffectComposer>
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
        <VolumetricScattering />
        <VHSShaderMaterial />
      </Canvas>

      <iframe
        id="youtube-player"
        ref={iframeRef}
        width="80%"
        height="80%"
        style={{
          display: activeVideoIndex !== null ? "block" : "none",
          position: "absolute",
          top: "10%",
          left: "10%",
          borderRadius: "12px",
          boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
          zIndex: 1000,
        }}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube video player"
      ></iframe>

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
            zIndex: 999,
            backgroundImage: "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
          }}
          onClick={handleOverlayClick}
        ></div>
      )}

    </div>
  );
}
