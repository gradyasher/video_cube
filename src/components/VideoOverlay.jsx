import React, { useRef, useEffect } from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const playerRef = useRef(null);
  const primedRef = useRef(false);

  useEffect(() => {
    if (activeVideoIndex === null) return;

    const realVideoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
    const dummyVideoId = "4Pgz_2cSiGQ";

    const loadVideoId = primedRef.current ? realVideoId : dummyVideoId;

    function createPlayer(videoId, autoplay = true) {
      console.log("🧱 creating YouTube player with:", videoId);

      // Clean up previous player
      if (playerRef.current) {
        playerRef.current.destroy();
        console.log("💣 destroyed previous player");
      }

      // Create container if needed
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

      playerRef.current = new window.YT.Player(container, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            console.log("✅ YT Player ready — playing:", videoId);
            event.target.playVideo();
            window.postMessage("video-playing", "*");

            // If dummy loaded, wait then switch to real video
            if (!primedRef.current && videoId === dummyVideoId) {
              primedRef.current = true;
              setTimeout(() => {
                createPlayer(realVideoId);
              }, 1500); // ~1.5 seconds
            }
          },
          onError: (e) => {
            console.warn("❌ YT Player error:", e.data);
          }
        },
      });
    }

    // Load API if needed
    if (window.YT && window.YT.Player) {
      createPlayer(loadVideoId);
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer(loadVideoId);
      };
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        console.log("🧼 cleaned up YT player");
      }
      const container = document.getElementById("youtube-player-container");
      if (container) container.remove();

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
