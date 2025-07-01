import React from "react";

export default function CartButton({ cartCount, openCart, isOffline = false }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        maxWidth: "calc(100vw - 2rem)",
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <button
        onClick={openCart}
        disabled={isOffline}
        style={{
          position: "fixed", // fixed makes it universal across routes
          top: "2.5vh",
          right: "1rem",
          zIndex: 9999,
          backgroundColor: isOffline ? "#444" : "#CCDE01",
          color: isOffline ? "#999" : "#000",
          border: "none",
          padding: "0.65rem 1.4rem",
          borderRadius: "2rem",
          fontWeight: "bold",
          fontSize: "1rem",
          fontFamily: "VCR, monospace",
          cursor: isOffline ? "not-allowed" : "pointer",
          opacity: isOffline ? 0.6 : 1,
          boxShadow: "0 0 12px #ccff00",
          textTransform: "lowercase",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        🛒 cart ({cartCount})
      </button>
    </div>
  );
}
