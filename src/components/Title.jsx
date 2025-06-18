import React from "react";
import { motion } from "framer-motion";

export default function Title({ children, style = {} }) {
  // Responsive override
  const responsiveFontSize = window.innerWidth < 768
    ? "clamp(36px, 10vw, 64px)"
    : "clamp(56px, 8vw, 128px)";

  return (
    <motion.h1
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
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
    </motion.h1>
  );
}
