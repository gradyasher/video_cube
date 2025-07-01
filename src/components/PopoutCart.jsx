import React, { useEffect, useState } from "react";
import { useCartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/PopoutCart.css"; // create this file

export default function PopoutCart({ onClose, isCartOpen }) {
  const { cart, removeItem, fetchCart, updateItemQuantity, isOffline } = useCartContext();
  const [cartLines, setCartLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
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

  useEffect(() => {
    if (isCartOpen) {
      setShowPanel(true);
    } else {
      const timeout = setTimeout(() => setShowPanel(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isCartOpen]);

  return (
    <>
      {isOffline && (
        <div className="offline-banner">you're offline – actions are disabled</div>
      )}

      {showPanel && (
        <div className={`cart-panel ${isCartOpen ? "slide-in" : "slide-out"}`}>
          <button className="close-btn" onClick={onClose}>close</button>

          <h2 className="cart-title">your cart</h2>

          {loading ? (
            <p>loading...</p>
          ) : cartLines.length === 0 ? (
            <p>your cart is empty.</p>
          ) : (
            cartLines.map(({ node }) => (
              <div key={node.id} className="cart-item">
                <div>
                  {node.merchandise.product.title} – {node.merchandise.title}
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateItemQuantity(node.id, node.quantity - 1)}
                      disabled={isOffline || node.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{node.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(node.id, node.quantity + 1)}
                      disabled={isOffline}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(node.id)}
                  disabled={isOffline}
                >
                  remove
                </button>
              </div>
            ))
          )}

          {cartLines.length === 0 ? (
            <button className="checkout-btn disabled" disabled>checkout</button>
          ) : (
            <button
              className={`checkout-btn ${isOffline ? "disabled" : ""}`}
              onClick={() => navigate("/checkout")}
              disabled={isOffline}
            >
              checkout
            </button>
          )}
        </div>
      )}
    </>
  );
}
