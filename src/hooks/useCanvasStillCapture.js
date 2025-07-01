import { useEffect } from "react";

export default function useCanvasStillCapture(trigger = false) {
  useEffect(() => {
    if (!trigger) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) {
      console.warn("🛑 No canvas found");
      return;
    }

    const sessionId = "test-still";
    const frameIndex = "0000";

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("❌ Failed to convert canvas to blob");
        return;
      }

      const formData = new FormData();
      formData.append("frame", blob, `frame_${frameIndex}.png`);
      formData.append("sessionId", sessionId);

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-frame`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        console.log("✅ Still frame uploaded");
      } catch (err) {
        console.error("❌ Upload error:", err);
      }
    }, "image/png");
  }, [trigger]);
}
