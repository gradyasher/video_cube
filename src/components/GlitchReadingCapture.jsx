// GlitchReadingCapture.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import GlitchReadingContents from "../components/GlitchReadingContents";
import TitleOverlay from "../components/TitleOverlay";
import SoundbathLogo from "../components/SoundbathLogo";
import MusicPlayer from "../components/MusicPlayer";

const CCapture = window.CCapture;

export default function GlitchReadingCapture() {
  const containerRef = useRef(null);
  const capturerRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = containerRef.current.querySelector("canvas");
    if (!canvas) return;

    const capturer = new CCapture({ format: "webm", framerate: 60 });
    capturerRef.current = capturer;

    let frame = 0;
    const maxFrames = 60 * 5; // 5 seconds at 60fps

    function capture() {
      if (!capturing) return;

      // capture entire container (Canvas + overlays)
      capturer.capture(containerRef.current);
      frame++;

      if (frame < maxFrames) {
        requestAnimationFrame(capture);
      } else {
        capturer.stop();
        capturer.save();
      }
    }

    // delay capture until everything has rendered
    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        setCapturing(true);
        capturer.start();
        requestAnimationFrame(capture);
      });
    }, 1500); // give DOM + scene time to paint

    return () => clearTimeout(timeout);
  }, [capturing]);

  return (
    <div
      ref={containerRef}
      style={{
        width: 720,
        height: 720,
        position: "relative",
        overflow: "hidden",
        background: "black",
      }}
    >
      {/* 3D Scene */}
      <Canvas
        orthographic={false}
        camera={{ position: [0, 0, 6.5], fov: 75 }}
        gl={{ preserveDrawingBuffer: true }}
        fog={{ color: "#000000", near: 2, far: 12 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <Suspense fallback={null}>
          <GlitchReadingContents onSphereReady={() => setCapturing(true)} />
        </Suspense>
      </Canvas>

      {/* Overlay Text + Branding */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <TitleOverlay text="the sphere has chosen." />
        <SoundbathLogo />
        <MusicPlayer />
      </div>
    </div>
  );
}
