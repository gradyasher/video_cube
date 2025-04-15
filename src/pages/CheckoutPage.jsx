import React, { useState, useEffect } from "react";
import { useCartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { getVariantDetails } from "../utils/shopifyUtils";
import { variantMap } from "../utils/variantMap";


export default function CheckoutPage() {
  const { cart, isOffline } = useCartContext();
  const [detailedItems, setDetailedItems] = useState([]);

  useEffect(() => {
    // scrub anything leftover on body
    const rogue = document.querySelector(".popout-cart, [data-popout], .framer-popout");
    if (rogue) {
      rogue.remove(); // 🔪 kill it with love
    }
  }, []);

  useEffect(() => {
    async function fetchDetails() {
      const lines = cart?.lines?.edges || [];
      console.log("🧺 cart lines:", lines);
      const enriched = await Promise.all(
        lines
          .filter(({ node }) => {
            const m = node?.merchandise;
            const isValid = m && m.id && typeof m.id === "string";
            if (!isValid) console.warn("❌ Skipping invalid node:", node);
            return isValid;
            })

          .map(async ({ node }) => {
            const details = await getVariantDetails(node.merchandise.id);
            const image = (() => {
              for (const entry of Object.values(variantMap)) {
                for (const size in entry.variants) {
                  if (entry.variants[size] === node.merchandise.id) {
                    return entry.image;
                  }
                }
              }
              return null;
            })();

            return {
              quantity: node.quantity,
              title: details?.product?.title || "Unknown product",
              variantTitle: details?.title || "",
              price: details?.price?.amount || "0.00",
              currency: details?.price?.currencyCode || "USD",
              image,
            };

          })
      );
      setDetailedItems(enriched);
    }

    if (cart) fetchDetails();
  }, [cart]);

  const handleContinueToShopify = () => {
    if (!cart?.checkoutUrl || isOffline) return;
    window.location.href = cart.checkoutUrl;
  };

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
        ← back to shop
      </Link>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>ready to checkout?</h1>

      {detailedItems.length > 0 && (
        <div
          style={{
            margin: "2rem 0",
            padding: "1.5rem",
            border: "1px solid #444",
            borderRadius: "1rem",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            color: "#ccff00",
            fontFamily: "monospace",
            fontSize: "0.95rem",
            lineHeight: "1.5",
            maxWidth: "480px",
          }}
        >
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", color: "#ccff00" }}>
            your order:
          </h3>

          {detailedItems.map((item, index) => (
            <div key={index} style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}>

              {/* 📦 text on the left */}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                  {item.title} – {item.variantTitle}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#aaa" }}>
                  quantity: {item.quantity}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#aaa" }}>
                  unit price: ${parseFloat(item.price).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  <strong>
                    total: ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* 🖼 icon on the right */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: "64px",
                    height: "auto",
                    borderRadius: "0.35rem",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}

          <hr style={{ borderColor: "#333", margin: "1rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>subtotal:</strong>
            <span>
              ${detailedItems
                .reduce((acc, item) => acc + item.quantity * parseFloat(item.price), 0)
                .toFixed(2)}
            </span>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888" }}>
            taxes & shipping calculated at checkout
          </div>
        </div>
      )}

      {isOffline ? (
        <p style={{ color: "#999" }}>you're offline — reconnect to continue</p>
      ) : !cart?.lines?.edges?.length ? (
        <p style={{ color: "#999" }}>your cart is empty</p>
      ) : (
        <>
          <p style={{ maxWidth: "500px", marginBottom: "2rem", fontSize: "1.1rem" }}>
            you'll be redirected to our secure Shopify checkout to complete your order.
          </p>
          <button
            onClick={handleContinueToShopify}
            disabled={isOffline}
            style={{
              background: "#00fff7",
              color: "#000",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "1.25rem",
              borderRadius: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 0 15px #00fff7",
            }}
          >
            continue to checkout →
          </button>
        </>
      )}
    </div>
  );
}
