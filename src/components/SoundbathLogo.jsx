import React from "react";
import { motion } from "framer-motion";

export default function SoundbathLogo() {
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
      <motion.img
        src="/assets/soundbath.png"
        alt="soundbath logo"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          width: "clamp(100px, 20vw, 240px)",
          height: "auto",
        }}
      />
    </div>
  );
}
