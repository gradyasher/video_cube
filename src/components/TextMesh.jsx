import React, { useMemo } from "react";
import { CanvasTexture, LinearFilter } from "three";

export default function TextMesh({
  text = "Hello",
  position = [0, 0, 0],
  fontSize = 64,
  color = "#ccff66",
  width = 4,
  height = 1.5,
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = text.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + i * fontSize);
    });

    const tex = new CanvasTexture(canvas);
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    return tex;
  }, [text, fontSize, color]);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
