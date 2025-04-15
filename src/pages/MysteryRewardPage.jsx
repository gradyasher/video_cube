// src/pages/MysteryRewardPage.jsx
import React from "react";
import SlotMachine from "../components/SlotMachine";

export default function MysteryRewardPage() {
  const handleFinish = (reward) => {
    console.log("🎁 user received reward:", reward);
    // optional: trigger email send, update backend, etc.
  };

  return (
    <div
      style={{
        background: "#000",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "2rem",
      }}
    >
      <SlotMachine onFinish={handleFinish} />
    </div>
  );
}
