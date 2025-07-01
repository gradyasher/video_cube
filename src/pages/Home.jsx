import React, { useEffect, lazy, Suspense, useState } from "react";
import BackgroundVideo from "../components/BackgroundVideo";
import SoundbathLogo from "../components/SoundbathLogo";
import MusicPlayer from "../components/MusicPlayer";
import VideoOverlay from "../components/VideoOverlay";
import LoadingScreen from "../components/LoadingScreen";
import HandClickHint from "../components/HandClickHint";
import TitleOverlay from "../components/TitleOverlay";

import { hostedVideoLinks } from "../constants/videoSources";
import useVideoManager from "../hooks/useVideoManager";
import useSceneState from "../hooks/useSceneState";

// Only lazy-load the heaviest component
const MainScene = lazy(() => import("../components/MainScene"));

export default function Home() {
  const {
    activeVideoIndex,
    setActiveVideoIndex,
    iframeRef,
    initializeYouTubeAPI,
    handleOverlayClick,
  } = useVideoManager();

  const {
    bgReady,
    cubeReady,
    showMain,
    hasClickedCube,
    setBgReady,
    setCubeReady,
    setHasClickedCube,
    setShowMain,
  } = useSceneState();

  const isLoading = !(bgReady && cubeReady);
  const [showHint, setShowHint] = useState(false); // was missing in original

  useEffect(() => {
    if (!isLoading) {
      const delay = setTimeout(() => setShowMain(true), 2000);
      return () => clearTimeout(delay);
    }
  }, [isLoading, setShowMain]);

  useEffect(() => {
    initializeYouTubeAPI();
  }, [initializeYouTubeAPI]);

  useEffect(() => {
    const alreadyVisited = localStorage.getItem("hasVisitedHome");
    if (!alreadyVisited) {
      setShowHint(true);
      localStorage.setItem("hasVisitedHome", "true");
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadingScreen isLoading={!showMain} />
      <HandClickHint show={showMain && !hasClickedCube && showHint} />
      <TitleOverlay text="Dgenr8." />
      <Suspense fallback={null}>
        <MainScene
          showScene={showMain}
          onFaceClick={(index) => {
            setActiveVideoIndex(index);
            setHasClickedCube(true);
          }}
          onCubeReady={() => setCubeReady(true)}
          onBgReady={() => setBgReady(true)}
        />
      </Suspense>
      <SoundbathLogo />
      <MusicPlayer />
      <VideoOverlay
        activeVideoIndex={activeVideoIndex}
        setActiveVideoIndex={setActiveVideoIndex}
      />
    </div>
  );
}
