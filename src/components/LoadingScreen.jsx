import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ isLoading }) {

  return (

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            {/* flicker effect */}
            <motion.div
              animate={{
                opacity: [0.2, 0.75, 0.4, 0.85, 0.3, 0.6, 0.25, 0.8, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear", // feels more abrupt than easeInOut
                times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.72, 0.85, 1], // irregular timing
              }}
              style={{
                position: "absolute",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)",
                filter: "blur(8px)",
                boxShadow: "0 0 80px rgba(255, 255, 255, 0.08)",
                zIndex: 0,
              }}
            />

            {/* logo */}
            <motion.img
              src="/assets/soundbath.png"
              alt="soundbath logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.7, 0.4, 0.8, 0.2] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.6,
                times: [0, 0.4, 0.7, 1],
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)",
                filter: "blur(8px)",
                boxShadow: "0 0 60px rgba(255, 255, 255, 0.08)",
                zIndex: 0,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
  );
}
