// /hooks/useCanvasRecorder.js
import { useEffect } from "react";

export default function useCanvasRecorder({ trigger, durationMs = 2000, onComplete }) {
  useEffect(() => {
    if (!trigger) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) return console.warn("🚨 No canvas found");

    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
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

        const { url } = await res.json();
        console.log("✅ Final video uploaded:", url);
        onComplete?.(url);
      } catch (err) {
        console.error("❌ Upload failed:", err.message || err);
      }
    };

    console.log("🎥 Recording started");
    recorder.start();

    setTimeout(() => {
      recorder.stop();
      console.log("🛑 Recording stopped");
    }, durationMs);
  }, [trigger]);
}
