// src/components/TitleOverlay.jsx
import React from "react";
import Title from "./Title";

export default function TitleOverlay({ text }) {
  return (
    <div
      className="title-wrapper"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "20vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <Title>{text}</Title>
    </div>
  );
}
