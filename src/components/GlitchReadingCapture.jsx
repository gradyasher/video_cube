import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Text, Image } from "@react-three/drei";
import GlitchReadingContents from "../components/GlitchReadingContents";
import TitleOverlay from "../components/TitleOverlay";
import SoundbathLogo from "../components/SoundbathLogo";
import MusicPlayer from "../components/MusicPlayer";

function Gongboi({ url }) {
  return (
    <Image
      url={url}
      scale={[2, 2, 1]}         // tweak scale to your liking
      position={[0, -1.9, 3]}        // place in front of sphere
      transparent
    />
  );
}


export default function GlitchReadingCapture() {
  const containerRef = useRef();
  const [capturing, setCapturing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!capturing) return;

    const container = containerRef.current;
    if (!container) {
      console.warn("🚨 container is null!");
      return;
    }

    const canvas = container.querySelector("canvas");
    if (!canvas) {
      console.warn("🚨 canvas is null!");
      return;
    }

    const stream = canvas.captureStream(60); // 60fps stream
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "glitch-reading.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      console.log("✅ Download triggered");

      setShowOverlay(true); // bring back overlays
    };

    console.log("🎬 Starting MediaRecorder...");
    mediaRecorder.start();

    // 🔁 Delay hiding overlay for 1 animation frame after capture starts
    requestAnimationFrame(() => {
      console.log("🙈 Hiding overlay post-canvas commit");
      setShowOverlay(false);
    });

    const stopDelay = setTimeout(() => {
      console.log("🛑 Stopping MediaRecorder...");
      mediaRecorder.stop();
    }, 2000); // 2 seconds

    return () => clearTimeout(stopDelay);
  }, [capturing]);


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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
        <Canvas
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
          }}
          orthographic={false}
          camera={{ position: [0, 0, 6.5], fov: 75 }}
          gl={{ preserveDrawingBuffer: true }}
          fog={{ color: "#000000", near: 2, far: 12 }}
        >
          <Suspense fallback={null}>
            <GlitchReadingContents
              onSphereReady={() => {
                console.log("🟢 Sphere ready, scheduling capture...");
                setTimeout(() => {
                  console.log("✅ Capture triggered");
                  setCapturing(true);
                }, 1000);
              }}
            />
            <Text
              position={[0, 1.8, 2]}
              fontSize={1.1}
              color="#ccff66"
              anchorX="center"
              anchorY="middle"
              textAlign="center"
              letterSpacing={-0.13}
              font="/fonts/ArialMT.woff" // or whatever your custom font is
              material-toneMapped={false}
            >
              the sphere has{"\n"}chosen.
            </Text>
            <Gongboi url="/assets/soundbath.png" />

          </Suspense>

        </Canvas>
      </div>
    </div>
  );
}
