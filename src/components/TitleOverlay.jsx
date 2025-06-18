// src/components/TitleOverlay.jsx
import React from "react";
import Title from "./Title";

export default function TitleOverlay({ text, style = {}, titleStyle = {} }) {
  return (
    <div
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
        ...style,
      }}
    >
      <Title style={titleStyle}>{text}</Title>
    </div>
  );
}
