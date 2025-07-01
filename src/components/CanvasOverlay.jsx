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
    let spawnRate = 1;
    let positiveChance = 50;

    const randomText = () => {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      const len = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    };

    const spawnWords = () => {
      const fontSize = Math.floor(window.innerWidth * 0.2);

      for (let i = 0; i < spawnRate; i++) {
        const word = {
          x: Math.random() * (width - fontSize * 1.5),
          y: Math.random() * (height) + fontSize / 2,
          text: randomText(),
          fontSize,
          type: Math.random() < positiveChance ? "add" : "subtract",
        };

        maskCtx.font = `${word.fontSize}px Arial`;

        if (word.type === "subtract") {
          maskCtx.globalCompositeOperation = "source-over";
          maskCtx.fillStyle = "white"; // adds to the mask (reveals background)
        } else if (word.type === "add") {
          maskCtx.globalCompositeOperation = "destination-out";
          maskCtx.fillStyle = "black"; // removes from the mask (restores fg)
        }

        maskCtx.fillText(word.text, word.x, word.y);
        words.push(word);
      }

      spawnY += 1;
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
    const maxFrames = 500;
    let timeout;

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

      if (frame < maxFrames) {
        animationFrame = requestAnimationFrame(render);
      } else {
        canvas.style.opacity = "0";
        runningRef.current = false;
        onGlitchComplete?.();
      }
    };

    timeout = setTimeout(() => {
      console.warn("⏰ Glitch timeout reached — force exiting");
      canvas.style.opacity = "0";
      runningRef.current = false;
      onGlitchComplete?.();
    }, 5000);


    requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      runningRef.current = false;
      clearTimeout(timeout);
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
