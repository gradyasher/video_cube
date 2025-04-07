// src/pages/Shop.jsx
import React from "react";
import { Link } from "react-router-dom";
import ShopScene from "../components/ShopScene";
import TitleOverlay from "../components/TitleOverlay";

const products = [
  {
    id: 1,
    name: "glitch tee",
    price: "$29",
    image: "/assets/glitch-tee.png",
    link: "https://your-shop-link.com",
  },
  {
    id: 2,
    name: "sticker pack",
    price: "$8",
    image: "/assets/sticker-pack.png",
    link: "https://your-shop-link.com",
  },
];

export default function Shop() {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ShopScene />
      <div
        style={{
          position: "absolute",
          top: "5vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <TitleOverlay text="shop." />
      </div>

      <Link to="/" style={{ marginTop: "3rem", color: "#0ff", fontSize: "1.25rem" }}>
        ← back to home
      </Link>
    </div>
  );
}
