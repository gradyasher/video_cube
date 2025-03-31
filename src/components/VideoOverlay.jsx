import React, { useRef, useEffect } from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (activeVideoIndex === null) return;

    window.postMessage("video-playing", "*");

    const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
    const iframe = iframeRef.current;

    // Load basic iframe in case YouTube API fails
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&enablejsapi=1`;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    const initializePlayer = () => {
      playerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady: (event) => event.target.playVideo(),
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
      window.postMessage("video-closed", "*");
    };
  }, [activeVideoIndex]);

  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    if (iframeRef.current) iframeRef.current.src = "";
    window.postMessage("video-closed", "*");
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
          backgroundImage:
            "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
        }}
        onClick={handleOverlayClick}
      ></div>
    </>
  );
}
