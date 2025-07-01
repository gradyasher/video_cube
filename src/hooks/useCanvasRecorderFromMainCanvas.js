import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function useCanvasRecorderFromMainCanvas({
  trigger,
  durationMs = 6000,
  fps = 30,
  onComplete,
}) {
  useEffect(() => {
    if (!trigger) return;

    const canvas = document.querySelector("canvas");
    const sessionId = uuidv4();

    if (!canvas) {
      console.warn("🎥 No onscreen canvas found");
      return;
    }

    const totalFrames = Math.floor((durationMs / 1000) * fps);
    let frame = 0;
    let startTime = null;
    let lastCaptureTime = 0;

    console.log("🎬 Starting onscreen canvas capture:", sessionId);

    const step = async (now) => {
      if (!startTime) startTime = now;

      const elapsed = now - startTime;
      const delta = now - lastCaptureTime;

      if (delta >= 1000 / fps && frame < totalFrames) {
        try {
          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );
          if (!blob) return;

          const padded = frame.toString().padStart(4, "0");
          const formData = new FormData();
          formData.append("frame", blob, `frame_${padded}.png`);
          formData.append("sessionId", sessionId);
          formData.append("index", padded);

          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-frame`, {
            method: "POST",
            body: formData,
          });

          console.log(`📸 Frame ${frame + 1}/${totalFrames} uploaded`);
          frame++;
          lastCaptureTime = now;
        } catch (err) {
          console.error("❌ Frame upload error:", err);
        }
      }

      if (frame < totalFrames) {
        requestAnimationFrame(step);
      } else {
        console.log("📦 Finished uploading frames. Triggering stitch...");
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stitch-frames`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          console.log("✅ Final video ready:", data.url);
          onComplete?.(data.url);
        } catch (err) {
          console.error("❌ Failed to stitch video:", err);
        }
      }
    };

    requestAnimationFrame(step);
  }, [trigger]);
}
