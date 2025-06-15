import React, { useEffect, useState } from "react";

export default function ChoiceOverlay({ onChoice, animationKey }) {
  const [choices, setChoices] = useState([]);

  useEffect(() => {
    const generateRandomText = () => {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      const len = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: len }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    const directions = ["top", "bottom", "left", "right"];

    const generated = Array.from({ length: 6 }, () => {
      const left = Math.floor(Math.random() * 80 + 10);
      const top = Math.floor(Math.random() * 80 + 10);
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const hue = Math.floor(Math.random() * 360);

      let initialTransform = "";
      switch (dir) {
        case "top":
          initialTransform = `translate(-50%, -200%)`;
          break;
        case "bottom":
          initialTransform = `translate(-50%, 200%)`;
          break;
        case "left":
          initialTransform = `translate(-200%, -50%)`;
          break;
        case "right":
          initialTransform = `translate(200%, -50%)`;
          break;
      }

      return {
        text: generateRandomText(),
        left,
        top,
        hue,
        initialTransform,
      };
    });

    // Set initial transform positions
    setChoices(
      generated.map(choice => ({
        ...choice,
        transform: choice.initialTransform,
      }))
    );

    // Force layout -> then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setChoices(prev =>
          prev.map(choice => ({
            ...choice,
            transform: "translate(-50%, -50%)",
          }))
        );
      });
    });
  }, [animationKey]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      {choices.map((choice, i) => (
        <button
          key={i}
          onClick={onChoice}
          style={{
            position: "absolute",
            left: `${choice.left}%`,
            top: `${choice.top}%`,
            transform: choice.transform,
            background: "transparent",
            border: "none",
            fontSize: "clamp(2rem, 8vw, 6rem)",
            color: `hsl(${choice.hue}, 100%, 50%)`,
            fontFamily: "Arial, sans-serif",
            cursor: "pointer",
            transition: "transform 1s ease",
            outline: "none",
            willChange: "transform",
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.4)")
          }
          onMouseLeave={e =>
            (e.currentTarget.style.transform = "translate(-50%, -50%)")
          }
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}
