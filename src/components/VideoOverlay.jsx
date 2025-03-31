import React, { useRef, useEffect } from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (activeVideoIndex !== null && iframeRef.current) {
      const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&enablejsapi=1`;
    }
  }, [activeVideoIndex]);

  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
  };

  if (activeVideoIndex === null) return null;

  return (
    <>
      <iframe
        id="youtube-player"
        ref={iframeRef}
        width="80%"
        height="80%"
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          borderRadius: "12px",
          boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
          zIndex: 1000,
        }}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube video player"
      ></iframe>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          backgroundImage: "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
        }}
        onClick={handleOverlayClick}
      ></div>
    </>
  );
}
