import React, { useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div
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
      <audio ref={audioRef} loop>
        <source
          src="https://dl.dropboxusercontent.com/scl/fi/dvnmfqlup0bt8p3em5exu/mmmmdirbuz_slow.wav?rlkey=i5a8knl2stoj6rltkxwc3fj91"
          type="audio/wav"
        />
      </audio>

      <button
        onClick={togglePlay}
        onMouseEnter={(e) => (e.target.style.background = "#CCDE0122")}
        onMouseLeave={(e) => (e.target.style.background = "none")}
        style={{
          background: "none",
          color: "#CCDE01",
          border: "none",
          fontFamily: "'Times New Roman', serif",
          padding: "10px 16px",
          fontSize: "18px",
          letterSpacing: ".2em",
          cursor: "pointer",
          transition: "all 0.3s ease",
          borderRadius: "6px",
        }}
      >
        {playing ? "❚❚ Mute" : "▶ Play"}
      </button>
    </div>
  );
}
