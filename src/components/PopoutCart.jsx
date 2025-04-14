// src/components/PopoutCart.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCartContext } from "../context/CartContext";

export default function PopoutCart({ onClose, isCartOpen }) {
  const { cart, removeItem, fetchCart, updateItemQuantity } = useCartContext();
  const [cartLines, setCartLines] = useState([]);
  const [updatingLineId, setUpdatingLineId] = useState(null);
  const [loading, setLoading] = useState(true);


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
        display: isCartOpen ? "flex" : "none", // ⬅ only for screen readers; animation still works
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
                  onClick={async () => {
                    setUpdatingLineId(node.id);
                    await updateItemQuantity(node.id, node.quantity - 1);
                    setUpdatingLineId(null);
                  }}
                  disabled={node.quantity <= 1 || updatingLineId === node.id}
                  style={{
                    width: "2rem",
                    height: "2rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    backgroundColor: "#111",
                    color: "#ccff00",
                    border: "1px solid #555",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.2s ease",
                    opacity: updatingLineId === node.id ? 0.6 : 1,
                  }}

                >
                  -
                </button>
                <span
                  style={{
                  width: "2rem",
                  textAlign: "center",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "#fff",
                }}

                >
                  {node.quantity}
                </span>
                <button
                  onClick={async () => {
                    setUpdatingLineId(node.id);
                    await updateItemQuantity(node.id, node.quantity + 1);
                    setUpdatingLineId(null);
                  }}
                  disabled={updatingLineId === node.id}
                  style={{
                    width: "2rem",
                    height: "2rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    backgroundColor: "#111",
                    color: "#ccff00",
                    border: "1px solid #555",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.2s ease",
                    opacity: updatingLineId === node.id ? 0.6 : 1,
                  }}

                >
                  +
                </button>
              </div>
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
          onClick={() => (window.location.href = cart.checkoutUrl)}
          style={{
            background: "#00fff7",
            color: "#000",
            border: "none",
            padding: "1rem",
            fontSize: "1rem",
            borderRadius: "1rem",
            fontWeight: "bold",
            position: "fixed",
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


    </motion.div>
  );
}
