import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { variantMap } from "../utils/variantMap";
import { BASE_URL } from "../utils/base";

export default function Catalog({ shopifyProducts }) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  const preferredSizes = ["L", "XL", "M", "S"];

  const products = Object.entries(variantMap).map(([model, val]) => {
    const variantId = preferredSizes.map((size) => val.variants[size]).find(Boolean);
    if (!variantId) return null;

    const matchingProduct = shopifyProducts.find((p) => p.id === variantId);
    if (!matchingProduct) return null;

    return {
      id: matchingProduct.id,
      name: matchingProduct.title || matchingProduct.name, // just in case
      price: matchingProduct.price,
      model,
      image: val.image || BASE_URL + "assets/placeholder.png",
    };
  }).filter(Boolean);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "2rem",
          padding: "2rem",
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index * 0.1,
            }}
            onClick={() =>
              navigate(`/shop/view?model=${encodeURIComponent(product.model)}`)
            }
            style={{
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                position: "relative",
                marginBottom: "1rem",
                backgroundColor: "transparent",
                backdropFilter: "blur(2px)",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                onLoad={() => setLoaded(true)}
                style={{
                  opacity: loaded ? 1 : 0,
                  transition: "opacity 0.4s ease-in-out",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
            <p style={{ color: "#CCDE01", fontSize: "1.1rem" }}>{product.name}</p>
            <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{product.price}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
