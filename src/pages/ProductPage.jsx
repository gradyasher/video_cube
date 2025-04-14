// src/components/ProductPage.jsx
import { React, useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductScene from "../components/ProductScene";
import TitleOverlay from "../components/TitleOverlay";
import { useCartContext } from "../context/CartContext";


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
  const [ selectedSize, setSelectedSize] = useState("L");
  const { cartCount, addItem, removeItem, cart } = useCartContext();

  const itemCount = cart?.lines?.edges?.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0;

  useEffect(() => {
    setSelectedSize("L"); // reset or update size if needed
  }, [modelParam]);

  const handleAddToCart = async () => {
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
      alert("There was a problem adding the item to your cart.");
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ProductScene key={decodedModel} initialModel={decodedModel} />

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
        cart ({ cartCount })
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
        <TitleOverlay text="shop." />
      </div>

      {/* size select + add to cart button */}
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
          onClick={handleAddToCart}
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
          add to cart
        </button>

      </div>
    </div>
  );
}
