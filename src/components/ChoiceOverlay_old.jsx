import React from "react";

export default function ChoiceOverlay({ onChoice }) {
  const choices = [
    { id: "choice1", icon: "/assets/icon1.png" },
    { id: "choice2", icon: "/assets/icon2.png" },
    { id: "choice3", icon: "/assets/icon3.png" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 4,
        display: "flex",
        gap: "20px",
      }}
    >
      {choices.map((choice) => (
        <img
          key={choice.id}
          src={choice.icon}
          alt={choice.id}
          onClick={onChoice}
          style={{
            width: "100px",
            height: "100px",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}
