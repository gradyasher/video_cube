import React from "react";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { UnrealBloomPass } from "three-stdlib";

import VHSShaderMaterial from "../components/VHSShaderMaterial";
import VolumetricScattering from "../components/VolumetricScattering";
import BackgroundVideo from "../components/BackgroundVideo";
import VideoCube from "../components/VideoCube";
import { hostedVideoLinks } from "../constants/videoSources";
import MainScene from "../components/MainScene";
import VideoOverlay from "../components/VideoOverlay";
import SoundbathLogo from "../components/SoundbathLogo";
import MusicPlayer from "../components/MusicPlayer";
import LoadingScreen from "../components/LoadingScreen";
import HamburgerMenu from "../components/HamburgerMenu";
import HandClickHint from "../components/HandClickHint";
import TitleOverlay from "../components/TitleOverlay";
import useVideoManager from "../hooks/useVideoManager";
import useSceneState from "../hooks/useSceneState";
import Title from "../components/Title";

extend({ UnrealBloomPass });

export default function App() {
  const {
    activeVideoIndex,
    setActiveVideoIndex,
    iframeRef,
    initializeYouTubeAPI,
    handleOverlayClick,
  } = useVideoManager();

  const {
    fogColor,
    fogColorTarget,
    bgReady,
    cubeReady,
    showMain,
    hasClickedCube,
    setFogColor,
    setBgReady,
    setCubeReady,
    setHasClickedCube,
    setShowMain,
  } = useSceneState();

  const isLoading = !(bgReady && cubeReady);

  React.useEffect(() => {
    if (!isLoading) {
      const delay = setTimeout(() => setShowMain(true), 2000);
      return () => clearTimeout(delay);
    }
  }, [isLoading, setShowMain]);

  React.useEffect(() => {
    initializeYouTubeAPI();
  }, [initializeYouTubeAPI]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadingScreen isLoading={!showMain} />
      <HandClickHint show={showMain && !hasClickedCube} />
      {showMain && <HamburgerMenu />}
      <TitleOverlay text="Dgenr8."/>
      <MainScene
        onFaceClick={(index) => {
          setActiveVideoIndex(index);
          setHasClickedCube(true);
        }}
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
