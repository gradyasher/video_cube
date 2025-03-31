import React from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    window.postMessage("video-closed", "*");
  };

  if (activeVideoIndex === null) return null;

  const videoUrl = hostedVideoLinks[activeVideoIndex];

  return (
    <>
      <video
        src={videoUrl}
        autoPlay
        muted={false}
        playsInline
        controls={false}
        loop={false}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: "12px",
          boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
          zIndex: 1000,
        }}
        onPlay={() => window.postMessage("video-playing", "*")}
      />
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
          backgroundImage:
            "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
        }}
        onClick={handleOverlayClick}
      />
    </>
  );
}
