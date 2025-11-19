// BackgroundVideo.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { VideoTexture, LinearFilter, RGBFormat, SRGBColorSpace } from "three";
import { backgroundShader } from "../shaders/backgroundShader";
import { bgVids } from "../constants/videoSources";

export default function BackgroundVideo({ onReady, videoUrl, scale = 1 }) {
  const materialRef = useRef();
  const videoRef = useRef(null);
  const rVFCId = useRef(null);
  const [videoTexture, setVideoTexture] = useState(null);

  const selectedSrc = useMemo(
    () => videoUrl || bgVids[Math.floor(Math.random() * bgVids.length)],
    [videoUrl]
  );

  useEffect(() => {
    const video = document.createElement("video");

    // Policies BEFORE src
    video.muted = true;              video.setAttribute("muted", "");
    video.playsInline = true;        video.setAttribute("playsinline", "");
    video.autoplay = true;
    video.loop = true;
    video.preload = "auto";

    video.src = selectedSrc;
    videoRef.current = video;

    const onLoaded = () => {
      const tex = new VideoTexture(video);
      tex.minFilter = LinearFilter;
      tex.magFilter = LinearFilter;
      tex.format = RGBFormat;
      if ("colorSpace" in tex) tex.colorSpace = SRGBColorSpace;
      tex.needsUpdate = true;

      setVideoTexture(tex);
      onReady?.(); // proceed as soon as the first frame is ready

      // Drive updates from the video’s own frame cadence
      const pump = () => {
        tex.needsUpdate = true;
        rVFCId.current = video.requestVideoFrameCallback?.(pump) ?? null;
      };
      video.requestVideoFrameCallback?.(pump);

      // Kickstart playback (helps some WebKit builds)
      try { video.currentTime = 0.001; } catch {}
      const p = video.play();
      if (p?.catch) p.catch(() => {/* ignore autoplay warnings in prod */});
    };

    const onError = () => {
      // try one fallback file
      const alt = bgVids.find((v) => v !== selectedSrc);
      if (alt) { video.src = alt; video.load(); }
    };

    video.addEventListener("loadeddata", onLoaded, { once: true });
    video.addEventListener("error", onError);
    video.load();

    return () => {
      if (rVFCId.current && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(rVFCId.current);
      }
      try { video.pause(); } catch {}
      video.src = "";
    };
  }, [selectedSrc, onReady]);

  // Rebind texture to shader once created (in case material was constructed first)
  useEffect(() => {
    if (!materialRef.current || !videoTexture) return;
    const u = materialRef.current.uniforms;
    if (u?.map) {
      u.map.value = videoTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [videoTexture]);

  // Fallback tick so frames advance even without rVFC
  useFrame(() => {
    if (videoTexture) videoTexture.needsUpdate = true;
  });

  if (!videoTexture) return null;

  return (
    <mesh position={[0, 0, -5]} renderOrder={-1}>
      <planeGeometry args={[100 * scale, 30 * scale]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={backgroundShader.vertexShader}
        fragmentShader={backgroundShader.fragmentShader}
        uniforms={{
          map: { value: videoTexture },   // make sure your shader uses `uniform sampler2D map;`
          warpAmount: { value: 1.5 },
        }}
        transparent={false}
      />
    </mesh>
  );
}
