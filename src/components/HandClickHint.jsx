import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HandClickHint({ show }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => setShouldRender(false), 4000); // visible for 4s
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.img
          key="hand"
          src="/assets/win95-hand.png"
          alt="Click hint"
          initial={{ opacity: 0, x: 40, y: 40, scale: 1 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: 0,
            y: 0,
            scale: [1, 0.85, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.5, 0.75, 1],
            },
            x: {
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.5,
            },
            y: {
              duration: 2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.5,
            },
            scale: {
              delay: 2.1  , // right after the movement ends
              duration: 0.5,
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            top: "45%",
            left: "48%", // shift it a little left
            transform: "translate(-50%, -50%) rotate(-25deg)", // rotate hand for natural angle
            width: "160px",
            height: "auto",
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}
