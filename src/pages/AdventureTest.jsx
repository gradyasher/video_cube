import React, { useEffect, useRef, useState } from "react";

export default function AdventureTest() {
  const canvasRef = useRef(null);
  const bgVideoRef = useRef(null);
  const fgVideoRef = useRef(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const [hideForeground, setHideForeground] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  const handleClickLogo = () => {
    setShowLogo(false);         // 👈 permanently hide logo on click
    setHideForeground(true);    // fade out foreground video
    setGlitchActive(true);       // start glitch
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const words = [];
    let spawnY = 0;
    let spawnRate = 30;

    const randomText = () => {
      const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
      const length = Math.floor(Math.random() * 3);
      return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    };

    let fontSize = 200;
    let positiveChance = 0.25;

    const spawnWords = () => {
      for (let i = 0; i < spawnRate; i++) {
        const isPositive = Math.random() < positiveChance;
        words.push({
          x: Math.random() * width * 1.5 - 500,
          y: spawnY + (Math.random() - 0.5) * 500,
          text: randomText(),
          type: isPositive ? "add" : "subtract",
          fontSize: fontSize,
        });
      }
      spawnY += 20;
      if (spawnY > height) {
        spawnY = 0;
      }
      if (positiveChance > 0) {
        positiveChance -= 0.005;
      }
    };

    const draw = () => {
      ctx.globalCompositeOperation = "source-over";

      if (bgVideoRef.current && bgVideoRef.current.readyState >= 2) {
        ctx.drawImage(bgVideoRef.current, 0, 0, width, height);
      }
      if (fgVideoRef.current && fgVideoRef.current.readyState >= 2) {
        ctx.drawImage(fgVideoRef.current, 0, 0, width, height);
      }

      ctx.globalCompositeOperation = "destination-out";
      ctx.font = `bold ${fontSize}px Arial`;

      words.forEach((word) => {
        ctx.font = `bold ${word.fontSize}px Arial`;
        if (word.type === "subtract") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillText(word.text, word.x, word.y);
        } else if (word.type === "add") {
          ctx.save();
          ctx.beginPath();
          ctx.fillText(word.text, word.x, word.y);
          ctx.clip();
          ctx.globalCompositeOperation = "source-over";
          if (fgVideoRef.current && fgVideoRef.current.readyState >= 2) {
            ctx.drawImage(fgVideoRef.current, 0, 0, width, height);
          }
          ctx.restore();
        }
      });
    };

    const tick = () => {
      if (!glitchActive) return;
      spawnWords();
      draw();
      if (spawnRate < 30) {
        spawnRate += 0.1;
      }
    };

    const interval = setInterval(tick, 30);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      draw();
    };

    window.addEventListener("resize", resize);

    // 🔥 freeze foreground after 5 seconds and show logo
    const freezeTimer = setTimeout(() => {
      if (!glitchActive) {    // ← prevent from happening after glitch
        if (fgVideoRef.current) {
          fgVideoRef.current.pause();
        }
        setShowLogo(true);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(freezeTimer);
      window.removeEventListener("resize", resize);
    };
  }, [glitchActive]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* background video */}
      <video
        ref={bgVideoRef}
        src="/videos/bg_videos/bg 2.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
      {/* foreground video */}
      <video
        ref={fgVideoRef}
        src="/videos/bg_videos/bg 1.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          opacity: hideForeground ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      />
      {/* glitch canvas */}
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
      {/* soundbath logo overlay */}
      {showLogo && (
        <img
          src="/assets/soundbath.png"
          alt="soundbath logo"
          onClick={handleClickLogo}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "auto",
            zIndex: 3,
            cursor: "pointer",
          }}
        />
      )}
    </div>
  );
}
