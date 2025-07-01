import React, { useEffect, useState } from "react";
import "../styles/Title.css";

export default function Title({ children, style = {} }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const responsiveFontSize =
    typeof window !== "undefined" && window.innerWidth < 768
      ? "clamp(36px, 10vw, 64px)"
      : "clamp(56px, 8vw, 128px)";

  return (
    <h1
      className={`title-fade ${visible ? "title-show" : ""}`}
      style={{
        fontFamily: "Helvetica, sans-serif",
        fontWeight: "400",
        fontSize: responsiveFontSize,
        color: "#CCDE01",
        letterSpacing: "-0.12em",
        lineHeight: "1.2em",
        textAlign: "center",
        margin: 0,
        padding: 0,
        ...style,
      }}
    >
      {children}
    </h1>
  );
}
