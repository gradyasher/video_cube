import { useEffect, useMemo, useRef, useState } from "react";
import { VideoTexture, LinearFilter, RGBFormat } from "three";

export function useCustomVideoTexture(src, { start = true, muted = true } = {}) {
  const [videoTexture, setVideoTexture] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = muted;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");
    videoRef.current = video;

    const texture = new VideoTexture(video);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.format = RGBFormat;
    texture.generateMipmaps = false;

    if (start) {
      video.addEventListener("canplay", () => {
        video.play().catch((e) => console.warn("Autoplay failed", e));
      });
    }

    setVideoTexture(texture);

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, start, muted]);

  return videoTexture;
}
