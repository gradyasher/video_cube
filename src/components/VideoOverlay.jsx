import React, { useRef, useEffect } from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (activeVideoIndex === null) return;

    const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
    console.log("🎥 extracted videoId:", videoId);

    function createPlayer() {
      console.log("🧱 creating YouTube player...");

      // Remove previous player instance if it exists
      if (playerRef.current) {
        playerRef.current.destroy();
        console.log("💣 destroyed previous player");
      }

      // Create a new container div for YouTube player
      let container = document.getElementById("youtube-player-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "youtube-player-container";
        Object.assign(container.style, {
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "80%",
          height: "80%",
          borderRadius: "12px",
          boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
          zIndex: 1000,
        });
        document.body.appendChild(container);
      }

      // Create YouTube player
      playerRef.current = new window.YT.Player(container, {
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
          }
        },
      });

      console.log("📺 YT.Player instance assigned:", playerRef.current);
    }

    // Load YouTube API if needed
    if (window.YT && window.YT.Player) {
      console.log("🚀 YT API already loaded");
      createPlayer();
    } else {
      console.log("📡 loading YouTube iframe API...");
      const existingScript = document.querySelector("script[src='https://www.youtube.com/iframe_api']");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          console.log("🌐 YT API ready — creating player");
          createPlayer();
        }
      }, 200);
    }

    // Cleanup on unmount or overlay close
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        console.log("🧼 cleaned up YT player");
      }
      const container = document.getElementById("youtube-player-container");
      if (container) {
        container.remove(); // prevent crash
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
    />
  );
}

// blablablablablablablablabl
