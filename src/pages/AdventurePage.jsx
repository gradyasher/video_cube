// src/pages/AdventurePage.jsx
import React, { useEffect, useRef, useState } from "react";
import CanvasOverlay from "../components/CanvasOverlay";
import ChoiceOverlay from "../components/ChoiceOverlay";
import VideoLayer from "../components/VideoLayer";

const initialVideos = [
  "/videos/adventure_vids/scene1.mp4",
  "/videos/adventure_vids/scene2.mp4",
  "/videos/adventure_vids/scene3.mp4",
  "/videos/adventure_vids/scene6.mp4",
];

export default function AdventurePage() {
  const [remainingVideos, setRemainingVideos] = useState(initialVideos.slice(2));
  const [videoCycle, setVideoCycle] = useState(0); // 🔑 force re-render
  const foregroundSrcRef = useRef(initialVideos[0]);
  const backgroundSrcRef = useRef(initialVideos[1]);
  const glitchActiveRef = useRef(false);
  const [showChoices, setShowChoices] = useState(false);
  const fgRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const onEnded = () => {
      setShowChoices(true);
    };

    fg.addEventListener("ended", onEnded);
    return () => fg.removeEventListener("ended", onEnded);
  }, [foregroundSrcRef.current]);

  const handleChoice = () => {
    const oldBg = bgRef.current;
    if (oldBg) {
      oldBg.pause();
      oldBg.currentTime = 0;
    }

    glitchActiveRef.current = true;
    setShowChoices(false);
  };

  const handleGlitchFinish = () => {
    // Step 1: Promote background to foreground
    foregroundSrcRef.current = backgroundSrcRef.current;

    // Step 2: Start new foreground
    requestAnimationFrame(() => {
      const newFg = fgRef.current;
      if (newFg) {
        newFg.currentTime = 0;
        newFg.play().catch(console.warn);
      }
    });

    // Step 3: Final transition check
    const nextPool = remainingVideos.filter(v => v !== backgroundSrcRef.current);
    if (nextPool.length === 0) {
      console.log("Adventure complete!");

      // Remove bg video to avoid stale DOM reuse
      const bg = bgRef.current;
      if (bg) {
        bg.pause();
        bg.removeAttribute("src");
        bg.load();
      }
      backgroundSrcRef.current = null;

      glitchActiveRef.current = false;
      setVideoCycle(c => c + 1); // 🔁 force full video DOM rerender
      return;
    }

    // Step 4: Preload next background
    const nextBg = nextPool[Math.floor(Math.random() * nextPool.length)];
    backgroundSrcRef.current = nextBg;
    setRemainingVideos(nextPool.filter(v => v !== nextBg));

    glitchActiveRef.current = false;
    setVideoCycle(c => c + 1); // 🔁 force re-render so keys change
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <VideoLayer
        key={`bg-${videoCycle}`}
        ref={bgRef}
        src={backgroundSrcRef.current}
        zIndex={0}
        muted
        loop
        id="bgVideo"
      />

      <VideoLayer
        key={`fg-${videoCycle}`}
        ref={fgRef}
        src={foregroundSrcRef.current}
        zIndex={1}
        muted
        id="fgVideo"
      />

      <CanvasOverlay
        triggerGlitch={glitchActiveRef.current}
        fgVideo={fgRef.current}
        bgVideo={bgRef.current}
        onGlitchComplete={handleGlitchFinish}
      />
      {showChoices && <ChoiceOverlay onChoice={handleChoice} />}
    </div>
  );
}
