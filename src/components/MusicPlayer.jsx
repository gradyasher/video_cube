import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = false; // <- iOS sometimes requires this before play()

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch((err) => console.warn("❌ Couldn't play:", err));
    }

  };

  // 💬 respond to overlay video state
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

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source
          src="https://dl.dropboxusercontent.com/scl/fi/39oki5wx5tweswnzgueuk/SLOW-DIRBS.wav?rlkey=bwi3t7hd07f9p6808ggpiwrl9"
          type="audio/wav"
        />
      </audio>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: "2vh",
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={togglePlay}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#CCDE0122")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "none")
          }
          style={{
            background: "none",
            border: "none",
            padding: "0",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: "6px",
            outline: "none",
          }}
        >
          <img
            src={
              playing
                ? "/assets/mute_button_stretch_glow.png"
                : "/assets/play_button_stretch_glow.png"
            }
            alt={playing ? "Mute" : "Play"}
            style={{
              width: "clamp(80px, 15vw, 180px)",
              height: "auto",
              display: "block",
              pointerEvents: "none",
            }}
          />
        </button>
      </motion.div>
    </>
  );
}
