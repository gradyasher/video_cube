import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function VideoClip({ src }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });

  return (
    <motion.video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      src={src}
      className="about-gif"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
}
