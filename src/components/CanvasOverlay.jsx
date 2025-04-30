import React, { useEffect, useRef } from "react";

export default function CanvasOverlay({ triggerGlitch, fgVideo, bgVideo, onGlitchComplete }) {
  const canvasRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fgVideo || !bgVideo || !triggerGlitch || runningRef.current) return;

    runningRef.current = true;
    let animationFrame;

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

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
      if (fgVideo.readyState >= 2) {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(fgVideo, 0, 0, width, height);
      }
      if (bgVideo.readyState >= 2) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(bgVideo, 0, 0, width, height);
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

    fgVideo.pause();
    bgVideo.pause();
    bgVideo.currentTime = 0;

    maskCtx.clearRect(0, 0, width, height);
    canvas.style.opacity = "1";
    spawnY = 0;
    words.length = 0;
    positiveChance = 0.25;

    let frame = 0;
    const maxFrames = 50;

    const render = () => {
      if (spawnY < height) {
        spawnWords();
      } else {
        const progress = (frame - maxFrames) / 20;
        const clamped = Math.min(progress, 1);
        canvas.style.opacity = `${1 - clamped}`;
      }

      draw();
      frame++;

      if (frame < maxFrames + 20) {
        animationFrame = requestAnimationFrame(render);
      } else {
        canvas.style.opacity = "0";
        runningRef.current = false;
        onGlitchComplete?.();
      }
    };

    requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      runningRef.current = false;
    };
  }, [triggerGlitch, fgVideo, bgVideo, onGlitchComplete]);

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
        transition: "opacity 1s ease",
        opacity: triggerGlitch ? 1 : 0,
      }}
    />
  );
}
