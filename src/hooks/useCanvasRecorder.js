// /hooks/useCanvasRecorder.js
import { useEffect } from "react";

export default function useCanvasRecorder({ trigger, durationMs = 2000, onComplete }) {
  useEffect(() => {
    if (!trigger) return;

    const canvas = document.querySelector("div[style*='-9999'] canvas");
    if (!canvas) return console.warn("🚨 No canvas found");

    const stream = canvas.captureStream(60);

    console.log("🎥 Capturing stream from:", canvas);
    console.log("🎥 Stream tracks:", stream.getTracks());

    const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
    const chunks = [];

    recorder.ondataavailable = (e) => {

      console.log("📸 ondataavailable:", e);
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      console.log("🛑 recorder stopped");
      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], "glitch-reading.webm");

      const formData = new FormData();
      formData.append("file", file);

      try {
        console.log("📤 uploading file to backend...");
        const res = await fetch("http://localhost:3001/api/process-glitch-video", {
          method: "POST",
          body: formData,
        });

        const text = await res.text();
        console.log("📥 raw response:", text);

        let url;
        try {
          const data = JSON.parse(text);
          url = data.url;
        } catch (parseErr) {
          console.error("❌ Failed to parse JSON:", parseErr);
          return;
        }

        if (!url) {
          console.warn("⚠️ No `url` in response.");
        } else {
          console.log("✅ Final video uploaded:", url);
          onComplete?.(url);
        }
      } catch (err) {
        console.error("❌ Upload failed:", err.message || err);
      }
    };


    try {
      recorder.start();
      console.log("🎬 recorder started");
    } catch (err) {
      console.error("❌ recorder failed to start:", err);
    }

    setTimeout(() => {
      recorder.stop();
      console.log("🛑 Recording stopped");
    }, durationMs);
  }, [trigger]);
}
