// src/pages/AdventurePage.jsx
import React, { useEffect, useRef, useState } from "react";
import CanvasOverlay from "../components/CanvasOverlay";
import ChoiceOverlay from "../components/ChoiceOverlay";
import VideoLayer from "../components/VideoLayer";
import { bgVids, adventureVids } from "../constants/videoSources";

export default function AdventurePage() {
  const [remainingVideos, setRemainingVideos] = useState(adventureVids.slice(2));
  const [videoCycle, setVideoCycle] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null);
  const foregroundSrcRef = useRef(adventureVids[0]);
  const backgroundSrcRef = useRef(adventureVids[1]);
  const glitchActiveRef = useRef(false);
  const [showChoices, setShowChoices] = useState(false);
  const fgRef = useRef(null);
  const bgRef = useRef(null);
  const isFinalTransition = useRef(false); // 🧠

  useEffect(() => {
    // delay until after first mount to ensure video DOM readiness
    const randomIndex = Math.floor(Math.random() * bgVids.length);
    setBackgroundVideoUrl(bgVids[randomIndex]);
  }, []);

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
  // Promote background to foreground
  foregroundSrcRef.current = backgroundSrcRef.current;

  // Reset and play the new foreground video
  requestAnimationFrame(() => {
    const newFg = fgRef.current;
    if (newFg) {
      newFg.muted = !soundOn; // 👈 respects current sound state
      newFg.currentTime = 0;
      newFg.play().catch(console.warn);
    }
  });

  // Select next background video for the main adventure flow
  const nextPool = remainingVideos.filter(v => v !== backgroundSrcRef.current);
  if (nextPool.length === 0) {
    console.log("Final video playing — no more background.");

    backgroundSrcRef.current = null;
    isFinalTransition.current = true;
    glitchActiveRef.current = false;

    // Update background blur vid
    setBackgroundVideoUrl(prev => {
      let next;
      do {
        next = bgVids[Math.floor(Math.random() * bgVids.length)];
      } while (next === prev);
      return next;
    });


    setVideoCycle(c => c + 1);
    return;
  }

  // Select and assign new background video
  const nextBg = nextPool[Math.floor(Math.random() * nextPool.length)];
  backgroundSrcRef.current = nextBg;
  setRemainingVideos(nextPool.filter(v => v !== nextBg));

  // Update blurred letterbox background as well
  const newBgVid = bgVids[Math.floor(Math.random() * bgVids.length)];
  setBackgroundVideoUrl(newBgVid);

  glitchActiveRef.current = false;
  setVideoCycle(c => c + 1);
};


  const toggleSound = () => {
    setSoundOn(prev => !prev);

    const fg = fgRef.current;
    if (fg) fg.muted = soundOn; // will unmute when soundOn === true
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {backgroundVideoUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <video
            key={backgroundVideoUrl} // ✅ force remount on src change
            src={backgroundVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(6px) brightness(0.6)",
              display: "block", // ensure it takes up space
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
        }}
      >
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
          muted={videoCycle === 0 || !soundOn} // ✅ only unmute after interaction
          id="fgVideo"
        />
        <CanvasOverlay
          triggerGlitch={glitchActiveRef.current}
          fgVideo={fgRef.current}
          bgVideo={bgRef.current}
          onGlitchComplete={handleGlitchFinish}
        />
        <div
          onClick={!showChoices ? toggleSound : undefined}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            fontFamily: "VCR, monospace",
            fontSize: "clamp(1.5rem, 4vw, 4rem)",
            color: "white",
            backgroundColor: "rgba(0,0,0,0)",
            padding: "8px 14px",
            borderRadius: "4px",
            cursor: showChoices ? "default" : "pointer",
            zIndex: 1000,
            userSelect: "none",
            letterSpacing: "1px",
          }}
        >
          {showChoices ? "CHOOSE" : soundOn ? "SOUND ON" : "SOUND OFF"}
        </div>
        {showChoices && (
          <ChoiceOverlay
            key={videoCycle}
            onChoice={handleChoice}
            animationKey={videoCycle}
          />
        )}
      </div>
    </div>
  );
}
