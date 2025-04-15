// src/components/PopoutCart.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function PopoutCart({ onClose, isCartOpen }) {
  const { cart, removeItem, fetchCart, updateItemQuantity, isOffline } = useCartContext();
  const [cartLines, setCartLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cart) {
      setLoading(true);
      fetchCart().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [cart, fetchCart]);

  useEffect(() => {
    if (cart?.lines?.edges) {
      setCartLines(cart.lines.edges);
    }
  }, [cart]);

  return (
    <>
      {isOffline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            background: "#ff5555",
            color: "#fff",
            textAlign: "center",
            padding: "0.5rem",
            zIndex: 9999,
            fontFamily: "monospace",
            fontSize: "0.9rem"
          }}
        >
          you're offline – actions are disabled
        </div>
      )}

      <motion.div
        key="cart"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
          fontFamily: "Helvetica, sans-serif",
          display: isCartOpen ? "flex" : "none",
          flexDirection: "column",
          gap: "1.5rem",
          backdropFilter: "blur(10px)",
          borderLeft: "2px solid #ccff00",
          overflowY: "auto",
          zIndex: 1000,
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

        {loading ? (
          <p>loading...</p>
        ) : cartLines.length === 0 ? (
          <p>your cart is empty.</p>
        ) : (
          cartLines.map(({ node }) => (
            <div key={node.id} style={{ marginBottom: "1rem" }}>
              <div>
                {node.merchandise.product.title} – {node.merchandise.title}

                <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                  <button
                    onClick={() => updateItemQuantity(node.id, node.quantity - 1)}
                    disabled={isOffline || node.quantity <= 1}
                    style={{ marginRight: "0.5rem", padding: "0.2rem 0.6rem" }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: "1.5rem", textAlign: "center" }}>{node.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(node.id, node.quantity + 1)}
                    disabled={isOffline}
                    style={{ marginLeft: "0.5rem", padding: "0.2rem 0.6rem" }}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeItem(node.id)}
                disabled={isOffline}
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

        {cartLines.length === 0 ? (
          <button
            disabled
            style={{
              background: "#333",
              color: "#777",
              border: "none",
              padding: "1rem",
              fontSize: "1rem",
              borderRadius: "1rem",
              fontWeight: "bold",
              position: "fixed",
              bottom: "5em",
              right: "2rem",
              left: "2rem",
              cursor: "not-allowed",
              opacity: 0.5,
            }}
          >
            checkout
          </button>
        ) : (
          <button
            onClick={() => navigate("/checkout")}
            disabled={isOffline}
            style={{
              background: isOffline ? "#333" : "#00fff7",
              color: isOffline ? "#777" : "#000",
              border: "none",
              padding: "1rem",
              fontSize: "1rem",
              borderRadius: "1rem",
              fontWeight: "bold",
              position: "fixed",
              bottom: "5em",
              right: "2rem",
              left: "2rem",
              cursor: isOffline ? "not-allowed" : "pointer",
              boxShadow: isOffline ? "none" : "0 0 15px #00fff7",
              opacity: isOffline ? 0.6 : 1,
            }}
          >
            checkout
          </button>

        )}
      </motion.div>
    </>
  );
}
