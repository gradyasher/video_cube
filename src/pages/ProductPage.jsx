import { React, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductScene from "../components/ProductScene";
import TitleOverlay from "../components/TitleOverlay";
import useShopifyCart from "../hooks/useShopifyCart";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// 🔁 mock map from model to Shopify variant IDs
const variantMap = {
  "/models/2troofz.glb": {
    S: "gid://shopify/ProductVariant/43223548821643",
    M: "gid://shopify/ProductVariant/43223548854411",
    L: "gid://shopify/ProductVariant/43223548887179",
  },
  "/models/allover2.glb": {
    S: "gid://shopify/ProductVariant/43223745527947",
    M: "gid://shopify/ProductVariant/43223745593483",
    L: "gid://shopify/ProductVariant/43223745659019",
  },
  "/models/hoodie1.glb": {
    L: "gid://shopify/ProductVariant/43223983325323",
  },
};

export default function ProductPage({ openCart }) {
  const query = useQuery();
  const modelParam = query.get("model");
  const decodedModel = decodeURIComponent(modelParam);
  const [selectedSize, setSelectedSize] = useState("L");

  const { addItem } = useShopifyCart();

  const handleBuy = async () => {
    const sizeMap = variantMap[decodedModel];
    const variantId = sizeMap?.[selectedSize];

    if (!variantId) {
      alert("Sorry, no variant found for this size.");
      return;
    }

    try {
      await addItem(variantId);
      openCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("There was a problem starting checkout.");
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ProductScene initialModel={decodedModel} />

      {/* 🛒 cart button in top-right */}
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
        cart
      </button>

      {/* overlay title */}
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
        <Link to="/" style={{ color: "#0ff", fontSize: "1.25rem" }}>
          ← back to home
        </Link>
        <TitleOverlay text="shop." />
      </div>

      {/* back + buy buttons */}
      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          zIndex: 20,
        }}
      >
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          style={{
            fontSize: "1.25rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
        </select>

        <button
          onClick={handleBuy}
          style={{
            fontSize: "1.25rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#CCDE01",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          buy now
        </button>
      </div>
    </div>
  );
}
