import React, { useRef, useEffect } from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (activeVideoIndex === null) return;

    const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
    console.log("🎥 extracted videoId:", videoId);

    function createPlayer() {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            console.log("✅ YT Player ready — calling playVideo()");
            event.target.playVideo();
            window.postMessage("video-playing", "*");
          },
          onError: (e) => {
            console.warn("❌ YT Player error:", e.data);
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          createPlayer();
        }
      }, 200);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        console.log("🧹 Cleaned up YT player");
      }
      window.postMessage("video-closed", "*");
    };
  }, [activeVideoIndex]);

  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    window.postMessage("video-closed", "*");
  };

  if (activeVideoIndex === null) return null;

  return (
    <>
      <div
        id="youtube-player"
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "80%",
          height: "80%",
          borderRadius: "12px",
          boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
          zIndex: 1000,
        }}
      ></div>
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
