// src/components/PopoutCart.jsx

import React, { useState } from "react";
import useShopifyCart from "../hooks/useShopifyCart";

export default function PopoutCart({ onClose }) {
  const { cart, removeItem, fetchCart } = useShopifyCart();
  const [isOpen, setIsOpen] = useState(true);

  if (!cart) return null;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, zIndex: 100 }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          margin: "1rem",
          padding: "0.75rem 1.25rem",
          background: "#CCDE01",
          color: "#000",
          border: "none",
          borderRadius: "999px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {isOpen ? "Close Cart" : `🛒 Cart (${cart.lines.edges.length})`}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "clamp(300px, 40vw, 400px)",
            background: "rgba(0, 0, 0, 0.85)",
            color: "#ccff00",
            padding: "2rem",
            boxShadow: "0 0 25px #ccff00",
            zIndex: 1000,
            fontFamily: "Helvetica, sans-serif",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            backdropFilter: "blur(10px)",
            borderLeft: "2px solid #ccff00",
            overflowY: "auto",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "#ccde01",
              color: "#000",
              padding: "0.5rem 1rem",
              fontWeight: "bold",
              border: "none",
              borderRadius: "1rem",
              cursor: "pointer",
              boxShadow: "0 0 10px #ccde01",
              textTransform: "lowercase",
            }}
          >
            close
          </button>

          <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#ccff00" }}>your cart</h2>

          {cart.lines.edges.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.lines.edges.map(({ node }) => (
              <div key={node.id} style={{ marginBottom: "1rem" }}>
                <div>
                  {node.merchandise.product.title} – {node.merchandise.title} (x{node.quantity})
                </div>
                <button
                  onClick={() => removeItem(node.id)}
                  style={{
                    background: "transparent",
                    color: "#aaa",
                    border: "1px solid #555",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "normal",
                    textTransform: "lowercase",
                    marginTop: "0.5rem",
                  }}
                >
                  remove
                </button>
              </div>
            ))
          )}

          {cart.checkoutUrl && (
            <button
              onClick={() => (window.location.href = cart.checkoutUrl)}
              style={{
                background: "#00fff7",
                color: "#000",
                border: "none",
                padding: "1rem",
                fontSize: "1rem",
                borderRadius: "1rem",
                fontWeight: "bold",
                position: "absolute",
                bottom: "5em",
                right: "2rem",
                left: "2rem",
                cursor: "pointer",
                boxShadow: "0 0 15px #00fff7",
              }}
            >
              checkout
            </button>
          )}
        </div>
      )}
    </div>
  );
}
