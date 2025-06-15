// src/pages/AdventurePage.jsx
import React, { useEffect, useRef, useState } from "react";
import CanvasOverlay from "../components/CanvasOverlay";
import ChoiceOverlay from "../components/ChoiceOverlay";
import VideoLayer from "../components/VideoLayer";

const initialVideos = [
  "/videos/adventure_vids/scene1.mp4",
  "/videos/adventure_vids/scene2.mp4",
  "/videos/adventure_vids/scene3.mp4",
];

export default function AdventurePage() {
  const [remainingVideos, setRemainingVideos] = useState(initialVideos.slice(2));
  const [videoCycle, setVideoCycle] = useState(0);
  const foregroundSrcRef = useRef(initialVideos[0]);
  const backgroundSrcRef = useRef(initialVideos[1]);
  const glitchActiveRef = useRef(false);
  const [showChoices, setShowChoices] = useState(false);
  const fgRef = useRef(null);
  const bgRef = useRef(null);
  const isFinalTransition = useRef(false); // 🧠

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

    if (isFinalTransition.current) {
      // ✅ Final transition: skip glitch, fade out directly
      setShowChoices(false);

      const fg = fgRef.current;
      if (fg) {
        fg.style.transition = "opacity 1s ease";
        fg.style.opacity = "0";
      }

      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.style.transition = "opacity 1s ease";
        canvas.style.opacity = "0";
      }

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        opacity: 0;
        transition: opacity 1s ease;
        z-index: 999;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = 1;
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } else {
      // ✅ Normal case: trigger glitch
      glitchActiveRef.current = true;
      setShowChoices(false);
    }
  };

  const handleGlitchFinish = () => {
    foregroundSrcRef.current = backgroundSrcRef.current;

    requestAnimationFrame(() => {
      const newFg = fgRef.current;
      if (newFg) {
        newFg.currentTime = 0;
        newFg.play().catch(console.warn);
      }
    });

    const nextPool = remainingVideos.filter(v => v !== backgroundSrcRef.current);
    if (nextPool.length === 0) {
      console.log("Final video playing — no more background.");

      backgroundSrcRef.current = null;
      isFinalTransition.current = true; // 🧠 key flag
      glitchActiveRef.current = false;
      setVideoCycle(c => c + 1);
      return;
    }

    const nextBg = nextPool[Math.floor(Math.random() * nextPool.length)];
    backgroundSrcRef.current = nextBg;
    setRemainingVideos(nextPool.filter(v => v !== nextBg));
    glitchActiveRef.current = false;
    setVideoCycle(c => c + 1);
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
      {showChoices && <ChoiceOverlay key={videoCycle} onChoice={handleChoice} />}
    </div>
  );
}
