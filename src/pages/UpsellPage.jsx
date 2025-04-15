// src/pages/UpsellPage.jsx

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function UpsellPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        background: "#000",
        color: "#ccff00",
        fontFamily: "Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3rem 1rem",
        textAlign: "center",
      }}
    >
      <Link
        to="/shop"
        style={{
          color: "#0ff",
          fontSize: "1rem",
          fontFamily: "monospace",
          marginBottom: "2rem",
          textDecoration: "none",
          textTransform: "lowercase",
        }}
      >
        ← back to catalog
      </Link>

      <h1 style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>ready to check out?</h1>
      <p style={{ fontSize: "1.1rem", maxWidth: "400px", marginBottom: "2rem" }}>
        when you're ready, let's review your order and make sure everything looks good.
      </p>

      <motion.img
        src="/assets/thumbnails/stickers.png"
        alt="checkout illustration"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glow-img"
        style={{
          width: "260px",
          maxWidth: "80vw",
          margin: "2rem auto",
          display: "block",
          transform: "rotate(-3deg)",
        }}
      />

      <button
        onClick={() => navigate("/checkout")}
        style={{
          background: "#00fff7",
          color: "#000",
          border: "none",
          padding: "1rem 2rem",
          fontSize: "1.1rem",
          borderRadius: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 0 15px #00fff7",
        }}
      >
        go to checkout →
      </button>
    </div>
  );
}
