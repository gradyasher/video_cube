import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HandClickHint() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000); // show for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.img
          key="hand"
          src="/assets/win95-hand.png"
          alt="Click hint"
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, 5, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: 1,
            repeatDelay: 0.5,
          }}
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40px",
            height: "auto",
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}
