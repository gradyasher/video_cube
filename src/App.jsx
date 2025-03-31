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
import MainScene from "./components/MainScene";
import VideoOverlay from "./components/VideoOverlay";
import Dgenr8Title from "./components/Dgenr8Title";
import SoundbathLogo from "./components/SoundbathLogo";
import MusicPlayer from "./components/MusicPlayer";
import LoadingScreen from "./components/LoadingScreen";
import HamburgerMenu from "./components/HamburgerMenu";



extend({ UnrealBloomPass });

export default function App() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [fogColor, setFogColor] = useState(new THREE.Color(0x88ccff));
  const fogColorTarget = useRef(fogColor.clone());
  const iframeRef = useRef(null);

  const [bgReady, setBgReady] = useState(false);
  const [cubeReady, setCubeReady] = useState(false);
  const [showMain, setShowMain] = useState(false);

  const isLoading = !(bgReady && cubeReady);


  useEffect(() => {
    if (!isLoading) {
      const delay = setTimeout(() => setShowMain(true), 2000); // 2 second delay for animation
      return () => clearTimeout(delay);
    }
  }, [isLoading]);


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
      <LoadingScreen isLoading={!showMain} />
      <HamburgerMenu />
      <div
        className="title-wrapper"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "20vh", // gives it room to center
          display: "flex",
          justifyContent: "center", // horizontal center
          alignItems: "center",     // vertical center
          zIndex: 10,
          pointerEvents: "none",    // optional: make it non-blocking for clicks
        }}
      >
        <Dgenr8Title />
      </div>
      <MainScene
        onFaceClick={(index) => setActiveVideoIndex(index)}
        setFogColor={setFogColor}
        fogColor={fogColor}
        fogColorTarget={fogColorTarget}
        onCubeReady={() => setCubeReady(true)}
        onBgReady={() => setBgReady(true)}
      />
      <SoundbathLogo />
      <MusicPlayer />
      <VideoOverlay
        activeVideoIndex={activeVideoIndex}
        setActiveVideoIndex={setActiveVideoIndex}
      />
    </div>
  );
}
