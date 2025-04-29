// src/pages/AdventurePage.jsx
import React, { useEffect, useRef, useState } from "react";
import CanvasOverlay from "../components/CanvasOverlay";
import ChoiceOverlay from "../components/ChoiceOverlay";
import VideoLayer from "../components/VideoLayer";

const initialVideos = [
  "/videos/adventure_vids/scene1.mp4",
  "/videos/adventure_vids/scene2.mp4",
  "/videos/adventure_vids/scene3.mp4",
  "/videos/adventure_vids/scene4.mp4",
];

export default function AdventurePage() {
  const [remainingVideos, setRemainingVideos] = useState(initialVideos.slice(2));
  const [currentForeground, setCurrentForeground] = useState(initialVideos[0]);
  const [currentBackground, setCurrentBackground] = useState(initialVideos[1]);
  const [glitchActive, setGlitchActive] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const fgRef = useRef(null);
  const bgRef = useRef(null);
  const glitchTimeoutRef = useRef(null);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const onEnded = () => setShowChoices(true);
    fg.addEventListener("ended", onEnded);
    return () => fg.removeEventListener("ended", onEnded);
  }, [currentForeground]);

  const handleChoice = () => {
    const oldBg = bgRef.current;
    if (oldBg) {
      oldBg.pause(); // pause current bg
      oldBg.currentTime = 0;
    }

    setGlitchActive(true);
    setShowChoices(false);

    glitchTimeoutRef.current = setTimeout(() => {
      setCurrentForeground(currentBackground);

      const nextPool = remainingVideos.filter(v => v !== currentBackground);
      if (nextPool.length === 0) {
        console.log("Adventure complete! 🎉");
        return;
      }
      const nextBg = nextPool[Math.floor(Math.random() * nextPool.length)];
      setCurrentBackground(nextBg);
      setRemainingVideos(nextPool.filter(v => v !== nextBg));

      setGlitchActive(false);

      // after glitch fully finishes, play background

      setTimeout(() => {
        const newFg = fgRef.current;
        if (newFg) {
          newFg.currentTime = 0;
          newFg.play();
        }
      }, 100); // slight delay after glitch ends
    }, 1500); // match glitch animation length
  };


  useEffect(() => () => clearTimeout(glitchTimeoutRef.current), []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <VideoLayer ref={bgRef} src={currentBackground} zIndex={0} muted loop id="bgVideo" />
      <VideoLayer ref={fgRef} src={currentForeground} zIndex={1} muted id="fgVideo" />
      <CanvasOverlay glitchActive={glitchActive} fgVideo={fgRef.current} bgVideo={bgRef.current} />
      {showChoices && <ChoiceOverlay onChoice={handleChoice} />}
    </div>
  );
}
