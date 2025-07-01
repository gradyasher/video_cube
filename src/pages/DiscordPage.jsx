import React, { useEffect, useState } from "react";
import "../styles/DiscordPage.css";
import { BASE_URL } from "../utils/base";

export default function DiscordPage() {
  const base = BASE_URL;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10); // triggers transition
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="discord-container">
      <div className={`discord-overlay fade-start ${visible ? "fade-in" : ""}`}>
        <h1 className="discord-title">join the dgenr8 cult.🧬</h1>
        <p className="discord-sub">
          glitch readings, unreleased music, cursed memes & real ones
        </p>

        <a
          href="https://discord.gg/F6e59NURah"
          target="_blank"
          rel="noopener noreferrer"
          className="discord-cta"
        >
          join discord
        </a>
      </div>
    </div>
  );
}
