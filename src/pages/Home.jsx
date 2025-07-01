import React, { useEffect, lazy, Suspense, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import TitleOverlay from "../components/TitleOverlay";
import useVideoManager from "../hooks/useVideoManager";
import useSceneState from "../hooks/useSceneState";

// Lazy-load all non-essential components
const MainScene = lazy(() => import("../components/MainScene"));
const HandClickHint = lazy(() => import("../components/HandClickHint"));
const SoundbathLogo = lazy(() => import("../components/SoundbathLogo"));
const MusicPlayer = lazy(() => import("../components/MusicPlayer"));
const VideoOverlay = lazy(() => import("../components/VideoOverlay"));

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
    setBgReady,
    cubeReady,
    setCubeReady,
    hasClickedCube,
    setHasClickedCube,
    showHint,
    setShowHint
  } = useSceneState();

  const isLoading = !(bgReady && cubeReady);

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
      <LoadingScreen isLoading={isLoading} />
      <TitleOverlay text="Dgenr8." />

      <Suspense fallback={null}>
        <MainScene
          showScene={!isLoading}
          onFaceClick={(index) => {
            setActiveVideoIndex(index);
            setHasClickedCube(true);
          }}
          onCubeReady={() => setCubeReady(true)}
          onBgReady={() => setBgReady(true)}
        />
      </Suspense>

      <Suspense fallback={null}>
        {!isLoading && !hasClickedCube && showHint && <HandClickHint show />}
      </Suspense>

      <Suspense fallback={null}>
        {!isLoading && <SoundbathLogo />}
      </Suspense>

      <Suspense fallback={null}>
        {!isLoading && <MusicPlayer />}
      </Suspense>

      <Suspense fallback={null}>
        {!isLoading && (
          <VideoOverlay
            activeVideoIndex={activeVideoIndex}
            setActiveVideoIndex={setActiveVideoIndex}
          />
        )}
      </Suspense>
    </div>
  );
}
