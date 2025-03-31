import React from "react";
import { motion } from "framer-motion";

export default function Dgenr8Title() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{
        fontFamily: "Helvetica, sans-serif",
        fontWeight: "400",
        fontSize: "clamp(56px, 11vw, 144px)",
        color: "#CCDE01",
        letterSpacing: "-0.12em",
        lineHeight: "1.2em",
        textAlign: "center",
        margin: 0,
        padding: 0,
      }}
    >
      Dgenr8.
    </motion.h1>
  );
}
