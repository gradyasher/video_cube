import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/base";
import "../styles/StreamPage.css";

const streamingLinks = [
  {
    name: "Spotify",
    url: "https://open.spotify.com/album/4p8NCRupG0VuCJHYSVirSY?referral=labelaffiliate&utm_source=1101lBjms5iQ&utm_medium=Indie_Distrokid&utm_campaign=labelaffiliate",
    icon: BASE_URL + "icons/spotify.svg",
  },
  {
    name: "Apple Music",
    url: "https://music.apple.com/us/album/cliq-b8-ep/1787129382",
    icon: BASE_URL + "icons/applemusic.svg",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@dgenr8music",
    icon: BASE_URL + "icons/youtube.svg",
  },
  {
    name: "SoundCloud",
    url: "https://soundcloud.com/dgenrnation/i-use-2-b-like-u?si=11080ce4db50467d827a6f1ae9c4fcf3&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    icon: BASE_URL + "icons/soundcloud.svg",
  },
];

export default function StreamPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="stream-container">
      <div className={`overlay fade-start ${visible ? "fade-in" : ""}`}>
        <h1 className="stream-title">stream dgenr8 music.</h1>

        <div className="stream-buttons">
          {streamingLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`stream-button fade-start ${visible ? `fade-in delayed-${i}` : ""}`}
            >
              <img src={link.icon} alt={link.name} className="stream-icon" />
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
