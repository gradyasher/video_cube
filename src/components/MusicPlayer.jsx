import React, { useRef, useState, useEffect } from "react";
import { BASE_URL } from "../utils/base";
import "../styles/MusicPlayer.css";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = false;
    audio.volume = 1;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch((err) => console.warn("❌ Couldn't play:", err));
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      const msg = event.data;

      if (msg === "video-playing" && playing) {
        audioRef.current?.pause();
        setPlaying(false);
      }

      if (msg === "video-closed" && !playing) {
        audioRef.current
          ?.play()
          .then(() => setPlaying(true))
          .catch(() => {});
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [playing]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source
          src="https://dl.dropboxusercontent.com/scl/fi/39oki5wx5tweswnzgueuk/SLOW-DIRBS.wav?rlkey=bwi3t7hd07f9p6808ggpiwrl9"
          type="audio/wav"
        />
      </audio>

      <div
        className={`music-player ${visible ? "music-player-visible" : ""}`}
        style={{
          position: "absolute",
          top: "2vh",
          left: "2vw",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={togglePlay}
          style={{
            background: "transparent",
            border: "none",
            padding: "0.4rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: "6px",
            outline: "none",
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: playing
                ? `<svg xmlns="http://www.w3.org/2000/svg" fill="#CCDE01" width="48" height="48" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" fill="#CCDE01" width="48" height="48" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
            }}
            style={{ display: "block", pointerEvents: "none" }}
          />
        </button>
      </div>
    </>
  );
}
