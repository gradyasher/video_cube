import React, { useState } from "react";

const menuItems = [
  "/assets/a b o u t_processed.png",
  "/assets/d i s c o r d_processed.png",
  "/assets/s h o p_processed.png",
  "/assets/s i g n a l_processed.png",
  "/assets/s t r e a m_processed.png",
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

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
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontFamily: "monospace",
          background: "transparent",
          border: "none",
          borderRadius: "6px",
          color: "#CCDE01",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {isOpen ? "×" : "☰"}
      </button>

      {isOpen && (
        <div style={{ marginTop: "2vh", display: "flex", flexDirection: "column", gap: "10px" }}>
          {menuItems.map((src, i) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
