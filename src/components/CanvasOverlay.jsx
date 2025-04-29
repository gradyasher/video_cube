import React, { useEffect, useRef } from "react";

export default function CanvasOverlay({ glitchActive, fgVideo, bgVideo }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fgVideo || !bgVideo) return;

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Persistent offscreen canvas to accumulate mask
    const persistentMask = document.createElement("canvas");
    persistentMask.width = width;
    persistentMask.height = height;
    const maskCtx = persistentMask.getContext("2d");

    const words = [];
    let spawnY = 0;
    let spawnRate = 30;
    let positiveChance = 0.25;

    const randomText = () => {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      const len = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    };

    const spawnWords = () => {
      for (let i = 0; i < spawnRate; i++) {
        const word = {
          x: Math.random() * width * 1.5 - 500,
          y: spawnY + (Math.random() - 0.5) * 500,
          text: randomText(),
          fontSize: 200,
          type: Math.random() < positiveChance ? "add" : "subtract",
        };

        // Add text to the persistent mask
        maskCtx.font = `bold ${word.fontSize}px Arial`;
        maskCtx.fillStyle = "white";
        maskCtx.fillText(word.text, word.x, word.y);

        words.push(word);
      }
      spawnY += 20;
      if (spawnY > height) spawnY = 0;
      if (positiveChance > 0) positiveChance -= 0.005;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw the foreground video first (faint noise layer)
      if (fgVideo.readyState >= 2) {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(fgVideo, 0, 0, width, height);
      }

      // Draw the background video
      if (bgVideo.readyState >= 2) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(bgVideo, 0, 0, width, height);

        // Apply the persistent mask to clip the bg video to accumulated letters
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(persistentMask, 0, 0);

        ctx.restore();
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      persistentMask.width = width;
      persistentMask.height = height;
    };

    let interval;
    if (glitchActive) {
      fgVideo.pause();
      bgVideo.pause();
      bgVideo.currentTime = 0;

      interval = setInterval(() => {
        spawnWords();
        draw();
      }, 30);

      window.addEventListener("resize", resize);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, [glitchActive, fgVideo, bgVideo]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}
