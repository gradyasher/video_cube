import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/base";
import "../styles/SoundbathLogo.css";

export default function SoundbathLogo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timeout);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "5vh",
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <img
        src={BASE_URL + "assets/soundbath.png"}
        alt="soundbath logo"
        className={`logo-fade ${visible ? "logo-visible" : ""}`}
        style={{
          width: "clamp(150px, 20vw, 200px)",
          height: "auto",
        }}
      />
    </div>
  );
}
