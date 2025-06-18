import React from "react";
import { motion } from "framer-motion";
import "./DiscordPage.css";
import { BASE_URL } from "../utils/base";

export default function DiscordPage() {
  const base = BASE_URL;

  return (
    <div className="discord-container">
      <motion.div
        className="discord-overlay"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="discord-title">join the dgenr8 cult.🧬</h1>
        <p className="discord-sub">
          glitch readings, unreleased music, cursed memes & real ones
        </p>

        <a
          href="https://discord.gg/RUrmrHYq"
          target="_blank"
          rel="noopener noreferrer"
          className="discord-cta"
        >
          join discord
        </a>

        <div className="footer-nav">
          <a href="/">← back to home</a>
        </div>
      </motion.div>
    </div>
  );
}
