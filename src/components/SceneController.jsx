import React, { useEffect, useState, lazy, Suspense } from "react";

// Lazy-load heavy components
const MainScene = lazy(() => import("./MainScene"));
const SoundbathLogo = lazy(() => import("./SoundbathLogo"));
const MusicPlayer = lazy(() => import("./MusicPlayer"));
const VideoOverlay = lazy(() => import("./VideoOverlay"));

// Lazy-load hooks that internally import three.js or YouTube
import useSceneState from "../hooks/useSceneState";
import useVideoManager from "../hooks/useVideoManager";

export default function SceneController() {
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

  const [hintReady, setHintReady] = useState(false);

  const isLoading = !(bgReady && cubeReady);

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
      setHintReady(true);
      localStorage.setItem("hasVisitedHome", "true");
    }
  }, []);

  return (
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
      <SoundbathLogo />
      <MusicPlayer />
      <VideoOverlay
        activeVideoIndex={activeVideoIndex}
        setActiveVideoIndex={setActiveVideoIndex}
        iframeRef={iframeRef}
        onOverlayClick={handleOverlayClick}
      />
    </Suspense>
  );
}
