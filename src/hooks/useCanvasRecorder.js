import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function useCanvasRecorder({
  trigger,
  durationMs = 6000,
  onComplete,
  fps = 30,
}) {
  useEffect(() => {
    if (!trigger) return;

    const sessionId = uuidv4();
    let frame = 0;
    const totalFrames = Math.floor((durationMs / 1000) * fps);
    let intervalId = null;

    const waitForCanvasAndStart = () => {
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        console.warn("🎥 No canvas found — retrying in 200ms...");
        setTimeout(waitForCanvasAndStart, 200); // retry until canvas mounts
        return;
      }

      console.log("⚙️ Starting frame capture for session", sessionId);

      setTimeout(() => {
        intervalId = setInterval(async () => {
          if (frame >= totalFrames) {
            clearInterval(intervalId);
            console.log("📦 Finished uploading all frames. Stitching...");
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
            return;
          }

          frame++; // <-- move this to the top so we bail out *before* overshooting

          try {
            const blob = await new Promise((resolve) =>
              canvas.toBlob(resolve, "image/png")
            );

            if (!blob) {
              console.warn("🛑 Failed to convert canvas to blob");
              return;
            }

            const formData = new FormData();
            formData.append("frame", blob, `frame_${(frame - 1).toString().padStart(4, "0")}.png`);
            formData.append("sessionId", sessionId);
            formData.append("index", (frame - 1).toString().padStart(4, "0"));

            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-frame`, {
              method: "POST",
              body: formData,
            });

            console.log(`📸 Frame ${frame - 1}/${totalFrames} uploaded`);
          } catch (err) {
            console.error("❌ Failed to upload frame:", err);
          }
        }, 1000 / fps);
      }, 100);

    };

    waitForCanvasAndStart();

    return () => clearInterval(intervalId);
  }, [trigger]);
}
