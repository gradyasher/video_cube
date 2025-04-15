import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductScene from "../components/ProductScene";
import TitleOverlay from "../components/TitleOverlay";
import { useCartContext } from "../context/CartContext";
import { isVariantAvailable, getVariantDetails } from "../utils/shopifyUtils";
import { variantMap } from "../utils/variantMap";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ProductPage({ openCart }) {
  const query = useQuery();
  const modelParam = query.get("model");
  const decodedModel = decodeURIComponent(modelParam);

  const { cartCount, addItem, cart, isOffline } = useCartContext();

  const [productInfo, setProductInfo] = useState(null);

  const variantId = variantMap[decodedModel]?.variantId;

  useEffect(() => {
    const fetchInfo = async () => {
      if (!variantId) return;

      try {
        const variant = await getVariantDetails(variantId);
        setProductInfo({
          name: variant.product.title,
          price: `$${parseFloat(variant.price.amount).toFixed(2)}`,
        });
      } catch (err) {
        console.error("❌ Error fetching variant details:", err);
      }
    };

    fetchInfo();
  }, [variantId]);

  const handleAddToCart = async () => {
    if (!variantId) {
      alert("Sorry, this product is not available.");
      return;
    }

    const available = await isVariantAvailable(variantId);
    if (!available) {
      alert("Sorry, this product is currently out of stock.");
      return;
    }

    try {
      await addItem(variantId);
      openCart();
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("There was a problem adding this item to your cart.");
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {isOffline && (
        <div
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            background: "#ff5555",
            color: "#fff",
            textAlign: "center",
            padding: "0.5rem",
            zIndex: 9999,
            fontFamily: "monospace",
            fontSize: "0.9rem",
          }}
        >
          you're offline – cart actions are disabled
        </div>
      )}

      <Link
        to="/shop"
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          color: "#0ff",
          fontSize: "1.1rem",
          fontFamily: "monospace",
          textDecoration: "none",
          textTransform: "lowercase",
          background: "transparent",
          border: "none",
          padding: "0.4rem 0.75rem",
          borderRadius: "0.5rem",
          transition: "all 0.2s ease",
          zIndex: 30,
        }}
      >
        ← back to catalog
      </Link>

      <ProductScene key={decodedModel} initialModel={decodedModel} />

      <button
        onClick={openCart}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#CCDE01",
          color: "#000",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 30,
        }}
      >
        cart ({cartCount})
      </button>

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

      {/* 🧾 product name + price */}
      {productInfo && (
        <div
          style={{
            position: "absolute",
            bottom: "8.5rem",
            width: "100%",
            textAlign: "center",
            zIndex: 20,
            fontFamily: "monospace",
            fontSize: "1rem",
            color: "#fff",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>{productInfo.name}</p>
          <p style={{ color: "#CCDE01" }}>{productInfo.price}</p>
        </div>
      )}

      {/* 🛒 add to cart button */}
      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <button
          onClick={handleAddToCart}
          disabled={isOffline}
          style={{
            fontSize: "1.25rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: isOffline ? "#444" : "#CCDE01",
            color: isOffline ? "#999" : "#000",
            border: "none",
            borderRadius: "8px",
            cursor: isOffline ? "not-allowed" : "pointer",
            boxShadow: isOffline ? "none" : "0 0 10px #CCDE01",
            opacity: isOffline ? 0.6 : 1,
          }}
        >
          add to cart
        </button>
      </div>
    </div>
  );
}
