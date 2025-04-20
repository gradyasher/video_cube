// /components/InstagramShareButton.jsx
import React from "react";
import { motion } from "framer-motion";

const isMobile = () => /iphone|ipad|android/i.test(navigator.userAgent);

const InstagramShareButton = ({ videoUrl, stickerUrl }) => {
  const igShareUrl = `instagram://story-camera?media=${encodeURIComponent(
    videoUrl
  )}&sticker_url=${encodeURIComponent(stickerUrl)}`;

  const handleIGShare = () => {
    if (isMobile()) {
      window.location.href = igShareUrl;
    } else {
      alert("Instagram Story sharing only works on mobile devices.");
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <button
        onClick={handleIGShare}
        className="px-4 py-2 rounded-2xl shadow-lg bg-white text-black text-lg hover:scale-105 transition"
      >
        📲 Share to Instagram Story
      </button>
      <a
        href={videoUrl}
        download
        className="text-sm underline text-white hover:opacity-80"
      >
        Or download & upload manually
      </a>
    </motion.div>
  );
};

export default InstagramShareButton;
