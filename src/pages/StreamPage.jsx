import React from "react";
import { motion } from "framer-motion";
import "./StreamPage.css";

const streamingLinks = [
  {
    name: "Spotify",
    url: "https://open.spotify.com/album/4p8NCRupG0VuCJHYSVirSY?referral=labelaffiliate&utm_source=1101lBjms5iQ&utm_medium=Indie_Distrokid&utm_campaign=labelaffiliate",
    icon: {import.meta.env.BASE_URL + "icons/spotify.svg"},
  },
  {
    name: "Apple Music",
    url: "https://music.apple.com/us/album/cliq-b8-ep/1787129382",
    icon: {import.meta.env.BASE_URL + "icons/applemusic.svg" },
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@dgenr8music",
    icon: {import.meta.env.BASE_URL + "icons/youtube.svg"},
  },
  {
    name: "SoundCloud",
    url: "https://soundcloud.com/dgenrnation/i-use-2-b-like-u?si=11080ce4db50467d827a6f1ae9c4fcf3&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    icon: {import.meta.env.BASE_URL + "icons/soundcloud.svg"},
  },
];

export default function StreamPage() {
  return (
    <div className="stream-container">

      <motion.div
        className="overlay"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.8,
              ease: "easeOut",
              when: "beforeChildren",
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <motion.h1
          className="stream-title"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          stream dgenr8 music.
        </motion.h1>

        <div className="stream-buttons">
          {streamingLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="stream-button"
              whileHover={{
                scale: 1.1,
                filter: "contrast(150%) hue-rotate(20deg)",
              }}
              whileTap={{ scale: 0.95 }}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3 }}
            >
              <img src={link.icon} alt={link.name} className="stream-icon" />
              <span>{link.name}</span>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="footer-nav"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <a href="/">← back to home</a>
        </motion.div>
      </motion.div>
    </div>
  );
}
