import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/soundbath.png";

export default function LoadingScreen({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <motion.img
            src={logo}
            alt="soundbath logo"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              width: "clamp(100px, 25vw, 300px)",
              height: "auto",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
