// src/pages/MysteryRewardPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SlotMachine from "../components/SlotMachine";

export default function MysteryRewardPage() {
  const navigate = useNavigate();
  
  const handleFinish = (reward) => {
    console.log("🎁 user received reward:", reward);
    // optional: trigger email send, update backend, etc.
  };

  useEffect(() => {
    if (localStorage.getItem("hasSeenMystery") === "true" && !document.referrer.includes("/mystery")) {
      navigate("/");
    }
  }, []);

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
