import React, { useState } from "react";
import { Link } from "react-router-dom";

const menuItems = [
  { src: "/assets/a b o u t_processed.png", link: null },
  { src: "/assets/d i s c o r d_processed.png", link: null },
  { src: "/assets/s h o p_processed.png", link: "/shop" },   // 👈 add link here
  { src: "/assets/s i g n a l_processed.png", link: null },
  { src: "/assets/s t r e a m_processed.png", link: null },
];

export default function HamburgerMenu({ isOpen, setIsOpen }) {
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div
      style={{
        position: "absolute",
        top: "2vh",
        right: "2vw",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <button
        onClick={toggleMenu}
        aria-label="Toggle menu"
        style={{
          all: "unset",
          cursor: "pointer",
        }}
      >
        <img
          src={isOpen ? "/assets/x_processed.png" : "/assets/hambrgr_processed.png"}
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
        </div>
      )}
    </div>
  );
}
