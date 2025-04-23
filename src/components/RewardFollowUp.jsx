// src/components/RewardFollowUp.jsx
import React from "react";
import { rewardMap } from "../constants/rewardMap";
import Title from "./Title";

export default function RewardFollowUp({ reward, countdown }) {
  const meta = rewardMap[reward];
  if (!meta) return null;

  const showStaticMessage = meta.message && !meta.redirect;

  return (
    <>
      {showStaticMessage && (
        <p style={{ color: "#ccc", marginTop: "1rem", fontSize: "0.8rem" }}>
          {meta.message}
        </p>
      )}
      {meta.extra && (
        <p style={{ color: "#aaa", fontSize: "0.75rem", marginTop: "0.25rem" }}>
          {meta.extra}
        </p>
      )}
      {meta.code && (
        <div style={{ marginTop: "0rem", pointerEvents: "none" }}>
          <Title style={{ marginTop: "0rem", height: "auto", position: "relative" }}>{meta.code}</Title>
        </div>
      )}


      {meta.redirect && countdown !== null && (
        <p style={{ color: "#aaa", fontSize: "0.75rem", marginTop: "0.25rem" }}>
          redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
      )}
    </>
  );
}
