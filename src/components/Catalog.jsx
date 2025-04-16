import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { shopifyFetch } from "../utils/shopifyClient";
import { variantMap } from "../utils/variantMap";

export default function Catalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const variantIds = Object.values(variantMap)
        .map((item) => {
          const firstAvailableId = Object.values(item.variants)[0]; // pick first available variant
          return `"${firstAvailableId}"`;
        })
        .filter(Boolean);

      const query = `
        {
          nodes(ids: [${variantIds.join(",")}]) {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
              }
            }
          }
        }
      `;

      try {
        const data = await shopifyFetch(query); // ✅ fetch data
        const productData = data.nodes.map((variant) => {
          const modelEntry = Object.entries(variantMap).find(
            ([, val]) =>
              Object.values(val.variants).includes(variant.id)
          );

          const modelPath = modelEntry?.[0];
          const image = modelEntry?.[1]?.image;

          return {
            id: variant.id,
            name: variant.product.title,
            price: `$${parseFloat(variant.price.amount).toFixed(2)}`,
            model: modelPath,
            image,
          };
        });


        setProducts(productData);
      } catch (err) {
        console.error("❌ Failed to load products:", err);
      }
    };

    fetchProducts();
  }, []);

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
