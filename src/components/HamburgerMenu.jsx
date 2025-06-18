import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/base";

const menuItems = [
  { src: BASE_URL + "assets/about_glow.png", link: "/about" },
  { src: BASE_URL + "assets/shop_glow.png", link: "/shop" },
  { src: BASE_URL + "assets/stream_glow.png", link: "/stream" },
  { src: BASE_URL + "assets/email_glow.png", link: "/email" },
  { src: BASE_URL + "assets/discord_glow.png", link: "/discord" }
];



export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false); // 🎉 internal again
  const navigate = useNavigate();

  const hasSpunSlotMachine = localStorage.getItem("hasSpun") === "true";
  const reward = localStorage.getItem("slotReward"); // e.g. "Glitch Reading"

  function handleVhsHoroscopeClick() {
    if (!hasSpunSlotMachine) {
      navigate("/mystery");
    } else if (reward === "Glitch Reading") {
      navigate("/glitch-reading");
    } else {
      alert("You didn’t win a glitch reading… but you can nominate a friend to spin.");
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "2vh",
        right: "2vw",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        style={{
          all: "unset",
          cursor: "pointer",
          pointerEvents: "auto",
        }}
      >
        <img
          src={
            BASE_URL +
            (isOpen ? "assets/x_processed.png" : "assets/hambrgr_processed.png")
          }
          alt={isOpen ? "Close menu" : "Open menu"}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 4px rgba(204, 222, 1, 0.7))",
          }}
        />
      </button>

      {isOpen && (
        <div style={{ marginTop: "2vh", display: "flex", flexDirection: "column", gap: "10px" }}>
          {menuItems.map(({ src, link }, i) => {
            const image = (
              <img
                key={i}
                src={src}
                alt={`menu item ${i}`}
                style={{
                  width: "clamp(90px, 10vw, 150px)",
                  height: "auto",
                  pointerEvents: "auto",
                  cursor: link ? "pointer" : "default",
                }}
              />
            );

            return link ? (
              <Link to={link} key={i}>
                {image}
              </Link>
            ) : (
              image
            );
          })}

          {/* 📼 vhs horoscope */}
          <img
            src={BASE_URL + "assets/VHS_horoscope_glow.png"}
            alt="vhs horoscope"
            onClick={handleVhsHoroscopeClick}
            style={{
              width: "clamp(90px, 10vw, 150px)",
              height: "auto",
              pointerEvents: "auto",
              cursor: "pointer",
            }}
          />
        </div>
      )}
    </div>
  );
}
