import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import GlitchReadingContents from "../components/GlitchReadingContents";
import TextMesh from "../components/TextMesh"; // replaces drei Text
import { BASE_URL } from "../utils/base";

export default function GlitchReadingCapture() {
  const containerRef = useRef();
  const [capturing, setCapturing] = useState(false);
  const base = BASE_URL;

  useEffect(() => {
    if (!capturing) return;

    const container = containerRef.current;
    const canvas = container.querySelector("canvas");
    if (!canvas) return console.warn("🚨 Canvas not found");

    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], "glitch-reading.webm");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:3001/api/process-glitch-video", {
          method: "POST",
          body: formData,
        });

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed with status ${res.status}: ${text}`);
        }
        if (!contentType.includes("application/json")) {
          throw new Error("❌ Expected JSON but got: " + contentType);
        }

        const { url } = await res.json();
        console.log("✅ Final video available at:", url);
        // 🪄 add share UI here
      } catch (err) {
        console.error("❌ Upload failed:", err.message || err);
      }
    };

    recorder.start();
    setTimeout(() => {
      recorder.stop();
    }, 2000);
  }, [capturing]);

  return (
    <div
      ref={containerRef}
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
        style={{
          width: 720,
          height: 720,
          position: "relative",
        }}
      >
        <Canvas
          onCreated={({ gl }) => {
            gl.domElement.style.position = "absolute";
            gl.domElement.style.top = "0";
            gl.domElement.style.left = "0";
            gl.domElement.style.width = "100%";
            gl.domElement.style.height = "100%";
          }}
          camera={{ position: [0, 0, 6.5], fov: 75 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <Suspense fallback={null}>
            <GlitchReadingContents
              onSphereReady={() => {
                console.log("🟢 Sphere ready. Starting capture...");
                setTimeout(() => setCapturing(true), 1000);
              }}
            />
            <TextMesh
              position={[0, 1.8, 2]}
              fontSize={64}
              width={4}
              height={1.5}
              color="#ccff66"
              text={`the sphere has\nchosen.`}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
